import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const SUGGESTIONS = [
  'How do I prepare for a software engineering interview?',
  'What are common behavioral interview questions?',
  'Give me tips for system design interviews',
  'How should I answer "Tell me about yourself"?',
  'What should I include in my resume?',
  'How do I negotiate my salary?',
];

// Smart fallback replies when OpenAI is unavailable
const FALLBACK_REPLIES = [
  {
    keys: ['prepare', 'preparation', 'start', 'begin', 'how to'],
    reply: `Great question! Here's how to prepare for interviews:\n\n1. **Research the company** — know their products, culture, and recent news\n2. **Review job description** — match your skills to their requirements\n3. **Practice common questions** — use MockMate's mock interview feature\n4. **Prepare STAR stories** — Situation, Task, Action, Result for behavioral questions\n5. **Practice out loud** — speaking your answers builds confidence\n6. **Prepare questions to ask** — shows genuine interest\n\nWould you like me to give you some practice questions for a specific role?`
  },
  {
    keys: ['behavioral', 'tell me about yourself', 'weakness', 'strength', 'challenge'],
    reply: `Behavioral questions follow the **STAR method**:\n\n- **S**ituation — Set the context\n- **T**ask — Describe your responsibility\n- **A**ction — What YOU specifically did\n- **R**esult — Measurable outcome\n\nCommon behavioral questions:\n• "Tell me about a time you failed"\n• "Describe a conflict with a teammate"\n• "Tell me about your biggest achievement"\n• "How do you handle tight deadlines?"\n\nFor "Tell me about yourself" — keep it 2 minutes: past experience → current role/skills → why this job. Want me to help you structure your personal introduction?`
  },
  {
    keys: ['system design', 'architecture', 'scalable', 'database'],
    reply: `System Design interview tips:\n\n1. **Clarify requirements first** — ask about scale, users, features\n2. **Start high-level** — draw the big picture before details\n3. **Think aloud** — interviewers want to see your reasoning\n4. **Cover key components:**\n   - Load balancers\n   - Databases (SQL vs NoSQL)\n   - Caching (Redis)\n   - Message queues\n   - CDN for static assets\n5. **Discuss trade-offs** — no perfect solution exists\n\nPopular system design topics: URL shortener, Twitter feed, WhatsApp, Netflix streaming. Want me to walk through any of these?`
  },
  {
    keys: ['resume', 'cv', 'portfolio'],
    reply: `Resume tips for tech roles:\n\n✅ **Format:**\n- 1 page for under 5 years experience\n- Use bullet points, not paragraphs\n- Reverse chronological order\n\n✅ **Content:**\n- Start bullets with action verbs (Built, Designed, Reduced)\n- Quantify achievements: "Reduced load time by 40%"\n- Include GitHub/LinkedIn links\n- Tailor keywords to job description\n\n✅ **Technical Skills section:**\n- Languages, frameworks, tools, databases\n- Be honest — they will test what you list\n\nUpload your resume in MockMate to extract your skills automatically and get tailored interview questions!`
  },
  {
    keys: ['salary', 'negotiate', 'offer', 'pay', 'compensation'],
    reply: `Salary negotiation tips:\n\n1. **Research first** — check Glassdoor, LinkedIn Salary, Levels.fyi\n2. **Let them go first** — if possible, ask for their range\n3. **Give a range** — anchor high: if you want ₹8L, say ₹8–10L\n4. **Never accept on the spot** — ask for 24–48 hours to consider\n5. **Negotiate the whole package** — base, bonus, stock, WFH, learning budget\n6. **Be confident, not apologetic** — you are a professional with value\n\nCommon phrase: *"Based on my research and experience, I was expecting [X]. Is there flexibility there?"*\n\nWhat industry/level are you targeting? I can give more specific advice.`
  },
  {
    keys: ['python', 'javascript', 'java', 'react', 'coding', 'technical', 'programming'],
    reply: `Technical interview preparation tips:\n\n**For Coding Rounds:**\n- Practice on LeetCode, HackerRank — start with Easy/Medium\n- Know time/space complexity (Big O notation)\n- Master: Arrays, Strings, HashMaps, Trees, DP basics\n\n**During the interview:**\n1. Clarify the problem before coding\n2. Think out loud — explain your approach\n3. Start with brute force, then optimize\n4. Test with edge cases: empty input, single element, duplicates\n\n**For language-specific:**\n- Python: list comprehensions, decorators, generators\n- JavaScript: closures, promises, event loop, ES6+\n- Java: OOP, Collections, multithreading\n\nWant practice questions for a specific language or data structure?`
  },
  {
    keys: ['anxiety', 'nervous', 'scared', 'confident', 'fear', 'stress'],
    reply: `Interview anxiety is completely normal! Here's how to manage it:\n\n🧠 **Before the interview:**\n- Prepare thoroughly — confidence comes from preparation\n- Do mock interviews (use MockMate!)\n- Practice power poses and deep breathing\n- Good sleep the night before\n\n💬 **During the interview:**\n- Pause before answering — it shows thoughtfulness, not confusion\n- It's okay to say "That's a good question, let me think"\n- Remember: they WANT you to succeed — they're hoping you're the right person\n- Treat it as a conversation, not an interrogation\n\n✅ **Mindset shift:**\nYou're also interviewing THEM — is this company right for you?\n\nYou've got this! Want to do a practice run with mock questions?`
  },
  {
    keys: ['hr', 'round', 'interview process', 'stages', 'steps'],
    reply: `Typical interview process for tech companies:\n\n1. **Application/Resume screening** — ATS filters, HR review\n2. **Phone/Video screen** (30 min) — Basic fit, background, salary\n3. **Technical screen** (1 hr) — Coding problem or take-home assignment\n4. **Technical rounds** (2–4 rounds) — DSA, system design, domain knowledge\n5. **HR/Behavioral round** — Culture fit, motivation, team questions\n6. **Offer discussion** — Salary, benefits, start date\n\n**Tips:**\n- Ask about the process at the start\n- Send a thank-you email within 24 hours\n- Follow up politely if no response after 1 week\n\nWhich stage are you preparing for?`
  },
];

function getFallbackReply(message) {
  const lower = message.toLowerCase();
  for (const item of FALLBACK_REPLIES) {
    if (item.keys.some(k => lower.includes(k))) {
      return item.reply;
    }
  }
  return `I'm your MockMate AI career coach! 🎯\n\nI can help you with:\n• **Interview preparation tips** for any role\n• **Resume advice** and skill highlighting\n• **Behavioral question practice** using STAR method\n• **Technical interview guidance** (coding, system design)\n• **Salary negotiation** strategies\n• **Confidence building** techniques\n\nTry asking me something like:\n- "How do I prepare for a Python interview?"\n- "Give me tips for system design"\n- "How should I answer behavioral questions?"\n\nWhat topic would you like to focus on today?`;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! 👋 I'm your MockMate AI career coach.\n\nI can help you:\n• Practice interview questions\n• Review resume tips\n• Give career advice\n• Explain technical concepts\n\nWhat would you like to work on today?"
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const updated = [...messages, { role: 'user', content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const history = updated.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/api/chat', {
        message: msg,
        history: history.slice(0, -1),
      });
      // Use API reply if it's meaningful, otherwise use smart fallback
      const reply = data.reply && data.reply.length > 50 && !data.reply.includes("What topic would you like to work on today?")
        ? data.reply
        : getFallbackReply(msg);
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch {
      // Backend error — use smart fallback
      const reply = getFallbackReply(msg);
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setMessages([{
    role: 'assistant',
    content: "Chat cleared! 🗑️ How can I help you with interview prep today?"
  }]);

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.robotAvatar}>🤖</div>
            <div>
              <h1 style={S.title}>Career Chat Assistant</h1>
              <div style={S.status}>
                <div style={S.dot} />
                <span>MockMate AI — Online</span>
              </div>
            </div>
          </div>
          <button style={S.clearBtn} onClick={clear}>🗑 Clear</button>
        </div>

        {/* Messages */}
        <div style={S.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end',
              gap: 10,
              marginBottom: 14,
            }}>
              {m.role === 'assistant' && <div style={S.aiAv}>🤖</div>}
              <div style={{
                maxWidth: '78%',
                padding: '12px 16px',
                borderRadius: 14,
                background: m.role === 'user'
                  ? 'rgba(255,124,26,0.25)'
                  : 'rgba(26,58,143,0.5)',
                border: `1px solid ${m.role === 'user'
                  ? 'rgba(255,124,26,0.35)'
                  : 'rgba(100,140,255,0.3)'}`,
                borderBottomRightRadius: m.role === 'user' ? 4 : 14,
                borderBottomLeftRadius:  m.role === 'assistant' ? 4 : 14,
              }}>
                <p style={{
                  fontSize: 14, color: '#fff', lineHeight: 1.7, margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontFamily: "'Source Sans 3',sans-serif",
                }}>{m.content}</p>
              </div>
              {m.role === 'user' && <div style={S.userAv}>👤</div>}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 14 }}>
              <div style={S.aiAv}>🤖</div>
              <div style={{
                background: 'rgba(26,58,143,0.5)',
                border: '1px solid rgba(100,140,255,0.3)',
                borderRadius: 14, borderBottomLeftRadius: 4,
                padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#00c875', display: 'block',
                      animation: `pulse 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions — show on first message only */}
        {messages.length <= 1 && (
          <div style={S.suggestions}>
            <p style={S.sugLabel}>💡 Quick suggestions:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} style={S.sugBtn} onClick={() => send(s)} disabled={loading}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={S.inputRow}>
          <input
            ref={inputRef}
            style={S.input}
            placeholder="Ask about interview tips, career advice, mock questions…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
            autoComplete="off"
          />
          <button
            style={{ ...S.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            {loading ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    padding: '24px', display: 'flex', alignItems: 'flex-start',
    justifyContent: 'center', minHeight: 'calc(100vh - 68px)',
    fontFamily: "'Source Sans 3',sans-serif",
  },
  container: {
    width: '100%', maxWidth: 750,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 20, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  },
  header: {
    padding: '18px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(0,0,0,0.15)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 13 },
  robotAvatar: {
    width: 46, height: 46, borderRadius: 13,
    background: 'linear-gradient(135deg,#00c875,#00a85e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, boxShadow: '0 2px 14px rgba(0,200,117,0.45)',
  },
  title:  { fontFamily: "'Libre Baskerville',serif", fontSize: 17, color: '#fff', margin: 0 },
  status: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  dot:    { width: 7, height: 7, borderRadius: '50%', background: '#00c875' },
  clearBtn: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Source Sans 3',sans-serif",
  },
  messages: {
    flex: 1, padding: '20px 20px 10px', overflowY: 'auto',
    maxHeight: '52vh', display: 'flex', flexDirection: 'column',
  },
  aiAv: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg,#00c875,#00a85e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, flexShrink: 0,
  },
  userAv: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(255,124,26,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, flexShrink: 0,
  },
  suggestions: { padding: '12px 20px 14px' },
  sugLabel: { fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' },
  sugBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.65)', borderRadius: 8, padding: '7px 12px',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
    fontFamily: "'Source Sans 3',sans-serif", transition: 'all 0.2s',
  },
  inputRow: {
    padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', gap: 10, background: 'rgba(0,0,0,0.12)',
  },
  input: {
    flex: 1, background: 'rgba(255,255,255,0.09)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 12, padding: '12px 16px',
    color: '#fff', fontSize: 14, outline: 'none',
    fontFamily: "'Source Sans 3',sans-serif",
  },
  sendBtn: {
    width: 48, height: 48,
    background: 'linear-gradient(135deg,#00c875,#00a85e)',
    border: 'none', borderRadius: 12, fontSize: 20,
    cursor: 'pointer', flexShrink: 0,
    boxShadow: '0 2px 12px rgba(0,200,117,0.4)',
  },
};