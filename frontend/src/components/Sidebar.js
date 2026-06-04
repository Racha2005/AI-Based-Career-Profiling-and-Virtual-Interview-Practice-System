import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { icon: '📊', label: 'Dashboard',          path: '/dashboard'    },
  { icon: '🤖', label: 'AI Interviewer',      path: '/ai-interview' },
  { icon: '💬', label: 'AI Chatbot',          path: '/chatbot'      },
  { icon: 'ℹ️', label: 'About Us',            path: '/about'        },
  { icon: '🆘', label: 'Support',             path: '/support'      },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <aside style={S.sidebar}>
      {/* Profile */}
      <div style={S.profile}>
        <div style={S.avatar}>{initial}</div>
        <div style={S.userInfo}>
          <div style={S.userName}>{user?.name || 'User'}</div>
          <div style={S.userEmail}>{user?.email || ''}</div>
        </div>
      </div>
      <div style={S.divider}/>

      {/* Nav */}
      <nav style={S.nav}>
        {NAV.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              ...S.link,
              background: active ? 'rgba(255,124,26,0.18)' : 'transparent',
              color:       active ? '#ff7c1a' : 'rgba(255,255,255,0.65)',
              border:      active ? '1px solid rgba(255,124,26,0.3)' : '1px solid transparent',
            }}>
              <span style={{fontSize:17}}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{flex:1}}/>

      <button style={S.logoutBtn} onClick={handleLogout}>
        🚪 <span>Logout</span>
      </button>
    </aside>
  );
}

const S = {
  sidebar: { width:240, flexShrink:0, background:'rgba(10,24,64,0.55)', borderRight:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(16px)', padding:'24px 14px', display:'flex', flexDirection:'column', gap:4, minHeight:'calc(100vh - 68px)', position:'sticky', top:68, height:'calc(100vh - 68px)', overflowY:'auto' },
  profile: { display:'flex', alignItems:'center', gap:11, padding:'14px 12px', background:'rgba(255,124,26,0.1)', border:'1px solid rgba(255,124,26,0.2)', borderRadius:12, marginBottom:6 },
  avatar: { width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#ff7c1a,#00c875)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, fontWeight:900, color:'#fff', flexShrink:0, fontFamily:"'Libre Baskerville',serif" },
  userInfo: { minWidth:0 },
  userName:  { fontSize:14, fontWeight:700, color:'#fff', fontFamily:"'Libre Baskerville',serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  userEmail: { fontSize:11, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  divider:   { height:1, background:'rgba(255,255,255,0.08)', margin:'8px 0' },
  nav:       { display:'flex', flexDirection:'column', gap:3 },
  link:      { display:'flex', alignItems:'center', gap:10, textDecoration:'none', padding:'11px 13px', borderRadius:10, fontSize:14, fontWeight:600, transition:'all 0.2s', fontFamily:"'Source Sans 3',sans-serif" },
  logoutBtn: { display:'flex', alignItems:'center', gap:10, background:'rgba(255,80,80,0.1)', border:'1px solid rgba(255,80,80,0.25)', color:'#ff8888', padding:'11px 13px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Source Sans 3',sans-serif", marginTop:10, width:'100%', textAlign:'left' },
};