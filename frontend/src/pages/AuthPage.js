import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function makeCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, ans: String(a + b) };
}

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [cap,     setCap]     = useState(makeCaptcha);
  const [capVal,  setCapVal]  = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // ── Clear ALL fields every time mode changes or page mounts ──
  useEffect(() => {
    setForm({ name: '', email: '', password: '', confirm: '' });
    setCapVal('');
    setCap(makeCaptcha());
    setError('');
    setSuccess('');
  }, [mode]);

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const refreshCap = () => { setCap(makeCaptcha()); setCapVal(''); };

  const validate = () => {
    if (!form.email.trim())               return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address';
    if (!form.password)                   return 'Password is required';
    if (form.password.length < 6)         return 'Password must be at least 6 characters';
    if (!isLogin && !form.name.trim())    return 'Full name is required';
    if (!isLogin && form.password !== form.confirm) return 'Passwords do not match';
    if (capVal.trim() !== cap.ans)        return `Wrong answer. ${cap.a} + ${cap.b} = ?`;
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); refreshCap(); return; }
    setError(''); setLoading(true);
    try {
      const url  = isLogin ? '/api/login' : '/api/register';
      const body = isLogin
        ? { email: form.email.trim(), password: form.password }
        : { name: form.name.trim(), email: form.email.trim(), password: form.password };
      const { data } = await api.post(url, body);
      login(data.user, data.token);
      setSuccess(isLogin
        ? `✅ Welcome back, ${data.user.name.split(' ')[0]}! Login successful.`
        : `✅ Account created! Welcome to MockMate AI, ${data.user.name.split(' ')[0]}!`
      );
      setTimeout(() => navigate('/dashboard'), 1400);
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Please check your details and try again.');
      refreshCap();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.blob1} /><div style={S.blob2} />

      <div style={S.card}>
        <div style={S.cardHead}>
          <div style={S.icon}>⚡</div>
          <h1 style={S.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={S.sub}>
            {isLogin
              ? 'Sign in to continue your interview preparation'
              : 'Join MockMate AI and start practicing today'}
          </p>
        </div>

        {error   && <div style={S.alertErr}>⚠️ {error}</div>}
        {success && <div style={S.alertOk}>{success}</div>}

        <div style={S.form}>
          {!isLogin && (
            <div style={S.fg}>
              <label style={S.label}>FULL NAME</label>
              <input
                style={S.input} name="name" type="text"
                placeholder="Enter your full name"
                value={form.name} onChange={ch}
                autoComplete="off" autoCorrect="off" spellCheck="false"
              />
            </div>
          )}

          <div style={S.fg}>
            <label style={S.label}>EMAIL ADDRESS</label>
            <input
              style={S.input} name="email" type="text"
              placeholder="Enter your email"
              value={form.email} onChange={ch}
              autoComplete="off" autoCorrect="off"
            />
          </div>

          <div style={S.fg}>
            <label style={S.label}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...S.input, paddingRight: 44 }}
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder={isLogin ? 'Enter your password' : 'Minimum 6 characters'}
                value={form.password} onChange={ch}
                autoComplete="new-password"
                onKeyDown={e => e.key === 'Enter' && isLogin && handleSubmit()}
              />
              <button type="button" style={S.eye} onClick={() => setShowPw(!showPw)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div style={S.fg}>
              <label style={S.label}>CONFIRM PASSWORD</label>
              <input
                style={S.input} name="confirm"
                type={showPw ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={form.confirm} onChange={ch}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* CAPTCHA */}
          <div style={S.fg}>
            <label style={S.label}>SECURITY CHECK</label>
            <div style={S.capRow}>
              <div style={S.capQ}>
                <span style={S.capN}>{cap.a}</span>
                <span style={S.capOp}>+</span>
                <span style={S.capN}>{cap.b}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}>=</span>
                <span style={{ color: '#ff7c1a', fontWeight: 900, fontSize: 22 }}>?</span>
              </div>
              <input
                style={{ ...S.input, width: 100, textAlign: 'center', fontSize: 18, fontWeight: 700 }}
                type="number" placeholder="Answer"
                value={capVal}
                onChange={e => setCapVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoComplete="off"
              />
              <button type="button" style={S.capBtn} onClick={refreshCap} title="New question">🔄</button>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontStyle: 'italic' }}>
              Solve the math problem to prove you are human
            </p>
          </div>

          <button
            style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '⏳ Please wait…'
              : isLogin ? '🔑 Login to MockMate' : '🚀 Create My Account'}
          </button>
        </div>

        <p style={S.switchText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'} style={S.switchLink}>
            {isLogin ? 'Sign Up Free' : 'Login here'}
          </Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px', position: 'relative', overflow: 'hidden',
    fontFamily: "'Source Sans 3',sans-serif",
  },
  blob1: { position:'absolute',top:-150,right:-150,width:500,height:500,borderRadius:'50%',
    background:'radial-gradient(circle,rgba(255,124,26,0.25) 0%,transparent 70%)',pointerEvents:'none' },
  blob2: { position:'absolute',bottom:-150,left:-150,width:500,height:500,borderRadius:'50%',
    background:'radial-gradient(circle,rgba(26,58,143,0.4) 0%,transparent 70%)',pointerEvents:'none' },
  card: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 20, padding: '44px 40px',
    width: '100%', maxWidth: 460,
    backdropFilter: 'blur(24px)',
    position: 'relative', zIndex: 1,
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  cardHead: { textAlign: 'center', marginBottom: 28 },
  icon: {
    width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px',
    background: 'linear-gradient(135deg,#ff7c1a,#e8660a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, boxShadow: '0 4px 20px rgba(232,102,10,0.45)',
  },
  title: { fontFamily: "'Libre Baskerville',serif", fontSize: 28, color: '#fff', marginBottom: 8 },
  sub:   { fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 },
  alertErr: {
    background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.35)',
    borderRadius: 10, padding: '12px 16px', color: '#ffaaaa',
    fontSize: 14, marginBottom: 16, fontWeight: 500,
  },
  alertOk: {
    background: 'rgba(0,200,117,0.12)', border: '1px solid rgba(0,200,117,0.35)',
    borderRadius: 10, padding: '12px 16px', color: '#00c875',
    fontSize: 14, marginBottom: 16, fontWeight: 500,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 },
  fg:   { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.7px' },
  input: {
    background: 'rgba(255,255,255,0.1)',
    border: '1.5px solid rgba(255,255,255,0.2)',
    borderRadius: 10, padding: '13px 16px',
    color: '#fff', fontSize: 15, outline: 'none',
    width: '100%', boxSizing: 'border-box',
    fontFamily: "'Source Sans 3',sans-serif",
    transition: 'border-color 0.2s',
  },
  eye: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 16, color: 'rgba(255,255,255,0.45)',
  },
  capRow: { display: 'flex', alignItems: 'center', gap: 10 },
  capQ: {
    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
    background: 'rgba(255,124,26,0.12)', border: '1.5px solid rgba(255,124,26,0.3)',
    borderRadius: 10, padding: '10px 16px',
  },
  capN:  { fontFamily: "'Libre Baskerville',serif", fontSize: 22, fontWeight: 700, color: '#fff' },
  capOp: { fontSize: 20, color: '#ff7c1a', fontWeight: 700 },
  capBtn: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8, width: 38, height: 38, fontSize: 16, cursor: 'pointer', flexShrink: 0,
  },
  submitBtn: {
    background: 'linear-gradient(135deg,#ff7c1a,#e8660a)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '15px', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Libre Baskerville',serif",
    boxShadow: '0 4px 18px rgba(232,102,10,0.4)', width: '100%', marginTop: 4,
  },
  switchText: { textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 },
  switchLink: { color: '#ff7c1a', fontWeight: 700, textDecoration: 'none' },
};