import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Images
import heroImg    from '../assets/images/ai-hero.png';
import chatbotImg from '../assets/images/ai-chatbot.png';

export default function DashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner"/>
      <p className="loading-text">Loading dashboard…</p>
    </div>
  );

  const graph  = (data?.graph_data || []).map((d, i) => ({ label: `#${i+1}`, score: d.score }));
  const sc = s => s >= 80 ? '#00c875' : s >= 60 ? '#ff7c1a' : '#ff6b6b';

  return (
    <div style={S.page}>

      {/* ── WELCOME HERO BANNER (with image 9 - ai-hero) ── */}
      <div style={S.welcomeBanner}>
        <div style={S.welcomeLeft}>
          <h1 style={S.welcomeTitle}>
            Welcome back, <span style={{color:'#ff7c1a'}}>{user?.name?.split(' ')[0]} 👋</span>
          </h1>
          <p style={S.welcomeSub}>{user?.email}</p>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.55)',marginTop:8,lineHeight:1.6,maxWidth:420}}>
            Ready to practice? Start an AI interview, chat with your career coach, or review your performance below.
          </p>
          <div style={S.welcomeBtns}>
            <Link to="/ai-interview" style={S.btnOrange}>🤖 Start AI Interview</Link>
            <Link to="/chatbot"      style={S.btnGreen}>💬 AI Chatbot</Link>
            <Link to="/career-form"  style={S.btnGhost}>📋 Career Form</Link>
          </div>
        </div>
        <div style={S.welcomeRight}>
          <img src={heroImg} alt="Interview preparation"
            style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:16}}
            onError={e => { e.target.style.display='none'; }}
          />
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={S.statsGrid}>
        {[
          {icon:'🎤', label:'Total Interviews', val: data?.total_interviews || 0,       color:'#ff7c1a'},
          {icon:'📈', label:'Average Score',    val: data?.average_score ? `${data.average_score}%`:'N/A', color:'#00c875'},
          {icon:'⚡', label:'Last Score',       val: data?.last_interview?.score ? `${data.last_interview.score}%`:'N/A', color:'#7eb0ff'},
          {icon:'🏆', label:'Last Topic',       val: data?.last_interview?.topic || 'None yet', color:'#ff7c1a', small:true},
        ].map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={{fontSize:28,marginBottom:10}}>{s.icon}</div>
            <div style={{fontSize: s.small?16:28, fontWeight:900, color:s.color, marginBottom:6,
              fontFamily:"'Libre Baskerville',serif", lineHeight:1}}>
              {s.val}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.6px',fontWeight:700}}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={S.twoCol}>
        {/* Left: Graph + History */}
        <div style={{flex:2,display:'flex',flexDirection:'column',gap:20}}>
          {/* Performance Graph */}
          {graph.length > 0 ? (
            <div style={S.card}>
              <h3 style={S.cardTitle}>📈 Performance Over Time</h3>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={graph}>
                  <defs>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ff7c1a" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#ff7c1a" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3"/>
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" tick={{fontSize:12,fill:'rgba(255,255,255,0.4)'}}/>
                  <YAxis domain={[0,100]}  stroke="rgba(255,255,255,0.25)" tick={{fontSize:12,fill:'rgba(255,255,255,0.4)'}}/>
                  <Tooltip contentStyle={{background:'#1a3a8f',border:'1px solid rgba(255,124,26,0.3)',borderRadius:10}}
                    labelStyle={{color:'#fff',fontWeight:700}} itemStyle={{color:'#ff7c1a'}}/>
                  <Area type="monotone" dataKey="score" stroke="#ff7c1a" strokeWidth={2.5} fill="url(#gr)"
                    dot={{fill:'#ff7c1a',r:5,stroke:'#0d1f4a',strokeWidth:2}} activeDot={{r:7,fill:'#00c875'}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{...S.card,textAlign:'center',padding:'40px 20px'}}>
              <div style={{fontSize:48,marginBottom:14}}>📊</div>
              <p style={{color:'rgba(255,255,255,0.45)',fontFamily:"'Libre Baskerville',serif",marginBottom:16}}>
                Complete your first interview to see your performance graph
              </p>
              <Link to="/ai-interview" style={S.btnOrange}>Start Interview</Link>
            </div>
          )}

          {/* History */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>📋 Interview History</h3>
            {!data?.history?.length ? (
              <div style={{textAlign:'center',padding:'28px 0'}}>
                <div style={{fontSize:48,marginBottom:12}}>🎯</div>
                <p style={{color:'rgba(255,255,255,0.45)',marginBottom:16,fontFamily:"'Libre Baskerville',serif"}}>
                  No interviews yet
                </p>
                <Link to="/ai-interview" style={S.btnOrange}>Start First Interview</Link>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:20,padding:'0 14px 10px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                  {['Topic','Date','Score'].map(h=>(
                    <span key={h} style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</span>
                  ))}
                </div>
                {data.history.map((h,i) => (
                  <div key={i} style={{
                    display:'grid', gridTemplateColumns:'1fr auto auto', gap:20, alignItems:'center',
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:10, padding:'13px 14px',
                  }}>
                    <span style={{fontSize:14,fontWeight:600,color:'#fff'}}>🎤 {h.topic}</span>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',whiteSpace:'nowrap'}}>
                      {new Date(h.taken_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                    </span>
                    <span style={{fontSize:20,fontWeight:900,color:sc(h.score),fontFamily:"'Libre Baskerville',serif"}}>
                      {h.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Chatbot promo (with chatbot image - image 10) */}
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:20}}>
          <div style={S.chatbotPromo}>
            <div style={S.chatbotImgWrap}>
              <img src={chatbotImg} alt="AI Chatbot"
                style={{width:'100%',height:'100%',objectFit:'contain'}}
                onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML='<div style="font-size:80px;text-align:center">🤖</div>';}}
              />
            </div>
            <h3 style={{fontFamily:"'Libre Baskerville',serif",fontSize:17,color:'#fff',marginBottom:8,marginTop:8}}>
              AI Career Chatbot
            </h3>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',lineHeight:1.65,marginBottom:16}}>
              Ask interview questions, get career tips, practice Q&A with your personal AI coach available 24/7.
            </p>
            <Link to="/chatbot" style={{...S.btnOrange, display:'block', textAlign:'center', textDecoration:'none'}}>
              💬 Open Chatbot
            </Link>
          </div>

          {/* Quick actions */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>⚡ Quick Actions</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {icon:'🤖',label:'AI Interview (5 min)', path:'/ai-interview', color:S.btnOrange},
                {icon:'📄',label:'Upload Resume',        path:'/ai-interview', color:S.btnGreen},
                {icon:'📋',label:'Career Form',          path:'/career-form',  color:S.btnGhost},
              ].map(a=>(
                <Link key={a.label} to={a.path} style={{...a.color,textAlign:'center',textDecoration:'none',padding:'11px',display:'block'}}>
                  {a.icon} {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {padding:'28px 24px',maxWidth:1200,fontFamily:"'Source Sans 3',sans-serif"},
  welcomeBanner: {
    display:'flex', alignItems:'stretch', gap:0,
    background:'linear-gradient(135deg,rgba(26,58,143,0.5),rgba(232,102,10,0.2))',
    border:'1px solid rgba(255,124,26,0.2)',
    borderRadius:18, overflow:'hidden', marginBottom:24, minHeight:200,
  },
  welcomeLeft:  {flex:1,padding:'28px 32px'},
  welcomeRight: {width:280,flexShrink:0,overflow:'hidden'},
  welcomeTitle: {fontFamily:"'Libre Baskerville',serif",fontSize:24,color:'#fff',marginBottom:6},
  welcomeSub:   {fontSize:13,color:'rgba(255,255,255,0.4)'},
  welcomeBtns:  {display:'flex',gap:10,marginTop:20,flexWrap:'wrap'},
  statsGrid: {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24},
  statCard:  {background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'22px',textAlign:'center'},
  twoCol:    {display:'flex',gap:20,alignItems:'flex-start'},
  card:      {background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'22px'},
  cardTitle: {fontFamily:"'Libre Baskerville',serif",fontSize:17,color:'#fff',marginBottom:18},
  chatbotPromo: {
    background:'linear-gradient(135deg,rgba(0,200,117,0.1),rgba(255,124,26,0.08))',
    border:'1px solid rgba(0,200,117,0.2)',
    borderRadius:14, padding:'22px', textAlign:'center',
  },
  chatbotImgWrap:{height:160,display:'flex',alignItems:'center',justifyContent:'center'},
  btnOrange: {background:'linear-gradient(135deg,#ff7c1a,#e8660a)',color:'#fff',textDecoration:'none',padding:'10px 18px',borderRadius:9,fontSize:13,fontWeight:700,fontFamily:"'Libre Baskerville',serif",border:'none',cursor:'pointer'},
  btnGreen:  {background:'linear-gradient(135deg,#00c875,#00a85e)',color:'#fff',textDecoration:'none',padding:'10px 18px',borderRadius:9,fontSize:13,fontWeight:700,fontFamily:"'Libre Baskerville',serif",border:'none',cursor:'pointer'},
  btnGhost:  {background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.7)',textDecoration:'none',padding:'10px 18px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer'},
};
