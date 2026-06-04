import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Images from your assets folder
import heroImg    from '../assets/images/ai-hero.png';
import chatbotImg from '../assets/images/ai-chatbot.png';
import logo       from '../assets/images/mockmate_ai_logo.jpg';

export default function HomePage() {
  const { isAuth } = useAuth();

  return (
    <div style={S.page}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={S.hero}>
        <div style={S.heroGlow}/>
        <div style={S.heroLeft}>
          <div className="badge badge-orange" style={{marginBottom:20}}>
            🚀 AI-Powered Interview Coaching
          </div>
          <h1 style={S.heroTitle}>
            Prepare Smarter<br/>
            with <span style={{color:'#ff7c1a'}}>AI Mock</span><br/>
            <span style={{
              background:'linear-gradient(90deg,#00c875,#4de8a8)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
            }}>Interviews</span>
          </h1>
          <p style={S.heroDesc}>
            Practice your interviews with a real AI-powered interviewer, get instant feedback,
            upload your resume, and boost your confidence — all in one place.
          </p>
          <div style={S.heroBtns}>
            <Link to={isAuth ? '/ai-interview' : '/register'}
              style={S.btnOrange}>
              🎯 Start Interview
            </Link>
            <Link to={isAuth ? '/career-form' : '/register'}
              style={S.btnOutline}>
              📋 Career Form
            </Link>
          </div>

          {/* Stats */}
          <div style={S.heroStats}>
            {[
              {val:'500+', label:'Topics'},
              {val:'AI',   label:'Powered'},
              {val:'5/10', label:'Min Sessions'},
              {val:'Free', label:'To Use'},
            ].map(s => (
              <div key={s.label} style={S.hStat}>
                <div style={{fontSize:20,fontWeight:900,color:'#ff7c1a',fontFamily:"'Libre Baskerville',serif"}}>{s.val}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',textTransform:'uppercase'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div style={S.heroRight}>
          <div style={S.heroImgWrap} className="floating">
            <img src={heroImg} alt="AI Interview"
              style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:20}}
              onError={e => {
                e.target.style.display='none';
                e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px">🤖</div>';
              }}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section style={S.features}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div className="badge badge-blue" style={{marginBottom:12}}>What We Offer</div>
          <h2 style={S.sectionTitle}>Complete Interview Preparation</h2>
          <p style={S.sectionSub}>Everything you need to land your dream job</p>
        </div>

        <div style={S.featGrid}>
          {FEATURES.map((f,i) => (
            <div key={f.title} style={S.featCard}>
              <div style={{...S.featIcon, background:f.bg}}>{f.icon}</div>
              <h3 style={S.featTitle}>{f.title}</h3>
              <p style={S.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI INTERVIEWER SECTION (with chatbot image) ──────────────── */}
      <section style={S.aiSection}>
        <div style={S.aiLeft}>
          <div className="badge badge-green" style={{marginBottom:16}}>🤖 Real AI Interview</div>
          <h2 style={{...S.sectionTitle, textAlign:'left', marginBottom:16}}>
            Meet Your AI Interviewer
          </h2>
          <p style={{fontSize:16, color:'rgba(255,255,255,0.65)', lineHeight:1.75, marginBottom:24}}>
            Our AI interviewer speaks each question out loud, listens to your voice answers,
            and gives you detailed feedback — just like a real job interview.
          </p>
          {[
            '🎙️ AI speaks questions out loud',
            '🎤 Your voice answers are transcribed',
            '📊 Instant AI scoring and feedback',
            '📹 Webcam on throughout session',
            '⏱️ Choose 5-min or 10-min sessions',
          ].map(f => (
            <div key={f} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#00c875',flexShrink:0}}/>
              <span style={{fontSize:14,color:'rgba(255,255,255,0.7)'}}>{f}</span>
            </div>
          ))}
          <Link to={isAuth ? '/ai-interview' : '/register'}
            style={{...S.btnOrange, marginTop:24, display:'inline-block'}}>
            Try AI Interview →
          </Link>
        </div>
        <div style={S.aiRight}>
          <div style={S.aiImgWrap}>
            <img src={chatbotImg} alt="AI Chatbot Interviewer"
              style={{width:'100%',height:'100%',objectFit:'contain'}}
              onError={e => {
                e.target.style.display='none';
                e.target.parentElement.innerHTML='<div style="font-size:120px;text-align:center">🤖</div>';
              }}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section style={S.howSection}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div className="badge badge-orange" style={{marginBottom:12}}>Simple Steps</div>
          <h2 style={S.sectionTitle}>How MockMate AI Works</h2>
        </div>
        <div style={S.stepsGrid}>
          {STEPS.map((s,i) => (
            <div key={s.title} style={S.stepCard}>
              <div style={S.stepNum}>{i+1}</div>
              <div style={{fontSize:36,margin:'14px 0'}}>{s.icon}</div>
              <h3 style={{fontFamily:"'Libre Baskerville',serif",fontSize:17,color:'#fff',marginBottom:8}}>{s.title}</h3>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',lineHeight:1.65}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section style={S.cta}>
        <div style={S.ctaBox}>
          <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:30,color:'#fff',marginBottom:12}}>
            Ready to Ace Your Interview?
          </h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.6)',marginBottom:28}}>
            Join students mastering interviews with AI-powered practice.
          </p>
          <Link to={isAuth ? '/ai-interview' : '/register'}
            style={{...S.btnOrange, fontSize:16, padding:'14px 36px', display:'inline-block'}}>
            🚀 Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src={logo} alt="logo" style={{width:30,height:30,borderRadius:8,objectFit:'cover'}}
            onError={e=>e.target.style.display='none'}/>
          <span style={{fontFamily:"'Libre Baskerville',serif",fontSize:18,fontWeight:700,color:'#fff'}}>
            Mock<span style={{color:'#00c875'}}>Mate</span>
            <span style={{color:'#ff7c1a'}}> AI</span>
          </span>
        </div>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>© 2025 MockMate AI</p>
        <div style={{display:'flex',gap:16}}>
          {[['/',  'Home'],['/support','Support'],[isAuth?'/ai-interview':'/register','Start']].map(([p,l])=>(
            <Link key={l} to={p} style={{fontSize:13,color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {icon:'🤖',title:'AI Voice Interviewer',  desc:'Real webcam + voice interview. AI speaks, you answer with mic.',         bg:'rgba(0,200,117,0.18)'},
  {icon:'📄',title:'Resume Analysis',       desc:'Upload resume for skill extraction. Questions tailored to your profile.', bg:'rgba(255,124,26,0.18)'},
  {icon:'📊',title:'Performance Dashboard', desc:'Track scores, view history, monitor improvement with graphs.',            bg:'rgba(100,140,255,0.18)'},
  {icon:'💬',title:'AI Career Chatbot',     desc:'Ask interview questions, get career tips, practice with AI.',             bg:'rgba(0,200,117,0.18)'},
  {icon:'📋',title:'Career Guidance Form',  desc:'Fill your details — get AI-powered career direction and advice.',         bg:'rgba(255,124,26,0.18)'},
  {icon:'🆘',title:'Support Center',        desc:'FAQ, quick chat, and direct contact at mockmateai@gmail.com.',            bg:'rgba(100,140,255,0.18)'},
];

const STEPS = [
  {icon:'📝',title:'Register & Upload',   desc:'Create account, upload resume — skills extracted automatically.'},
  {icon:'🤖',title:'AI Asks Questions',   desc:'Enable webcam and mic. AI interviewer speaks each question aloud.'},
  {icon:'🎤',title:'You Answer by Voice', desc:'Speak your answers. Speech-to-text captures everything live.'},
  {icon:'📈',title:'Get Feedback & Score',desc:'AI scores your answers, shows strengths, weaknesses, and tips.'},
];

const S = {
  page: {minHeight:'100vh'},
  hero: {
    maxWidth:1280, margin:'0 auto', padding:'80px 32px 100px',
    display:'flex', alignItems:'center', gap:60, position:'relative',
  },
  heroGlow: {
    position:'absolute', top:-100, left:-100, width:600, height:600,
    background:'radial-gradient(circle,rgba(255,124,26,0.12) 0%,transparent 70%)',
    pointerEvents:'none', borderRadius:'50%',
  },
  heroLeft:  {flex:1, position:'relative', zIndex:1},
  heroTitle: {
    fontFamily:"'Libre Baskerville',serif",
    fontSize:'clamp(32px,5vw,54px)', color:'#fff',
    marginBottom:20, lineHeight:1.15,
  },
  heroDesc: {fontSize:17,color:'rgba(255,255,255,0.65)',maxWidth:480,lineHeight:1.75,marginBottom:32},
  heroBtns: {display:'flex',gap:14,flexWrap:'wrap',marginBottom:32},
  heroStats: {display:'flex',gap:24,flexWrap:'wrap'},
  hStat:     {textAlign:'center'},
  heroRight: {flex:1,display:'flex',justifyContent:'center',zIndex:1},
  heroImgWrap: {
    width:'100%',maxWidth:420,height:340,
    borderRadius:20, overflow:'hidden',
    boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
    border:'2px solid rgba(255,124,26,0.2)',
  },
  features: {padding:'80px 32px',maxWidth:1280,margin:'0 auto'},
  sectionTitle: {fontSize:'clamp(24px,4vw,36px)',color:'#fff',fontFamily:"'Libre Baskerville',serif",marginBottom:10},
  sectionSub:   {fontSize:16,color:'rgba(255,255,255,0.5)'},
  featGrid: {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20},
  featCard: {
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:14, padding:'26px 22px', transition:'all 0.3s',
  },
  featIcon:  {width:52,height:52,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:16},
  featTitle: {fontFamily:"'Libre Baskerville',serif",fontSize:17,color:'#fff',marginBottom:8},
  featDesc:  {fontSize:14,color:'rgba(255,255,255,0.55)',lineHeight:1.7},
  aiSection: {
    padding:'80px 32px',
    background:'rgba(0,0,0,0.2)',
    display:'flex', alignItems:'center', gap:60, maxWidth:1280, margin:'0 auto',
  },
  aiLeft:  {flex:1},
  aiRight: {flex:1,display:'flex',justifyContent:'center'},
  aiImgWrap: {
    width:'100%',maxWidth:400,height:360,
    display:'flex',alignItems:'center',justifyContent:'center',
  },
  howSection: {padding:'80px 32px',background:'rgba(0,0,0,0.15)',textAlign:'center'},
  stepsGrid: {maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:22},
  stepCard: {background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,124,26,0.15)',borderRadius:14,padding:'30px 22px',position:'relative',textAlign:'center'},
  stepNum: {position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#ff7c1a,#e8660a)',color:'#fff',width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14},
  cta: {padding:'80px 32px',textAlign:'center'},
  ctaBox: {maxWidth:640,margin:'0 auto',background:'linear-gradient(135deg,rgba(255,124,26,0.1),rgba(26,58,143,0.2))',border:'1px solid rgba(255,124,26,0.25)',borderRadius:22,padding:'56px 40px'},
  footer: {padding:'28px 32px',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16,maxWidth:1280,margin:'0 auto'},
  btnOrange: {background:'linear-gradient(135deg,#ff7c1a,#e8660a)',color:'#fff',textDecoration:'none',padding:'13px 28px',borderRadius:10,fontSize:15,fontWeight:700,fontFamily:"'Libre Baskerville',serif",boxShadow:'0 4px 16px rgba(232,102,10,0.4)',cursor:'pointer',border:'none'},
  btnOutline:{color:'#fff',textDecoration:'none',padding:'12px 24px',borderRadius:10,fontSize:15,fontWeight:600,border:'2px solid rgba(255,255,255,0.35)',fontFamily:"'Libre Baskerville',serif"},
};
