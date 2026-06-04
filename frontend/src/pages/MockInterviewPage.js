// MockInterviewPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TOPICS=['Python Programming','JavaScript & React','Data Science','Machine Learning',
              'System Design','SQL & Databases','Java Programming','DevOps & Docker',
              'Behavioral Questions','Problem Solving','Web Development','Data Structures',
              'Node.js','AWS Cloud','Communication Skills','Leadership'];
const STAGE={SETUP:'setup',INTERVIEW:'interview',SUBMITTING:'submitting',DONE:'done'};

export default function MockInterviewPage() {
  const [stage,setStage]=useState(STAGE.SETUP);
  const [topic,setTopic]=useState('');
  const [custom,setCustom]=useState('');
  const [numQ,setNumQ]=useState(5);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [ivId,setIvId]=useState(null);
  const [questions,setQuestions]=useState([]);
  const [answers,setAnswers]=useState([]);
  const [curQ,setCurQ]=useState(0);
  const [curAns,setCurAns]=useState('');
  const [result,setResult]=useState(null);
  const navigate=useNavigate();

  const finalTopic=custom.trim()||topic;

  const start=async()=>{
    if(!finalTopic){setError('Please select or enter a topic');return;}
    setError('');setLoading(true);
    try{
      const{data}=await api.post('/api/interview/create',{topic:finalTopic,num_questions:numQ});
      setIvId(data.interview_id);setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(''));
      setCurQ(0);setCurAns('');setStage(STAGE.INTERVIEW);
    }catch(e){setError(e.response?.data?.detail||'Failed to start.');}
    finally{setLoading(false);}
  };

  const saveGo=(idx)=>{
    const a=[...answers];a[curQ]=curAns;setAnswers(a);setCurQ(idx);setCurAns(a[idx]||'');
  };

  const submit=async()=>{
    const fa=[...answers];fa[curQ]=curAns;
    const blanks=fa.filter(a=>!a.trim()).length;
    if(blanks>0&&!window.confirm(`${blanks} unanswered. Submit anyway?`))return;
    setStage(STAGE.SUBMITTING);setLoading(true);
    try{
      const{data}=await api.post('/api/interview/submit',{interview_id:ivId,answers:fa});
      setResult(data);setStage(STAGE.DONE);
    }catch(e){setError(e.response?.data?.detail||'Submission failed.');setStage(STAGE.INTERVIEW);}
    finally{setLoading(false);}
  };

  const P={padding:'32px 28px',maxWidth:820,margin:'0 auto',fontFamily:"'Source Sans 3',sans-serif"};
  const sc=s=>s>=80?'#00c875':s>=60?'#ff7c1a':'#ff6b6b';

  if(stage===STAGE.SETUP) return(
    <div style={P}>
      <h1 style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,color:'#fff',marginBottom:8}}>🎯 Start Mock Interview</h1>
      <p style={{color:'rgba(255,255,255,0.5)',marginBottom:28}}>Choose your topic and number of questions</p>
      {error&&<div className="alert-error" style={{marginBottom:16}}>⚠️ {error}</div>}
      <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:28}}>
        <h3 style={{fontFamily:"'Libre Baskerville',serif",color:'#fff',fontSize:16,marginBottom:16}}>📚 Select Topic</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:20}}>
          {TOPICS.map(t=>(
            <button key={t} onClick={()=>{setTopic(t);setCustom('');}} style={{
              padding:'7px 14px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',
              background:topic===t&&!custom?'rgba(255,124,26,0.18)':'rgba(255,255,255,0.05)',
              border:topic===t&&!custom?'1.5px solid rgba(255,124,26,0.5)':'1px solid rgba(255,255,255,0.12)',
              color:topic===t&&!custom?'#ff7c1a':'rgba(255,255,255,0.7)',
              fontFamily:"'Source Sans 3',sans-serif",
            }}>{t}</button>
          ))}
        </div>
        <div style={{margin:'0 0 16px'}}>
          <label className="form-label" style={{marginBottom:8,display:'block'}}>Or custom topic:</label>
          <input className="form-input" placeholder="e.g. Flutter, Kubernetes…"
            value={custom} onChange={e=>{setCustom(e.target.value);setTopic('');}}/>
        </div>
        <h3 style={{fontFamily:"'Libre Baskerville',serif",color:'#fff',fontSize:16,marginBottom:14}}>🔢 Number of Questions</h3>
        <div style={{display:'flex',gap:12,marginBottom:28}}>
          {[3,5,7,10].map(n=>(
            <button key={n} onClick={()=>setNumQ(n)} style={{
              width:56,height:56,borderRadius:10,fontSize:18,fontWeight:700,cursor:'pointer',
              background:numQ===n?'rgba(255,124,26,0.18)':'rgba(255,255,255,0.05)',
              border:numQ===n?'1.5px solid rgba(255,124,26,0.5)':'1px solid rgba(255,255,255,0.12)',
              color:numQ===n?'#ff7c1a':'rgba(255,255,255,0.7)',
              fontFamily:"'Libre Baskerville',serif",
            }}>{n}</button>
          ))}
        </div>
        <button className="btn-orange" style={{width:'100%',fontSize:16,padding:'15px',opacity:loading?0.65:1}}
          onClick={start} disabled={loading}>
          {loading?'⏳ Generating…':'⚡ Start Interview'}
        </button>
      </div>
    </div>
  );

  if(stage===STAGE.SUBMITTING) return(
    <div style={{...P,minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:64,marginBottom:20}}>🧠</div>
      <h2 style={{fontFamily:"'Libre Baskerville',serif",color:'#fff',marginBottom:10}}>AI is evaluating your answers…</h2>
      <p style={{color:'rgba(255,255,255,0.45)'}}>Please wait 10–20 seconds</p>
      <div className="spinner" style={{marginTop:24}}/>
    </div>
  );

  if(stage===STAGE.INTERVIEW){
    const prog=((curQ+1)/questions.length)*100;
    return(
      <div style={P}>
        <div style={{background:'rgba(0,0,0,0.2)',borderRadius:12,padding:'14px 18px',marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>Question {curQ+1} of {questions.length}</span>
            <span className="badge badge-orange">{finalTopic}</span>
          </div>
          <div style={{height:6,background:'rgba(255,255,255,0.1)',borderRadius:3}}>
            <div style={{height:'100%',width:`${prog}%`,background:'linear-gradient(90deg,#ff7c1a,#e8660a)',borderRadius:3,transition:'width 0.4s'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {questions.map((_,i)=>(
            <button key={i} onClick={()=>saveGo(i)} style={{
              width:34,height:34,borderRadius:'50%',fontSize:13,fontWeight:700,cursor:'pointer',
              background:i===curQ?'rgba(255,124,26,0.25)':answers[i]?.trim()?'rgba(0,200,117,0.18)':'rgba(255,255,255,0.06)',
              border:i===curQ?'1.5px solid #ff7c1a':answers[i]?.trim()?'1.5px solid rgba(0,200,117,0.4)':'1.5px solid rgba(255,255,255,0.15)',
              color:i===curQ?'#ff7c1a':answers[i]?.trim()?'#00c875':'rgba(255,255,255,0.5)',
              fontFamily:"'Source Sans 3',sans-serif",
            }}>{i+1}</button>
          ))}
        </div>
        <div style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,124,26,0.2)',borderRadius:14,padding:24,marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <span style={{background:'linear-gradient(135deg,#ff7c1a,#e8660a)',color:'#fff',padding:'3px 12px',borderRadius:6,fontSize:12,fontWeight:800}}>Q{curQ+1}</span>
            {answers[curQ]?.trim()&&<span className="badge badge-green">✓ Answered</span>}
          </div>
          <p style={{fontSize:17,color:'#fff',lineHeight:1.65,fontFamily:"'Libre Baskerville',serif",margin:0}}>{questions[curQ]}</p>
        </div>
        <div style={{marginBottom:18}}>
          <label className="form-label" style={{marginBottom:8,display:'block'}}>✍️ Your Answer</label>
          <textarea className="form-textarea" rows={8}
            placeholder="Type your answer here. Use specific examples and explain your reasoning…"
            value={curAns} onChange={e=>setCurAns(e.target.value)}/>
          <div style={{textAlign:'right',fontSize:12,color:'rgba(255,255,255,0.3)',marginTop:4}}>
            {curAns.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
        {error&&<div className="alert-error" style={{marginBottom:14}}>⚠️ {error}</div>}
        <div style={{display:'flex',gap:12}}>
          <button className="btn-ghost" onClick={()=>saveGo(curQ-1)} disabled={curQ===0}
            style={{opacity:curQ===0?0.35:1,padding:'12px 22px'}}>← Prev</button>
          {curQ<questions.length-1
            ?<button className="btn-primary" style={{flex:1,padding:'13px'}} onClick={()=>saveGo(curQ+1)}>Next →</button>
            :<button className="btn-orange" style={{flex:1,padding:'13px'}} onClick={submit}>🚀 Submit Interview</button>
          }
        </div>
      </div>
    );
  }

  if(stage===STAGE.DONE&&result){
    const score=result.score||0;
    return(
      <div style={P}>
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{fontSize:72,fontWeight:900,color:sc(score),fontFamily:"'Libre Baskerville',serif",lineHeight:1}}>{score}</div>
          <div style={{fontSize:16,color:'rgba(255,255,255,0.45)',marginBottom:10}}>/100</div>
          <h2 style={{fontFamily:"'Libre Baskerville',serif",color:'#fff',marginBottom:10}}>Interview Complete!</h2>
          <span className={`badge ${score>=80?'badge-green':score>=60?'badge-orange':'badge-blue'}`}>
            {score>=80?'Excellent!':score>=60?'Good Job!':'Keep Practicing!'}
          </span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:16,marginBottom:20}}>
          {[{l:'💪 Strengths',t:result.strengths},{l:'🎯 Improve',t:result.weaknesses},{l:'💡 Suggestions',t:result.suggestions}].map(f=>(
            <div key={f.l} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:14,padding:22}}>
              <h3 style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,color:'#fff',marginBottom:10}}>{f.l}</h3>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.6)',lineHeight:1.65}}>{f.t||'—'}</p>
            </div>
          ))}
        </div>
        {result.overall_feedback&&(
          <div style={{background:'rgba(255,124,26,0.08)',border:'1px solid rgba(255,124,26,0.2)',borderRadius:14,padding:22,marginBottom:20}}>
            <h3 style={{fontFamily:"'Libre Baskerville',serif",color:'#ff7c1a',marginBottom:10}}>📝 Overall Feedback</h3>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.7)',lineHeight:1.7}}>{result.overall_feedback}</p>
          </div>
        )}
        <div style={{display:'flex',gap:12}}>
          <button className="btn-ghost" style={{flex:1,padding:'14px'}}
            onClick={()=>{setStage(STAGE.SETUP);setResult(null);setQuestions([]);setAnswers([]);setTopic('');setCustom('');setError('');}}>
            🔄 Try Another
          </button>
          <button className="btn-orange" style={{flex:1,padding:'14px'}} onClick={()=>navigate('/dashboard')}>
            📊 Dashboard →
          </button>
        </div>
      </div>
    );
  }
  return null;
}
