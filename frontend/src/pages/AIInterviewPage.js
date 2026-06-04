import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const ROLES = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Analyst',
  'Machine Learning Engineer', 'UI/UX Designer', 'Business Analyst', 'QA Engineer',
  'Cloud Architect', 'Cybersecurity Analyst', 'Mobile Developer',
];

const STAGE = {
  SELECT:   'select',
  UPLOAD:   'upload',
  READY:    'ready',
  SESSION:  'session',
  DONE:     'done',
};

const SESSION_STATE = {
  AI_SPEAKING:   'ai_speaking',   // AI reads question aloud
  USER_SPEAKING: 'user_speaking', // User answers via mic
  PROCESSING:    'processing',    // Saving answer, moving on
  PAUSED:        'paused',        // User manually paused
};

export default function AIInterviewPage() {
  // ── Setup state ──────────────────────────────────────────────────────────
  const [stage,       setStage]       = useState(STAGE.SELECT);
  const [duration,    setDuration]    = useState(5);
  const [role,        setRole]        = useState('');
  const [customRole,  setCustomRole]  = useState('');
  const [resumeFile,  setResumeFile]  = useState(null);
  const [skills,      setSkills]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // ── Session state ────────────────────────────────────────────────────────
  const [questions,    setQuestions]    = useState([]);
  const [answers,      setAnswers]      = useState([]);
  const [curQ,         setCurQ]         = useState(0);
  const [interviewId,  setInterviewId]  = useState(null);
  const [sessionState, setSessionState] = useState(SESSION_STATE.AI_SPEAKING);
  const [transcript,   setTranscript]   = useState('');
  const [liveText,     setLiveText]     = useState('');
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [totalTime,    setTotalTime]    = useState(0);
  const [camOn,        setCamOn]        = useState(false);
  const [micOn,        setMicOn]        = useState(false);
  const [result,       setResult]       = useState(null);
  const [statusMsg,    setStatusMsg]    = useState('');
  const [isSpeaking,   setIsSpeaking]   = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const timerRef    = useRef(null);
  const recognRef   = useRef(null);
  const synthRef    = useRef(window.speechSynthesis);
  const answersRef  = useRef([]);
  const curQRef     = useRef(0);
  const questionsRef= useRef([]);

  // Keep refs in sync
  useEffect(() => { answersRef.current  = answers;   }, [answers]);
  useEffect(() => { curQRef.current     = curQ;      }, [curQ]);
  useEffect(() => { questionsRef.current= questions; }, [questions]);

// 🔥 FIX: Reattach camera when entering SESSION
  useEffect(() => {
  if (stage === STAGE.SESSION && streamRef.current && videoRef.current) {
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {});
  }
 }, [stage]);

  const finalRole = customRole.trim() || role;

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      synthRef.current?.cancel();
      recognRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Enable Webcam ────────────────────────────────────────────────────────
  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCamOn(true);
      setError('');
    } catch {
      setError('Camera blocked. Click the 🔒 lock icon in Chrome address bar → allow camera → refresh page.');
    }
  };

  const enableMic = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach(t => t.stop());
      setMicOn(true);
      setError('');
    } catch {
      setError('Microphone blocked. Click the 🔒 lock icon in Chrome address bar → allow microphone → refresh page.');
    }
  };

  // ── Text-to-Speech: AI speaks question ──────────────────────────────────
  const speakText = useCallback((text, onEnd) => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 0.9;
    utter.pitch = 1.0;
    utter.volume= 1.0;

    // Pick a good voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google') ||
      v.name.includes('Microsoft') ||
      v.lang === 'en-US'
    );
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend   = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
    utter.onerror = () => { setIsSpeaking(false); if (onEnd) onEnd(); };

    synthRef.current.speak(utter);
  }, []);

  // ── Speech-to-Text: user speaks answer ──────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please use Google Chrome.');
      return;
    }

    const recogn = new SpeechRecognition();
    recogn.lang         = 'en-US';
    recogn.continuous   = true;
    recogn.interimResults = true;
    recognRef.current   = recogn;

    let finalTranscript = '';

    recogn.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + ' ';
        } else {
          interim = text;
        }
      }
      setLiveText(interim);
      setTranscript(finalTranscript);
    };

    recogn.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setError(`Mic error: ${e.error}. Try speaking louder or check mic permissions.`);
      }
    };

    recogn.onend = () => {
      // Auto-restart if still in user_speaking state
      if (sessionState === SESSION_STATE.USER_SPEAKING) {
        try { recogn.start(); } catch {}
      }
    };

    try { recogn.start(); } catch {}
  }, [sessionState]);

  const stopListening = useCallback(() => {
    recognRef.current?.stop();
    recognRef.current = null;
  }, []);

  // ── Timer ────────────────────────────────────────────────────────────────
  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setTotalTime(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmitInterview();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Ask current question (AI speaks it) ─────────────────────────────────
  const askQuestion = useCallback((qIndex, qList) => {
    const q = qList[qIndex];
    if (!q) return;

    setSessionState(SESSION_STATE.AI_SPEAKING);
    setTranscript('');
    setLiveText('');
    setStatusMsg(`AI is asking Question ${qIndex + 1} of ${qList.length}…`);

    // AI announces question
    const intro = qIndex === 0
      ? `Hello! Welcome to your ${qList.length}-question mock interview for the role of ${finalRole}. I am your AI interviewer. Let us begin. Question ${qIndex + 1}: ${q}`
      : `Question ${qIndex + 1}: ${q}`;

    speakText(intro, () => {
      // After speaking, prompt user to answer
      setSessionState(SESSION_STATE.USER_SPEAKING);
      setStatusMsg('🎤 Your turn — speak your answer now. Click "Next Question" when done.');
      startListening();
    });
  }, [finalRole, speakText, startListening]);

  // ── Move to next question ────────────────────────────────────────────────
  const handleNextQuestion = () => {
    stopListening();
    synthRef.current.cancel();

    // Save answer
    const savedAnswer = (transcript + ' ' + liveText).trim() || '(No answer given)';
    const newAnswers = [...answersRef.current];
    newAnswers[curQRef.current] = savedAnswer;
    setAnswers(newAnswers);
    answersRef.current = newAnswers;

    const nextIndex = curQRef.current + 1;
    if (nextIndex >= questionsRef.current.length) {
      // All questions done
      handleSubmitInterview(newAnswers);
    } else {
      setSessionState(SESSION_STATE.PROCESSING);
      setStatusMsg('Moving to next question…');
      setCurQ(nextIndex);
      curQRef.current = nextIndex;
      setTimeout(() => askQuestion(nextIndex, questionsRef.current), 1000);
    }
  };

  // ── Submit interview ─────────────────────────────────────────────────────
  const handleSubmitInterview = async (finalAnswers) => {
    clearInterval(timerRef.current);
    stopListening();
    synthRef.current.cancel();
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);

    const answersToSubmit = finalAnswers || answersRef.current || [];

    if (!interviewId || answersToSubmit.length === 0) {
    console.error("Invalid submission data");
    setError("No answers recorded. Please try again.");
    return;
   }



    // Fill any blanks
    const filled = answersToSubmit.map(a => a?.trim() || '(No answer given)');

    setSessionState(SESSION_STATE.PROCESSING);
    setStatusMsg('🧠 AI is evaluating your answers…');
    setStage(STAGE.DONE);
    setLoading(true);

    try {
      console.log("Submitting:", {
      interview_id: interviewId,
      answers: filled,
      });
      const { data } = await api.post('/api/interview/submit', {
        interview_id: interviewId,
        answers: filled,
      });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission error. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  // ── Upload Resume ────────────────────────────────────────────────────────
  const uploadResume = async () => {
  if (!resumeFile) {
    setError('Please select a resume file');
    return;
  }

  setLoading(true);
  setError('');
  setStatusMsg('');

  try {
    const fd = new FormData();
    fd.append('file', resumeFile);

    const { data } = await api.post('/api/resume/upload', fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Resume Upload Response:', data);

    setSkills(data.skills || []);

    setStatusMsg(
      `✅ Resume "${resumeFile.name}" uploaded and parsed successfully`
    );

    setTimeout(() => {
      setStage(STAGE.READY);
    }, 1200);

  } catch (e) {
    console.error(e);

    setError(
      e.response?.data?.detail ||
      'Resume upload failed. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  // ── Start Interview Session ──────────────────────────────────────────────
  const startSession = async () => {
    if (!camOn)  { setError('Please enable your camera first'); return; }
    if (!micOn)  { setError('Please enable your microphone first'); return; }
    setLoading(true); setError('');
    try {
      const numQ = duration === 5 ? 5 : 10;
      const { data } = await api.post('/api/interview/create', {
        topic: finalRole,
        num_questions: numQ,
      });
      setInterviewId(data.interview_id);
      setQuestions(data.questions);
      questionsRef.current = data.questions;
      setAnswers(new Array(data.questions.length).fill(''));
      answersRef.current = new Array(data.questions.length).fill('');
      setCurQ(0);
      curQRef.current = 0;
      setStage(STAGE.SESSION);
      startTimer(duration * 60);

      // Small delay then AI starts speaking
      setTimeout(() => askQuestion(0, data.questions), 800);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to start. Is backend running?');
    } finally { setLoading(false); }
  };

  const reset = () => {streamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);
    synthRef.current?.cancel();
    recognRef.current?.stop();
    
    setStage(STAGE.SELECT); setRole(''); setCustomRole('');
    setResumeFile(null); setSkills([]); setResult(null); setError('');
    setCamOn(false); setMicOn(false); setQuestions([]); setAnswers([]);
    setTranscript(''); setLiveText(''); setStatusMsg('');
  };

  const sc = s => s >= 80 ? '#00c875' : s >= 60 ? '#ff7c1a' : '#ff6b6b';

  // ═══════════════════════════════════════════════════════════════════════
  // SELECT STAGE
  // ═══════════════════════════════════════════════════════════════════════
  if (stage === STAGE.SELECT) return (
    <div style={P.page}>
      <h1 style={P.h1}>🤖 AI Interviewer</h1>
      <p style={P.sub}>Real interview experience — AI speaks questions, you answer with your voice</p>
      {error && (
  <div style={P.err}>
    ⚠️ {error}
  </div>
)}

{statusMsg && (
  <div
    style={{
      background: 'rgba(0,200,117,0.12)',
      border: '1px solid rgba(0,200,117,0.35)',
      borderRadius: 10,
      padding: '12px 16px',
      color: '#00d084',
      fontSize: 14,
      marginBottom: 16,
    }}
  >
    {statusMsg}
  </div>
)}

      {/* Duration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[5, 10].map(d => (
          <div key={d} onClick={() => setDuration(d)} style={{
            borderRadius: 14, padding: 24, textAlign: 'center', cursor: 'pointer',
            background: duration === d ? 'rgba(255,124,26,0.14)' : 'rgba(255,255,255,0.05)',
            border: duration === d ? '2px solid #ff7c1a' : '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⏱️</div>
            <h2 style={{ fontFamily: "'Libre Baskerville',serif", color: '#fff', fontSize: 24, marginBottom: 6 }}>
              {d} Minutes
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              {d === 5 ? '5 questions · Quick practice' : '10 questions · Full simulation'}
            </p>
          </div>
        ))}
      </div>

      {/* Role */}
      <div style={P.card}>
        <h3 style={P.cardTitle}>🎯 Select Your Target Role</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r); setCustomRole(''); }} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: role === r && !customRole ? 'rgba(255,124,26,0.18)' : 'rgba(255,255,255,0.05)',
              border: role === r && !customRole ? '1.5px solid rgba(255,124,26,0.5)' : '1px solid rgba(255,255,255,0.12)',
              color: role === r && !customRole ? '#ff7c1a' : 'rgba(255,255,255,0.7)',
              fontFamily: "'Source Sans 3',sans-serif",
            }}>{r}</button>
          ))}
        </div>
        <label style={P.label}>Or type a custom role:</label>
        <input style={P.input} placeholder="e.g. Flutter Developer…"
          value={customRole} onChange={e => { setCustomRole(e.target.value); setRole(''); }}
          autoComplete="off" />
      </div>

      <button style={{ ...P.btnOrange, width: '100%', fontSize: 16, padding: '14px', opacity: finalRole ? 1 : 0.5 }}
        onClick={() => { if (!finalRole) { setError('Please select or enter a role'); return; } setStage(STAGE.UPLOAD); setError(''); }}
        disabled={!finalRole}>
        Next: Upload Resume →
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // UPLOAD STAGE
  // ═══════════════════════════════════════════════════════════════════════
  if (stage === STAGE.UPLOAD) return (
    <div style={P.page}>
      <h1 style={P.h1}>📄 Upload Resume</h1>
      <p style={P.sub}>Role: <strong style={{ color: '#ff7c1a' }}>{finalRole}</strong> · {duration}-min session</p>
      {error && <div style={P.err}>⚠️ {error}</div>}

      <div style={{
        border: '2px dashed rgba(255,124,26,0.4)', borderRadius: 16, padding: '48px 28px',
        textAlign: 'center', marginBottom: 20, background: 'rgba(255,124,26,0.03)',
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{resumeFile ? '📄' : '☁️'}</div>
        <p style={{ color: '#fff', fontSize: 16, fontFamily: "'Libre Baskerville',serif", marginBottom: 8 }}>
          {resumeFile ? resumeFile.name : 'Drop your resume here'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 18 }}>
          {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB` : 'Supports .txt and .pdf'}
        </p>
        <label style={P.browseBtn}>
          {resumeFile ? 'Change File' : 'Browse File'}
          <input type="file" accept=".txt,.pdf" style={{ display: 'none' }}
            onChange={e => { setResumeFile(e.target.files[0]); setError(''); }} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button style={{ ...P.btnGhost, flex: 1, padding: 13 }} onClick={() => setStage(STAGE.SELECT)}>← Back</button>
        <button style={{ ...P.btnOrange, flex: 2, padding: 13, opacity: loading || !resumeFile ? 0.65 : 1 }}
          onClick={uploadResume} disabled={loading || !resumeFile}>
          {loading ? '⏳ Analyzing…' : '🚀 Continue →'}
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // READY STAGE — Enable camera + mic
  // ═══════════════════════════════════════════════════════════════════════
  if (stage === STAGE.READY) return (
    <div style={P.page}>
      <h1 style={P.h1}>🎬 Setup Camera & Mic</h1>
      <p style={P.sub}>Both camera and microphone are required for the AI interview</p>
      {error && <div style={P.err}>⚠️ {error}</div>}

      {skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>Skills from resume:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {skills.map(s => <span key={s} style={P.chip}>{s}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Camera */}
        <div style={P.card}>
          <h3 style={P.cardTitle}>📷 Camera</h3>
          <div style={{
            width: '100%', height: 180, borderRadius: 10, overflow: 'hidden',
            background: '#000', border: `2px solid ${camOn ? 'rgba(0,200,117,0.5)' : 'rgba(255,255,255,0.1)'}`,
            marginBottom: 12, position: 'relative',
          }}>
            <video ref={videoRef} autoPlay muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: camOn ? 'block' : 'none' }} />
            {!camOn && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 40 }}>📷</div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 8 }}>Camera off</p>
              </div>
            )}
            {camOn && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,200,117,0.8)', borderRadius: 6,
                padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#fff',
              }}>● LIVE</div>
            )}
          </div>
          <button style={{
            width: '100%', padding: '11px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: camOn ? 'rgba(0,200,117,0.2)' : 'rgba(255,124,26,0.15)',
            border: camOn ? '1.5px solid rgba(0,200,117,0.4)' : '1.5px solid rgba(255,124,26,0.4)',
            color: camOn ? '#00c875' : '#ff7c1a', fontFamily: "'Source Sans 3',sans-serif",
          }} onClick={enableCamera}>
            {camOn ? '✅ Camera On' : '📷 Enable Camera'}
          </button>
        </div>

        {/* Microphone */}
        <div style={P.card}>
          <h3 style={P.cardTitle}>🎤 Microphone</h3>
          <div style={{
            width: '100%', height: 180, borderRadius: 10,
            background: micOn ? 'rgba(0,200,117,0.08)' : 'rgba(0,0,0,0.3)',
            border: `2px solid ${micOn ? 'rgba(0,200,117,0.4)' : 'rgba(255,255,255,0.1)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 56 }}>{micOn ? '🎤' : '🎙️'}</div>
            <p style={{ fontSize: 14, color: micOn ? '#00c875' : 'rgba(255,255,255,0.4)', marginTop: 12, fontWeight: 600 }}>
              {micOn ? 'Microphone Ready ✓' : 'Microphone Off'}
            </p>
            {micOn && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>Speech-to-text active</p>}
          </div>
          <button style={{
            width: '100%', padding: '11px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: micOn ? 'rgba(0,200,117,0.2)' : 'rgba(255,124,26,0.15)',
            border: micOn ? '1.5px solid rgba(0,200,117,0.4)' : '1.5px solid rgba(255,124,26,0.4)',
            color: micOn ? '#00c875' : '#ff7c1a', fontFamily: "'Source Sans 3',sans-serif",
          }} onClick={enableMic}>
            {micOn ? '✅ Mic On' : '🎤 Enable Microphone'}
          </button>
        </div>
      </div>

      {/* Browser note */}

      <button style={{
        ...P.btnOrange, width: '100%', fontSize: 16, padding: '15px',
        opacity: loading || !camOn || !micOn ? 0.5 : 1,
      }}
        onClick={startSession}
        disabled={loading || !camOn || !micOn}>
        {loading ? '⏳ Generating Questions…'
          : !camOn || !micOn ? '⚠️ Enable Camera + Mic First'
          : `⚡ Start ${duration}-Minute AI Interview`}
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // SESSION STAGE — Live interview
  // ═══════════════════════════════════════════════════════════════════════
  if (stage === STAGE.SESSION) {
    const pct = (timeLeft / totalTime) * 100;
    const isAISpeaking   = sessionState === SESSION_STATE.AI_SPEAKING;
    const isUserSpeaking = sessionState === SESSION_STATE.USER_SPEAKING;

    return (
      <div style={{ ...P.page, maxWidth: 1000 }}>
        {/* Timer */}
        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,124,26,0.25)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Question {curQ + 1} of {questions.length} · {finalRole}
            </span>
            <span style={{
              fontSize: 26, fontWeight: 900, fontFamily: "'Libre Baskerville',serif",
              color: timeLeft < 60 ? '#ff6b6b' : '#ff7c1a',
            }}>⏱️ {formatTime(timeLeft)}</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 3,
              background: timeLeft < 60 ? '#ff6b6b' : 'linear-gradient(90deg,#ff7c1a,#e8660a)',
              transition: 'width 1s linear',
            }} />
          </div>
        </div>

        {/* Main layout: camera + AI + question */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* User camera */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%', height: 200, borderRadius: 12, overflow: 'hidden',
              background: '#000',
              border: `2px solid ${isUserSpeaking ? 'rgba(0,200,117,0.6)' : 'rgba(255,255,255,0.15)'}`,
              boxShadow: isUserSpeaking ? '0 0 20px rgba(0,200,117,0.3)' : 'none',
              transition: 'all 0.3s',
            }}>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{
              position: 'absolute', bottom: 10, left: 10,
              background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '4px 10px',
              fontSize: 12, color: '#fff', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {isUserSpeaking
                ? <><span style={{ color: '#00c875' }}>●</span> Speaking…</>
                : <><span style={{ color: 'rgba(255,255,255,0.4)' }}>●</span> You</>
              }
            </div>
          </div>

          {/* AI interviewer */}
          <div style={{
            height: 200, borderRadius: 12, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,rgba(26,58,143,0.5),rgba(0,0,0,0.3))',
            border: `2px solid ${isAISpeaking ? 'rgba(255,124,26,0.6)' : 'rgba(255,255,255,0.15)'}`,
            boxShadow: isAISpeaking ? '0 0 20px rgba(255,124,26,0.3)' : 'none',
            transition: 'all 0.3s', position: 'relative',
          }}>
            <div style={{
              fontSize: 64,
              animation: isAISpeaking ? 'float 1s ease-in-out infinite' : 'none',
            }}>🤖</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
              MockMate AI Interviewer
            </p>
            {isAISpeaking && (
              <div style={{
                position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255,124,26,0.2)', border: '1px solid rgba(255,124,26,0.4)',
                borderRadius: 6, padding: '4px 12px',
                fontSize: 12, color: '#ff7c1a', fontWeight: 700,
              }}>🔊 Speaking…</div>
            )}
          </div>
        </div>

        {/* Status message */}
        <div style={{
          background: isUserSpeaking
            ? 'rgba(0,200,117,0.1)' : 'rgba(255,124,26,0.08)',
          border: `1px solid ${isUserSpeaking ? 'rgba(0,200,117,0.3)' : 'rgba(255,124,26,0.2)'}`,
          borderRadius: 10, padding: '10px 16px', marginBottom: 14, textAlign: 'center',
          fontSize: 14, color: '#fff', fontWeight: 500,
        }}>
          {statusMsg}
        </div>

        {/* Current question */}
        {questions[curQ] && (
          <div style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,124,26,0.25)',
            borderRadius: 14, padding: 22, marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{
                background: 'linear-gradient(135deg,#ff7c1a,#e8660a)',
                color: '#fff', padding: '3px 12px', borderRadius: 6,
                fontSize: 12, fontWeight: 800,
              }}>Q{curQ + 1}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                {isAISpeaking ? '🔊 AI is reading this question aloud…' : '🎤 Speak your answer'}
              </span>
            </div>
            <p style={{ fontSize: 16, color: '#fff', lineHeight: 1.65, margin: 0, fontFamily: "'Libre Baskerville',serif" }}>
              {questions[curQ]}
            </p>
          </div>
        )}

        {/* Live transcript */}
        <div style={{
          background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,200,117,0.2)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 14, minHeight: 80,
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🎤 YOUR SPOKEN ANSWER (live transcript)
          </div>
          <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.7, margin: 0 }}>
            {transcript}
            {liveText && <span style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>{liveText}</span>}
            {!transcript && !liveText && (
              <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                {isUserSpeaking ? 'Listening… start speaking your answer' : 'Waiting for your turn…'}
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12 }}>
          {isAISpeaking && (
            <button style={{ ...P.btnGhost, flex: 1, padding: '13px' }}
              onClick={() => {
                synthRef.current.cancel();
                setSessionState(SESSION_STATE.USER_SPEAKING);
                setStatusMsg('🎤 Your turn — speak your answer now. Click "Next Question" when done.');
                startListening();
              }}>
              ⏭ Skip to My Turn
            </button>
          )}
          {isUserSpeaking && (
            <>
              <button style={{ ...P.btnGhost, padding: '13px 20px' }}
                onClick={() => {
                  stopListening();
                  setTranscript('');
                  setLiveText('');
                  startListening();
                }}>
                🔄 Re-record
              </button>
              <button style={{ ...P.btnGreen, flex: 1, padding: '13px' }}
                onClick={handleNextQuestion}>
                {curQ < questions.length - 1 ? 'Next Question →' : '🚀 Finish Interview'}
              </button>
            </>
          )}
          <button style={{ ...P.btnGhost, padding: '13px 16px', color: '#ffaaaa', borderColor: 'rgba(255,100,100,0.3)' }}
            onClick={() => handleSubmitInterview()}>
            End
          </button>
        </div>
      </div>
    );
  }

// ═══════════════════════════════════════════════════════════════════════
// DONE STAGE
// ═══════════════════════════════════════════════════════════════════════
if (stage === STAGE.DONE) {

  if (loading) return (
    <div style={{
      ...P.page,
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🧠</div>

      <h2 style={{ color: '#fff' }}>
        AI is evaluating your interview…
      </h2>

      <div style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(255,124,26,0.2)',
        borderTopColor: '#ff7c1a',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginTop: 20
      }} />
    </div>
  );

  console.log("RESULT:", result);  // 👈 DEBUG

  if (result) {
    const score = result?.score ?? 0;

    return (
      <div style={P.page}>

        {/* SCORE */}
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#ff7c1a'
          }}>
            {score}
          </div>

          <div style={{ color: '#aaa' }}>/100</div>

          <h2 style={{ color: '#fff' }}>
            Interview Completed!
          </h2>
        </div>

        {/* BUTTONS */}
        <div style={{
  display: 'flex',
  gap: 16,
  marginTop: 50,
  justifyContent: 'center'
}}>

  <button
    style={{
      ...P.btnGhost,
      flex: 1,
      maxWidth: 220,
      padding: '18px 20px',
      fontSize: 16,
      borderRadius: 14
    }}
    onClick={reset}
  >
    🔄 New Interview
  </button>

  <button
    style={{
      ...P.btnOrange,
      flex: 1,
      maxWidth: 220,
      padding: '18px 20px',
      fontSize: 16,
      borderRadius: 14
    }}
    onClick={() => window.location.href = '/dashboard'}
  >
    📊 Dashboard →
  </button>

</div>

      </div>
    );
  }

  return null;
}

// ✅ CLOSE COMPONENT FUNCTION HERE (VERY IMPORTANT)
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES (DO NOT TOUCH)
// ═══════════════════════════════════════════════════════════════════════
const P = {
  page:     { padding: '28px 24px', maxWidth: 900, margin: '0 auto', fontFamily: "'Source Sans 3',sans-serif" },
  h1:       { fontFamily: "'Libre Baskerville',serif", fontSize: 28, color: '#fff', margin: '0 0 8px' },
  sub:      { fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  err:      { background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.35)', borderRadius: 10, padding: '12px 16px', color: '#ffaaaa', fontSize: 14, marginBottom: 16 },
  card:     { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, marginBottom: 20 },
  cardTitle:{ fontFamily: "'Libre Baskerville',serif", fontSize: 16, color: '#fff', marginBottom: 14 },
  label:    { display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.7px', marginBottom: 8 },
  input:    { background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Source Sans 3',sans-serif" },
  btnOrange:{ background: 'linear-gradient(135deg,#ff7c1a,#e8660a)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Libre Baskerville',serif", boxShadow: '0 4px 16px rgba(232,102,10,0.4)' },
  btnGreen: { background: 'linear-gradient(135deg,#00c875,#00a85e)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Libre Baskerville',serif" },
  btnGhost: { background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Source Sans 3',sans-serif" },
  chip:     { display: 'inline-block', background: 'rgba(0,200,117,0.12)', border: '1px solid rgba(0,200,117,0.3)', color: '#00c875', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  browseBtn:{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '9px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600 },
  infoBox:  { background: 'rgba(255,124,26,0.06)', border: '1px solid rgba(255,124,26,0.2)', borderRadius: 14, padding: '18px 22px', marginBottom: 24 },
};