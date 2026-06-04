import React, { useState } from 'react';

const FAQS = [
  { q:'How do I start a mock interview?', a:'Go to Mock Interview from the sidebar or top menu. Select your topic, choose number of questions, and click Start Interview.' },
  { q:'What is the AI Interviewer?', a:'The AI Interviewer is a webcam/mic-based session where an AI conducts a real interview conversation with you for 5 or 10 minutes, simulating a real job interview.' },
  { q:'How do I upload my resume?', a:'Go to Resume Upload from the sidebar. Drag & drop or browse for your .txt or .pdf resume file. Skills are extracted automatically.' },
  { q:'Why is the chatbot not responding?', a:'The AI chatbot requires an OpenAI API key configured in backend/main.py. If not set, it gives a default response. Check your API key setup.' },
  { q:'How is my interview score calculated?', a:'AI analyzes each of your answers for completeness, clarity, examples used, and technical accuracy. It gives a 0-100 score with detailed feedback.' },
  { q:'Can I retake an interview?', a:'Yes! You can take unlimited mock interviews on any topic. All sessions are saved in your Dashboard history.' },
  { q:'How do I check my past interviews?', a:'Go to Dashboard — it shows all your past interview scores, topics, dates, and a performance graph over time.' },
  { q:'What topics are available for interviews?', a:'Over 500+ topics including Python, JavaScript, React, Data Science, Machine Learning, System Design, SQL, Behavioral Questions, and many more.' },
  { q:'Is my data secure?', a:'Yes. Passwords are hashed with bcrypt, sessions use JWT tokens, and all data is stored in your local PostgreSQL database.' },
  { q:'The backend shows a database error — what do I do?', a:'Make sure PostgreSQL is running and the "mockmate" database is created. Check that the password in main.py matches your PostgreSQL password.' },
];

export default function SupportPage() {
  const [open,    setOpen]    = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatLog, setChatLog] = useState([
    { from:'bot', text:"Hi! 👋 I'm the MockMate support bot. Ask me anything or browse the FAQ above. For urgent issues, email us at mockmateai@gmail.com" }
  ]);
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [sent,    setSent]    = useState(false);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const userMsg = chatMsg.trim();
    setChatLog(l => [...l, { from:'user', text: userMsg }]);
    setChatMsg('');
    // Simple keyword matching bot
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let reply = "I'm not sure about that. Please email us at mockmateai@gmail.com and we'll help you within 24 hours!";
      if (lower.includes('interview'))  reply = "Go to Mock Interview in the sidebar. Select a topic and number of questions, then click Start Interview!";
      if (lower.includes('resume'))     reply = "Go to Resume Upload in the sidebar. Upload a .txt or .pdf file — skills are extracted automatically.";
      if (lower.includes('login') || lower.includes('register')) reply = "Make sure your password is at least 6 characters and CAPTCHA answer is correct. Check that the backend is running at localhost:8000.";
      if (lower.includes('password'))   reply = "Passwords must be at least 6 characters. Both password fields must match on register.";
      if (lower.includes('database') || lower.includes('error')) reply = "Ensure PostgreSQL is running and 'mockmate' database exists. Check the password in backend/main.py.";
      if (lower.includes('chatbot') || lower.includes('ai'))     reply = "The chatbot needs an OpenAI API key in backend/main.py. Without it, you'll get default responses.";
      if (lower.includes('score'))      reply = "Scores are calculated by AI based on your answer quality, examples, and technical accuracy. Aim for 70+ for a good performance!";
      if (lower.includes('contact') || lower.includes('email'))  reply = "Email us directly at mockmateai@gmail.com — we respond within 24 hours!";
      setChatLog(l => [...l, { from:'bot', text: reply }]);
    }, 700);
  };

  const handleContactSend = () => {
    if (!name.trim() || !email.trim() || !msg.trim()) return;
    setSent(true);
    setName(''); setEmail(''); setMsg('');
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div className="badge badge-orange" style={{marginBottom:12}}>Help Center</div>
        <h1 style={S.title}>🆘 Support</h1>
        <p style={S.sub}>Find answers to common questions or contact us directly</p>
      </div>

      <div style={S.grid}>
        {/* FAQ */}
        <div>
          <h2 style={S.sectionTitle}>📋 Frequently Asked Questions</h2>
          <div style={S.faqList}>
            {FAQS.map((faq, i) => (
              <div key={i} style={S.faqItem}>
                <button style={S.faqQ} onClick={() => setOpen(open === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{fontSize:18, color:'#ff7c1a'}}>{open === i ? '▲' : '▼'}</span>
                </button>
                {open === i && <div style={S.faqA}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{display:'flex', flexDirection:'column', gap:24}}>
          {/* Quick Chat */}
          <div style={S.chatBox}>
            <h2 style={S.sectionTitle}>💬 Quick Help Chat</h2>
            <div style={S.chatMessages}>
              {chatLog.map((m, i) => (
                <div key={i} style={{
                  display:'flex',
                  justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom:10,
                }}>
                  <div style={{
                    maxWidth:'80%', padding:'10px 14px', borderRadius:12,
                    fontSize:13, lineHeight:1.6,
                    background: m.from === 'user'
                      ? 'rgba(255,124,26,0.25)'
                      : 'rgba(26,58,143,0.4)',
                    border: `1px solid ${m.from === 'user' ? 'rgba(255,124,26,0.3)' : 'rgba(100,140,255,0.25)'}`,
                    color:'#fff',
                  }}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={S.chatInputRow}>
              <input
                className="form-input"
                placeholder="Type your question…"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                style={{flex:1}}
              />
              <button className="btn-orange" style={{padding:'12px 18px', flexShrink:0}} onClick={sendChat}>🚀</button>
            </div>
          </div>

          {/* Contact Form */}
          <div style={S.contactBox}>
            <h2 style={S.sectionTitle}>📧 Contact Us</h2>
            <p style={{fontSize:14, color:'rgba(255,255,255,0.6)', marginBottom:16}}>
              Issue not in FAQ? Send us a message:
            </p>
            {sent ? (
              <div className="alert-success">
                ✅ Message sent! We'll reply to your email within 24 hours.
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:14}}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" rows={4} placeholder="Describe your issue…" value={msg} onChange={e => setMsg(e.target.value)}/>
                </div>
                <button className="btn-orange" style={{width:'100%', padding:'13px'}} onClick={handleContactSend}>
                  📨 Send Message
                </button>
              </div>
            )}
            <div style={S.contactInfo}>
              <div style={S.contactItem}>📧 <a href="mailto:mockmateai@gmail.com" style={{color:'#ff7c1a'}}>mockmateai@gmail.com</a></div>
              <div style={S.contactItem}>⏱️ Response time: within 24 hours</div>
              <div style={S.contactItem}>🕐 Support hours: Mon–Sat, 9am–6pm IST</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { padding:'40px 32px', maxWidth:1200, margin:'0 auto', fontFamily:"'Source Sans 3',sans-serif" },
  header: { textAlign:'center', marginBottom:48 },
  title: { fontFamily:"'Libre Baskerville',serif", fontSize:36, color:'#fff', margin:'0 0 10px' },
  sub:   { fontSize:16, color:'rgba(255,255,255,0.5)' },
  grid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 },
  sectionTitle: { fontFamily:"'Libre Baskerville',serif", fontSize:19, color:'#fff', marginBottom:18 },
  faqList: { display:'flex', flexDirection:'column', gap:10 },
  faqItem: {
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:12, overflow:'hidden',
  },
  faqQ: {
    width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'16px 18px', background:'none', border:'none', color:'#fff',
    textAlign:'left', fontSize:14, fontWeight:600, cursor:'pointer',
    fontFamily:"'Source Sans 3',sans-serif",
  },
  faqA: {
    padding:'0 18px 16px', fontSize:13, color:'rgba(255,255,255,0.65)',
    lineHeight:1.7, borderTop:'1px solid rgba(255,255,255,0.08)',
    paddingTop:12,
  },
  chatBox: {
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:14, padding:24,
  },
  chatMessages: {
    height:220, overflowY:'auto', marginBottom:14,
    padding:'8px 4px',
  },
  chatInputRow: { display:'flex', gap:10 },
  contactBox: {
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,124,26,0.2)',
    borderRadius:14, padding:24,
  },
  contactInfo: {
    marginTop:20, display:'flex', flexDirection:'column', gap:8,
    padding:'16px', background:'rgba(255,124,26,0.08)',
    border:'1px solid rgba(255,124,26,0.2)', borderRadius:10,
  },
  contactItem: { fontSize:13, color:'rgba(255,255,255,0.65)' },
};
