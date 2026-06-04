import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/mockmate_ai_logo.jpg';

export default function Topbar() {
  const { isAuth, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };
  const isActive = (p) => location.pathname === p;

  const lnk = (p) => ({
    color: isActive(p) ? '#ff7c1a' : 'rgba(255,255,255,0.78)',
    textDecoration: 'none', padding: '7px 13px', borderRadius: 8,
    fontSize: 14, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
    background: isActive(p) ? 'rgba(255,124,26,0.12)' : 'transparent',
    border: isActive(p) ? '1px solid rgba(255,124,26,0.25)' : '1px solid transparent',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  });

  return (
    <header style={S.bar}>
      <div style={S.inner}>
        {/* Logo */}
        <Link to="/" style={S.logo}>
          <img src={logo} alt="MockMate AI"
            style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }}
            onError={e => { e.target.style.display='none'; }}
          />
          <span style={S.logoText}>
            Mock<span style={{color:'#00c875'}}>Mate</span>
            <span style={{color:'#ff7c1a'}}> AI</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={S.nav}>
          <Link to="/"            style={lnk('/')}>🏠 Home</Link>
          {isAuth && <>
            <Link to="/dashboard" style={lnk('/dashboard')}>📊 Dashboard</Link>
            <Link to="/ai-interview" style={lnk('/ai-interview')}>🤖 AI Interviewer</Link>
            <Link to="/chatbot"   style={lnk('/chatbot')}>💬 Chatbot</Link>
          </>}
          <Link to="/support"     style={lnk('/support')}>🆘 Support</Link>
        </nav>

        {/* Auth */}
        <div style={S.auth}>
          {isAuth ? (
            <>
              <span style={S.greet}>👤 {user?.name?.split(' ')[0]}</span>
              <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    style={S.loginBtn}>Login</Link>
              <Link to="/register" style={S.signupBtn}>Sign Up</Link>
            </>
          )}
        </div>
        <button style={S.tog} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div style={S.mob}>
          {[['/', '🏠 Home'], ...(isAuth ? [
            ['/dashboard','📊 Dashboard'],
            ['/ai-interview','🤖 AI Interviewer'],
            ['/chatbot','💬 Chatbot'],
          ] : []), ['/support','🆘 Support']].map(([p, l]) => (
            <Link key={p} to={p} style={S.mobLnk} onClick={() => setMobileOpen(false)}>{l}</Link>
          ))}
          <div style={{display:'flex',gap:10,marginTop:10}}>
            {isAuth
              ? <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
              : <>
                  <Link to="/login"    style={S.loginBtn}  onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/register" style={S.signupBtn} onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </>
            }
          </div>
        </div>
      )}
    </header>
  );
}

const S = {
  bar: { background:'rgba(10,24,64,0.95)', borderBottom:'1px solid rgba(255,255,255,0.1)', position:'sticky', top:0, zIndex:1000, backdropFilter:'blur(20px)', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' },
  inner: { maxWidth:1300, margin:'0 auto', padding:'0 24px', height:68, display:'flex', alignItems:'center', gap:16 },
  logo: { display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 },
  logoText: { fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.3px' },
  nav: { display:'flex', alignItems:'center', gap:2, flex:1, justifyContent:'center', flexWrap:'wrap' },
  auth: { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  greet: { fontSize:13, color:'rgba(255,255,255,0.65)', fontFamily:"'Source Sans 3',sans-serif" },
  loginBtn: { color:'#fff', textDecoration:'none', padding:'8px 18px', borderRadius:9, fontSize:14, fontWeight:700, border:'1.5px solid rgba(255,255,255,0.3)', fontFamily:"'Libre Baskerville',serif" },
  signupBtn: { background:'linear-gradient(135deg,#ff7c1a,#e8660a)', color:'#fff', textDecoration:'none', padding:'9px 20px', borderRadius:9, fontSize:14, fontWeight:700, fontFamily:"'Libre Baskerville',serif", boxShadow:'0 3px 14px rgba(232,102,10,0.45)' },
  logoutBtn: { background:'rgba(255,80,80,0.12)', border:'1px solid rgba(255,80,80,0.3)', color:'#ff8888', padding:'8px 18px', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Source Sans 3',sans-serif" },
  tog: { display:'none', background:'none', border:'none', color:'#fff', fontSize:22, cursor:'pointer' },
  mob: { display:'flex', flexDirection:'column', padding:'16px 20px 20px', gap:4, background:'rgba(10,24,64,0.97)', borderTop:'1px solid rgba(255,255,255,0.08)' },
  mobLnk: { color:'rgba(255,255,255,0.7)', textDecoration:'none', padding:'11px 14px', borderRadius:8, fontSize:15, fontWeight:600, fontFamily:"'Source Sans 3',sans-serif" },
};