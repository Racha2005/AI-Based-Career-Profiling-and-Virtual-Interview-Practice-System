from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import psycopg2, psycopg2.extras
import bcrypt, jwt, datetime, os, json, re

app = FastAPI(title="MockMate AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "mockmate_secret_2025_v2"
ALGORITHM  = "HS256"
security   = HTTPBearer()

# ── YOUR CREDENTIALS ────────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DB_CONFIG = {
    "host":     "localhost",
    "database": "mockmate",
    "user":     "postgres",
    "password": "rachana",
    "port":     5432,
}
# ────────────────────────────────────────────────────────────────────────────

try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    OPENAI_AVAILABLE = True
except Exception:
    OPENAI_AVAILABLE = False

# ── DATABASE ─────────────────────────────────────────────────────────────────
def get_db():
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS resumes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            filename TEXT,
            content TEXT,
            skills TEXT[],
            uploaded_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS interviews (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            topic VARCHAR(200),
            questions JSONB,
            answers JSONB DEFAULT '[]',
            score INTEGER DEFAULT 0,
            feedback TEXT DEFAULT '',
            taken_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            strengths TEXT DEFAULT '',
            weaknesses TEXT DEFAULT '',
            suggestions TEXT DEFAULT '',
            overall_score INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(20),
            message TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    conn.commit(); cur.close(); conn.close()

try:
    init_db()
    print("✅ Database ready")
except Exception as e:
    print(f"⚠  DB warning: {e}")

# ── AUTH HELPERS ─────────────────────────────────────────────────────────────
def create_token(user_id: int, email: str):
    payload = {
        "user_id": user_id,
        "email":   email,
        "exp":     datetime.datetime.utcnow() + datetime.timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ── SCHEMAS ───────────────────────────────────────────────────────────────────
class RegisterReq(BaseModel):
    name: str
    email: str
    password: str

class LoginReq(BaseModel):
    email: str
    password: str

class ChatReq(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class InterviewCreateReq(BaseModel):
    topic: str
    num_questions: int = 5

class InterviewSubmitReq(BaseModel):
    interview_id: int
    answers: List[str]

# ── AUTH ROUTES ───────────────────────────────────────────────────────────────
@app.post("/api/register")
def register(req: RegisterReq, db=Depends(get_db)):
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id FROM users WHERE email=%s", (req.email,))
    if cur.fetchone():
        raise HTTPException(400, "Email already registered")
    h = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    cur.execute(
        "INSERT INTO users (name,email,password_hash) VALUES (%s,%s,%s) RETURNING id,name,email",
        (req.name, req.email, h)
    )
    u = cur.fetchone(); db.commit()
    return {"token": create_token(u["id"], u["email"]),
            "user": {"id": u["id"], "name": u["name"], "email": u["email"]}}

@app.post("/api/login")
def login(req: LoginReq, db=Depends(get_db)):
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users WHERE email=%s", (req.email,))
    u = cur.fetchone()
    if not u or not bcrypt.checkpw(req.password.encode(), u["password_hash"].encode()):
        raise HTTPException(401, "Invalid email or password")
    return {"token": create_token(u["id"], u["email"]),
            "user": {"id": u["id"], "name": u["name"], "email": u["email"]}}

@app.get("/api/me")
def get_me(payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id,name,email,created_at FROM users WHERE id=%s", (payload["user_id"],))
    u = cur.fetchone()
    if not u: raise HTTPException(404, "User not found")
    return u

# ── RESUME ROUTES ─────────────────────────────────────────────────────────────
@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...), payload=Depends(verify_token), db=Depends(get_db)):
    content = await file.read()
    
    # Try PDF extraction first
    if file.filename.lower().endswith('.pdf'):
        try:
            import io
            import re as _re
            # Extract readable text from PDF binary
            raw = content.decode("latin-1", errors="ignore")
            # Pull text between stream markers
            text_parts = _re.findall(r'BT(.*?)ET', raw, _re.DOTALL)
            text = ' '.join(text_parts)
            # If too short, fallback to raw decode
            if len(text.strip()) < 50:
                text = content.decode("utf-8", errors="ignore")
        except Exception:
            text = content.decode("utf-8", errors="ignore")
    else:
        text = content.decode("utf-8", errors="ignore")
    skills_kw = ["python","java","javascript","react","node","sql","machine learning",
                 "deep learning","data analysis","excel","aws","docker","git","html","css",
                 "fastapi","django","flask","tensorflow","pytorch","nlp","pandas","numpy",
                 "mongodb","redis","kubernetes","typescript","c++","c#","php","swift","kotlin"]
    # Remove invalid null characters
    text = text.replace("\x00", "")
    
    found = [s for s in skills_kw if s in text.lower()]
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "INSERT INTO resumes (user_id,filename,content,skills) VALUES (%s,%s,%s,%s) RETURNING id",
        (payload["user_id"], file.filename, text[:5000], found)
    )
    rid = cur.fetchone()["id"]; db.commit()
    return {"message": "Resume uploaded & analyzed!", "skills": found, "resume_id": rid}

@app.get("/api/resume/latest")
def get_latest(payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM resumes WHERE user_id=%s ORDER BY uploaded_at DESC LIMIT 1", (payload["user_id"],))
    return cur.fetchone() or {}

# ── INTERVIEW ROUTES ──────────────────────────────────────────────────────────
def generate_questions(topic: str, n: int):
    if OPENAI_AVAILABLE:
        try:
            r = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role":"user","content":
                    f"Generate exactly {n} interview questions for topic: {topic}. "
                    f"Return ONLY a JSON array of strings. No markdown, no extra text."}],
                max_tokens=600
            )
            raw = re.sub(r"```json|```","", r.choices[0].message.content.strip())
            return json.loads(raw)
        except Exception as e:
            print(f"OpenAI error: {e}")
    return [
        f"Can you introduce yourself and explain your experience with {topic}?",
        f"What are the core principles of {topic} that you consider most important?",
        f"Describe a challenging project where you applied {topic} skills. What was the outcome?",
        f"How do you stay updated with the latest developments in {topic}?",
        f"Where do you see yourself growing in {topic} over the next 2 years?",
    ][:n]

@app.post("/api/interview/create")
def create_interview(req: InterviewCreateReq, payload=Depends(verify_token), db=Depends(get_db)):
    questions = generate_questions(req.topic, req.num_questions)
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "INSERT INTO interviews (user_id,topic,questions,answers) VALUES (%s,%s,%s,%s) RETURNING id",
        (payload["user_id"], req.topic, json.dumps(questions), json.dumps([]))
    )
    iid = cur.fetchone()["id"]; db.commit()
    return {"interview_id": iid, "topic": req.topic, "questions": questions}

@app.post("/api/interview/submit")
def submit_interview(req: InterviewSubmitReq, payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(
        "SELECT * FROM interviews WHERE id=%s AND user_id=%s",
        (req.interview_id, payload["user_id"])
    )

    iv = cur.fetchone()

    if not iv:
        raise HTTPException(404, "Interview not found")

    qs = iv["questions"]

    combined = "\n".join([
        f"Q{i+1}: {qs[i]}\nA{i+1}: {req.answers[i]}"
        for i in range(min(len(qs), len(req.answers)))
    ])

    result = {
        "score": 0,
        "strengths": "Good attempt and participation in the interview.",
        "weaknesses": "Answers could be more detailed and technically stronger.",
        "suggestions": "Practice communication skills and technical concepts regularly.",
        "overall_feedback": "This was a useful practice session. Keep improving with more mock interviews."
    }

    if OPENAI_AVAILABLE:
        try:
            r = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "user",
                    "content": f"""
You are an expert AI interview evaluator.

Evaluate these interview questions and answers carefully.

Interview Q&A:
{combined}

Scoring Rules:
- Excellent answers: 85-100
- Good answers: 70-84
- Average answers: 50-69
- Poor answers: 20-49
- No answer: 0

Evaluate based on:
1. Technical correctness
2. Communication quality
3. Confidence and clarity
4. Completeness of answer

Return ONLY valid JSON in this format:

{{
  "score": 0,
  "strengths": "text",
  "weaknesses": "text",
  "suggestions": "text",
  "overall_feedback": "text"
}}

No markdown.
"""
                }],
                max_tokens=600
            )

            raw = re.sub(r"```json|```", "", r.choices[0].message.content.strip())

            result = json.loads(raw)

            print("OPENAI RESULT =", result)

        except Exception as e:
            print(f"OpenAI eval error: {e}")

    if not req.answers or all(not a.strip() for a in req.answers):
        score = 0
    else:
        try:
            score = int(result.get("score", 0))
        except:
            score = 0

    cur.execute(
        "UPDATE interviews SET answers=%s,score=%s,feedback=%s WHERE id=%s",
        (
            json.dumps(req.answers),
            score,
            result.get("overall_feedback", ""),
            req.interview_id
        )
    )

    cur.execute(
        "INSERT INTO feedback (interview_id,user_id,strengths,weaknesses,suggestions,overall_score) VALUES (%s,%s,%s,%s,%s,%s)",
        (
            req.interview_id,
            payload["user_id"],
            result.get("strengths", ""),
            result.get("weaknesses", ""),
            result.get("suggestions", ""),
            score
        )
    )

    db.commit()

    return {
        **result,
        "interview_id": req.interview_id,
        "score": score
    }

@app.get("/api/feedback/{interview_id}")
def get_feedback(interview_id: int, payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "SELECT f.*,i.topic,i.score,i.feedback as overall,i.taken_at FROM feedback f "
        "JOIN interviews i ON f.interview_id=i.id WHERE f.interview_id=%s AND f.user_id=%s",
        (interview_id, payload["user_id"])
    )
    r = cur.fetchone()
    if not r: raise HTTPException(404, "Feedback not found")
    return r

# ── DASHBOARD ──────────────────────────────────────────────────────────────────
@app.get("/api/dashboard")
def dashboard(payload=Depends(verify_token), db=Depends(get_db)):
    uid = payload["user_id"]
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT COUNT(*) as total FROM interviews WHERE user_id=%s AND score>0", (uid,))
    total = cur.fetchone()["total"]
    cur.execute("SELECT COALESCE(AVG(score),0) as avg FROM interviews WHERE user_id=%s AND score>0", (uid,))
    avg   = round(float(cur.fetchone()["avg"]), 1)
    cur.execute("SELECT score,topic,taken_at FROM interviews WHERE user_id=%s AND score>0 ORDER BY taken_at DESC LIMIT 1", (uid,))
    last  = cur.fetchone()
    cur.execute("SELECT topic,score,taken_at FROM interviews WHERE user_id=%s AND score>0 ORDER BY taken_at DESC LIMIT 10", (uid,))
    hist  = cur.fetchall()
    cur.execute("SELECT score,taken_at FROM interviews WHERE user_id=%s AND score>0 ORDER BY taken_at ASC LIMIT 10", (uid,))
    graph = cur.fetchall()
    return {"total_interviews": total, "average_score": avg,
            "last_interview": last, "history": hist, "graph_data": graph}

# ── CHATBOT ───────────────────────────────────────────────────────────────────
@app.post("/api/chat")
def chat(req: ChatReq, payload=Depends(verify_token), db=Depends(get_db)):
    reply = "I'm MockMate AI! I can help you with interview preparation, career tips, and practice questions. What topic would you like to work on today?"

    if OPENAI_AVAILABLE:
        try:
            msgs = [{"role":"system","content":
                     "You are MockMate AI, an expert interview coach. Help with interview prep, "
                     "career guidance, mock questions, and resume tips. Be concise and motivating."}]
            for h in req.history[-8:]:
                msgs.append({"role": h["role"], "content": h["content"]})
            msgs.append({"role":"user","content":req.message})
            r = openai_client.chat.completions.create(
                model="gpt-3.5-turbo", messages=msgs, max_tokens=400)
            reply = r.choices[0].message.content
        except Exception as e:
            print(f"Chat error: {e}")

    cur = db.cursor()
    cur.execute("INSERT INTO chat_history (user_id,role,message) VALUES (%s,%s,%s)",
                (payload["user_id"],"user",req.message))
    cur.execute("INSERT INTO chat_history (user_id,role,message) VALUES (%s,%s,%s)",
                (payload["user_id"],"assistant",reply))
    db.commit()
    return {"reply": reply}

@app.get("/api/chat/history")
def chat_history(payload=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "SELECT role,message,created_at FROM chat_history WHERE user_id=%s ORDER BY created_at ASC LIMIT 50",
        (payload["user_id"],))
    return cur.fetchall()

@app.get("/")
def root():
    return {"message": "MockMate AI v2.0 running 🚀"}