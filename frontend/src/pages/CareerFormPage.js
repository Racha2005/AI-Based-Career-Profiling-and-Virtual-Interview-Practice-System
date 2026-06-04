import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const QUALIFICATIONS = [
  "10th Grade",
  "12th Grade (Science)", "12th Grade (Commerce)", "12th Grade (Arts)",
  "B.Sc (CS)", "B.Sc (IT)", "B.Sc (Maths)", "B.Sc (Physics)", "B.Sc (Chemistry)", "B.Sc (Hons)",
  "BCA", "B.Com", "BBA", "BA",
  "B.Tech (CSE)", "B.Tech (IT)", "B.Tech (ECE)", "B.Tech (Mechanical)", "B.Tech (Civil)",
  "M.Sc (CS)", "M.Sc (IT)", "M.Sc (Maths)",
  "MCA", "MBA", "M.Com", "MA", "M.Tech (CSE)",
  "Diploma", "Other"
];

export default function CareerFormPage() {
  const [form, setForm] = useState({
    qualification: '',
    hobbies: '',
    about: '',
    career_goal: '',
    skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  // ── Clear form every time page loads ─────────────────────────────────────
  useEffect(() => {
    setForm({ qualification: '', hobbies: '', about: '', career_goal: '', skills: '' });
    setResult(null);
    setError('');
  }, []);

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.qualification)                          return setError('Please select your qualification');
    if (!form.about.trim() || form.about.length < 30) return setError('Please write at least 30 characters about yourself');
    if (!form.career_goal.trim())                     return setError('Please enter your career goal');
    setError(''); setLoading(true);

    try {
      // ── Detailed prompt for AI career guidance ──────────────────────────
      const prompt = `You are a professional career counselor. Give detailed, personalized career guidance for this student profile:

Qualification: ${form.qualification}
Hobbies: ${form.hobbies || 'Not specified'}
About Themselves: ${form.about}
Career Goal: ${form.career_goal}
Current Skills: ${form.skills || 'Not specified'}

Please provide a comprehensive career guidance response with these exact sections:

1. CAREER PATH RECOMMENDATION
Explain why ${form.career_goal} is a good fit for this person based on their profile. What sub-roles or specializations should they consider?

2. SKILLS TO LEARN
List the top 8-10 specific technical and soft skills they need to develop for ${form.career_goal}. Be specific with technologies and tools.

3. TOP 3 JOB ROLES
Name 3 specific job titles they should target, with a brief description of each role and typical salary range in India.

4. 6-MONTH ACTION PLAN
Give a month-by-month plan:
Month 1-2: What to learn
Month 3-4: What to build/practice
Month 5: Interview preparation
Month 6: Job applications and networking

5. RESOURCES TO USE
Suggest 3-4 specific websites, courses, or platforms they should use (like Coursera, LeetCode, etc.)

6. MOTIVATIONAL MESSAGE
End with an encouraging, personalized message based on their background.

Be specific, practical, and encouraging. Use their actual qualification and career goal throughout the response.`;

      const { data } = await api.post('/api/chat', {
        message: prompt,
        history: [],
      });

      // Use AI reply if good, otherwise use detailed fallback
      const reply = data.reply && data.reply.length > 100
        ? data.reply
        : generateFallbackGuidance(form);

      setResult(reply);

    } catch {
      setResult(generateFallbackGuidance(form));
    } finally {
      setLoading(false);
    }
  };

  // ── Fallback career guidance when OpenAI unavailable ──────────────────────
  const generateFallbackGuidance = (f) => {
    return `🎯 CAREER GUIDANCE FOR YOU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Your Profile:
• Qualification: ${f.qualification}
• Career Goal: ${f.career_goal}
• Skills: ${f.skills || 'To be developed'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ CAREER PATH RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on your background in ${f.qualification} and your goal of becoming a ${f.career_goal}, you are on the right path! This is one of the most in-demand roles in today's tech industry.

Start as a Junior ${f.career_goal}, grow to Mid-level in 2-3 years, and Senior level in 4-5 years. Many professionals also move into Team Lead or Architect roles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ SKILLS TO LEARN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Technical Skills:
• Programming: Python / JavaScript / Java (pick one, master it)
• Data Structures & Algorithms (practice on LeetCode)
• Databases: SQL (MySQL/PostgreSQL) + basics of NoSQL (MongoDB)
• Version Control: Git and GitHub
• Problem Solving and Logical Thinking

Soft Skills:
• Communication — explain technical concepts clearly
• Teamwork and collaboration
• Time management
• Continuous learning mindset

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ TOP 3 JOB ROLES FOR YOU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Junior ${f.career_goal}
   Entry-level role. Salary: ₹3-6 LPA
   Focus: Learning, building projects, contributing to team

2. ${f.career_goal} (Mid-level)
   2-3 years experience. Salary: ₹6-12 LPA
   Focus: Independent projects, mentoring juniors

3. Senior ${f.career_goal}
   4-5 years experience. Salary: ₹12-25 LPA
   Focus: Architecture, leadership, cross-team collaboration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣ 6-MONTH ACTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Month 1-2: Foundation
• Choose your primary programming language
• Complete 1 online course (Coursera / Udemy)
• Learn Git basics — push code to GitHub daily

Month 3-4: Build Projects
• Build 2-3 portfolio projects
• Start solving Easy LeetCode problems (target: 30 problems)
• Join LinkedIn and start networking

Month 5: Interview Preparation
• Use MockMate AI for daily mock interview practice
• Solve 10 Medium LeetCode problems
• Practice behavioral questions using STAR method
• Research target companies

Month 6: Apply and Network
• Apply to 10-15 companies
• Attend hackathons and tech events
• Follow up on applications
• Prepare for HR + technical rounds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5️⃣ RESOURCES TO USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• LeetCode.com — DSA practice
• Coursera / Udemy — Online courses
• GitHub — Portfolio and projects
• LinkedIn — Networking and job search
• MockMate AI — Interview practice (you're already here! ✅)
• GeeksforGeeks — CS concepts and interview prep

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 MOTIVATIONAL MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have the right qualification and a clear goal — that is already more than most people! The journey to becoming a ${f.career_goal} takes consistent effort, but every expert was once a beginner.

${f.hobbies ? `Your hobbies in ${f.hobbies} show you are a well-rounded person — this matters in interviews too!` : ''}

Start today. Practice daily. Use MockMate AI to prepare for your interviews. Your dream job is closer than you think! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next Step: Go to AI Interviewer and practice a mock interview for ${f.career_goal} right now!`;
  };

  // ── RESULT SCREEN ─────────────────────────────────────────────────────────
  if (result) return (
    <div style={S.page}>
      <div style={S.resultCard}>
        <div style={S.resultHeader}>
          <div style={{ fontSize: 36 }}>🎯</div>
          <div>
            <h2 style={S.resultTitle}>Your Career Guidance</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Personalized AI-powered advice based on your profile
            </p>
          </div>
        </div>

        <div style={S.resultBox}>
          <pre style={S.resultText}>{result}</pre>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button style={S.btnOrange} onClick={() => navigate('/ai-interview')}>
            🎯 Start AI Interview
          </button>
          <button style={S.btnGreen} onClick={() => navigate('/chatbot')}>
            💬 Ask Career Chatbot
          </button>
          <button style={S.btnGhost} onClick={() => {
            setResult(null);
            setForm({ qualification: '', hobbies: '', about: '', career_goal: '', skills: '' });
          }}>
            📋 Fill Again
          </button>
        </div>
      </div>
    </div>
  );

  // ── FORM SCREEN ───────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.formCard}>

        <div style={S.formHeader}>
          <div style={{ fontSize: 44 }}>🎯</div>
          <h1 style={S.formTitle}>Career Guidance Form</h1>
          <p style={S.formSub}>Fill in your details to receive AI-powered career insights and a personalized action plan</p>
        </div>

        {error && <div style={S.errBox}>⚠️ {error}</div>}

        <div style={S.fields}>

          {/* Qualification */}
          <div style={S.fg}>
            <label style={S.label}>Highest Qualification / Currently Pursuing *</label>
            <select style={S.select} name="qualification" value={form.qualification} onChange={ch}>
              <option value="">Select your qualification</option>
              {QUALIFICATIONS.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Hobbies */}
          <div style={S.fg}>
            <label style={S.label}>Hobbies</label>
            <input style={S.input} name="hobbies" type="text"
              placeholder="e.g., Reading, Coding, Music, Sports, Gaming"
              value={form.hobbies} onChange={ch} autoComplete="off" />
          </div>

          {/* About */}
          <div style={S.fg}>
            <label style={S.label}>About Yourself & Interests *</label>
            <textarea style={S.textarea} name="about" rows={5}
              placeholder="Write about yourself — your strengths, what you enjoy, what motivates you, any projects you've done, your learning style... (minimum 30 characters)"
              value={form.about} onChange={ch} />
            <span style={{
              fontSize: 11, textAlign: 'right', marginTop: 4,
              color: form.about.length >= 30 ? '#00c875' : 'rgba(255,255,255,0.3)'
            }}>
              {form.about.length} characters {form.about.length >= 30 ? '✓' : `(need ${30 - form.about.length} more)`}
            </span>
          </div>

          {/* Career Goal */}
          <div style={S.fg}>
            <label style={S.label}>Career Goal *</label>
            <input style={S.input} name="career_goal" type="text"
              placeholder="e.g., Software Engineer, Data Scientist, UI/UX Designer, Product Manager"
              value={form.career_goal} onChange={ch} autoComplete="off" />
          </div>

          {/* Skills */}
          <div style={S.fg}>
            <label style={S.label}>Current Skills</label>
            <input style={S.input} name="skills" type="text"
              placeholder="e.g., Python, HTML, Communication, Excel, Problem Solving"
              value={form.skills} onChange={ch} autoComplete="off" />
          </div>

          <button
            style={{
              ...S.btnOrange, width: '100%', fontSize: 16,
              padding: '16px', marginTop: 8,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Getting AI Career Insights…' : '🚀 Submit & Get Career Guidance'}
          </button>

        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    padding: '40px 24px', display: 'flex', justifyContent: 'center',
    minHeight: 'calc(100vh - 68px)', fontFamily: "'Source Sans 3',sans-serif",
  },
  formCard: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 20, padding: '44px 40px',
    width: '100%', maxWidth: 580,
    backdropFilter: 'blur(16px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    height: 'fit-content',
  },
  formHeader: { textAlign: 'center', marginBottom: 32 },
  formTitle:  { fontFamily: "'Libre Baskerville',serif", fontSize: 26, color: '#fff', margin: '12px 0 8px' },
  formSub:    { fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 },
  errBox: {
    background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.35)',
    borderRadius: 10, padding: '12px 16px', color: '#ffaaaa',
    fontSize: 14, marginBottom: 20,
  },
  fields: { display: 'flex', flexDirection: 'column', gap: 20 },
  fg:     { display: 'flex', flexDirection: 'column', gap: 7 },
  label:  { fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.3px' },
  input: {
    background: 'rgba(255,255,255,0.1)',
    border: '1.5px solid rgba(255,255,255,0.2)',
    borderRadius: 10, padding: '13px 16px',
    color: '#fff', fontSize: 15, outline: 'none',
    width: '100%', boxSizing: 'border-box',
    fontFamily: "'Source Sans 3',sans-serif",
  },
  select: {
    background: 'rgba(255,255,255,0.1)',
    border: '1.5px solid rgba(255,255,255,0.2)',
    borderRadius: 10, padding: '13px 16px',
    color: '#fff', fontSize: 15, outline: 'none',
    width: '100%', cursor: 'pointer',
    fontFamily: "'Source Sans 3',sans-serif",
  },
  textarea: {
    background: 'rgba(255,255,255,0.1)',
    border: '1.5px solid rgba(255,255,255,0.2)',
    borderRadius: 10, padding: '13px 16px',
    color: '#fff', fontSize: 15, outline: 'none',
    resize: 'vertical', width: '100%', boxSizing: 'border-box',
    fontFamily: "'Source Sans 3',sans-serif", lineHeight: 1.6,
    minHeight: 120,
  },
  btnOrange: {
    background: 'linear-gradient(135deg,#ff7c1a,#e8660a)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Libre Baskerville',serif",
    padding: '12px 24px',
    boxShadow: '0 4px 16px rgba(232,102,10,0.4)',
  },
  btnGreen: {
    background: 'linear-gradient(135deg,#00c875,#00a85e)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Libre Baskerville',serif",
    padding: '12px 24px',
  },
  btnGhost: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.7)', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    padding: '12px 24px',
  },
  resultCard: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(0,200,117,0.2)',
    borderRadius: 20, padding: '36px 32px',
    width: '100%', maxWidth: 780,
    backdropFilter: 'blur(16px)',
    height: 'fit-content',
  },
  resultHeader: {
    display: 'flex', alignItems: 'center', gap: 14,
    marginBottom: 20,
  },
  resultTitle: {
    fontFamily: "'Libre Baskerville',serif",
    fontSize: 22, color: '#fff', margin: 0,
  },
  resultBox: {
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '22px',
    maxHeight: 520, overflowY: 'auto',
  },
  resultText: {
    color: '#fff', fontSize: 14, lineHeight: 1.85,
    whiteSpace: 'pre-wrap', margin: 0,
    fontFamily: "'Source Sans 3',sans-serif",
  },
};