import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/mockmate_ai_logo.jpg';

const TEAM = [
  { name: 'MockMate AI', role: 'AI Interview Coach', desc: 'Helping students ace interviews with AI-powered practice and real-time feedback.' },
];

export default function AboutPage() {
  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.hero}>
        <img src={logo} alt="MockMate AI Logo"
          style={{width:90,height:90,borderRadius:20,objectFit:'cover',marginBottom:16,boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}
          onError={e=>e.target.style.display='none'}/>
        <h1 style={S.heroTitle}>About MockMate AI</h1>
        <p style={S.heroSub}>An AI-Based Interview Preparation System for Students & Job Seekers</p>
      </div>

      {/* Info cards */}
      <div style={S.grid}>
        <div style={S.card}>
          <div style={{fontSize:28,marginBottom:12}}>🎯</div>
          <h3 style={S.cardTitle}>Our Mission</h3>
          <p style={S.cardText}>
            MockMate AI helps students and job seekers prepare for interviews through
            personalized AI coaching, real-time feedback, and structured performance tracking.
            We believe everyone deserves access to quality interview preparation.
          </p>
        </div>
        <div style={S.card}>
          <div style={{fontSize:28,marginBottom:12}}>⚠️</div>
          <h3 style={S.cardTitle}>Problem We Solve</h3>
          <p style={S.cardText}>
            Students often lack proper interview preparation and structured feedback.
            Traditional methods don't provide real-time analysis or personalized guidance.
            MockMate AI fills this gap with a centralized AI-powered platform.
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>✅ What MockMate AI Offers</h2>
        <div style={S.featGrid}>
          {[
            ['🤖','AI Voice Interviewer',     'Real webcam + microphone interview with AI speaking questions'],
            ['📄','Resume Analysis',           'Upload resume, extract skills, get tailored interview questions'],
            ['📊','Performance Dashboard',     'Track scores, view history, monitor improvement over time'],
            ['💬','AI Career Chatbot',         'Ask career questions, get tips, practice Q&A anytime'],
            ['📋','Career Guidance Form',      'Fill your profile, get personalized career direction from AI'],
            ['🆘','Support Center',            'FAQ, quick chat support, contact at mockmateai@gmail.com'],
          ].map(([icon,title,desc])=>(
            <div key={title} style={S.featCard}>
              <span style={{fontSize:24}}>{icon}</span>
              <div>
                <div style={{fontWeight:700,color:'#fff',fontSize:14,marginBottom:4}}>{title}</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',lineHeight:1.55}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>🛠️ Technology Stack</h2>
        <div style={S.techGrid}>
          {[
            ['⚛️','Frontend','React.js'],
            ['🐍','Backend','Python FastAPI'],
            ['🐘','Database','PostgreSQL'],
            ['🤖','AI','OpenAI GPT'],
            ['🎙️','Voice','Web Speech API'],
            ['🔐','Auth','JWT Tokens'],
          ].map(([icon,label,val])=>(
            <div key={label} style={S.techCard}>
              <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:4}}>{label}</div>
              <div style={{fontSize:14,fontWeight:700,color:'#fff',fontFamily:"'Libre Baskerville',serif"}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System flow */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>🔄 System Flow</h2>
        <div style={S.flowRow}>
          {['Register','Upload Resume','Select Role','AI Asks Questions','You Answer','AI Scores','View Dashboard'].map((step,i,arr)=>(
            <React.Fragment key={step}>
              <div style={S.flowStep}>{step}</div>
              {i<arr.length-1&&<div style={{color:'rgba(255,255,255,0.3)',fontSize:16}}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>📧 Contact</h2>
        <div style={S.contactBox}>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.65)',marginBottom:8}}>
            📧 Email: <a href="mailto:mockmateai@gmail.com" style={{color:'#ff7c1a'}}>mockmateai@gmail.com</a>
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.65)'}}>
            🆘 Support: <Link to="/support" style={{color:'#00c875'}}>Visit Support Center</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:       {padding:'32px 28px',maxWidth:900,fontFamily:"'Source Sans 3',sans-serif"},
  hero:       {textAlign:'center',marginBottom:40,padding:'20px 0'},
  heroTitle:  {fontFamily:"'Libre Baskerville',serif",fontSize:28,color:'#fff',marginBottom:10},
  heroSub:    {fontSize:15,color:'rgba(255,255,255,0.5)',maxWidth:500,margin:'0 auto'},
  grid:       {display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:32},
  card:       {background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:24},
  cardTitle:  {fontFamily:"'Libre Baskerville',serif",fontSize:17,color:'#fff',marginBottom:10},
  cardText:   {fontSize:14,color:'rgba(255,255,255,0.6)',lineHeight:1.7},
  section:    {marginBottom:36},
  sectionTitle:{fontFamily:"'Libre Baskerville',serif",fontSize:20,color:'#fff',marginBottom:18},
  featGrid:   {display:'flex',flexDirection:'column',gap:12},
  featCard:   {display:'flex',alignItems:'flex-start',gap:14,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'14px 18px'},
  techGrid:   {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:14},
  techCard:   {background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'18px 14px',textAlign:'center'},
  flowRow:    {display:'flex',flexWrap:'wrap',alignItems:'center',gap:8,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'18px 22px'},
  flowStep:   {background:'rgba(255,124,26,0.12)',border:'1px solid rgba(255,124,26,0.25)',color:'#ff7c1a',borderRadius:8,padding:'7px 14px',fontSize:13,fontWeight:700},
  contactBox: {background:'rgba(255,124,26,0.08)',border:'1px solid rgba(255,124,26,0.2)',borderRadius:12,padding:'18px 22px'},
};