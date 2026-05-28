// portal-candidate.jsx — Candidate-facing screens

function CandidatePortal({ screen, screenState, navigate }) {
  switch(screen) {
    case 'taking':    return <CandidateTaking    navigate={navigate}/>;
    case 'submitted': return <CandidateSubmitted navigate={navigate}/>;
    default:          return <CandidateInvite    navigate={navigate}/>;
  }
}

// ─── INVITE SCREEN ────────────────────────────────────────────────────────────

function CandidateInvite({ navigate }) {
  const assessment = MOCK.assessments[0];
  return (
    <div className="fade-in" style={{ flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:32, overflowY:'auto', width:'100%' }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:'var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3h6a3 3 0 0 1 0 6H3V3z" fill="white" fillOpacity="0.9"/>
              <path d="M3 9h5l5 6H8L3 9z" fill="white" fillOpacity="0.55"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:12.5, fontWeight:700, letterSpacing:'.03em', color:'var(--text-1)' }}>PSYBERGATE</div>
            <div style={{ fontSize:9.5, color:'var(--text-3)', letterSpacing:'.07em', textTransform:'uppercase' }}>Recruitment Portal</div>
          </div>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ background:'var(--accent-subtle)', borderBottom:'1px solid var(--border)', padding:'20px 28px' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--accent)', textTransform:'uppercase',
              letterSpacing:'.06em', marginBottom:6 }}>Assessment Invitation</div>
            <div style={{ fontSize:22, fontWeight:700, color:'var(--text-1)', lineHeight:1.25, letterSpacing:'-.02em' }}>
              {assessment.title}
            </div>
            <div style={{ fontSize:13, color:'var(--text-2)', marginTop:6 }}>Psybergate Recruitment</div>
          </div>

          <div style={{ padding:'24px 28px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24 }}>
              {[
                { icon:<Icons.ListChecks size={16}/>, label:'Questions', val:`${assessment.questions}` },
                { icon:<Icons.Clock size={16}/>, label:'Time Limit', val:`${assessment.timeLimit} min` },
                { icon:<Icons.Zap size={16}/>, label:'Attempts', val:'1 attempt' },
              ].map((m,i) => (
                <div key={i} style={{ background:'var(--bg)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius-sm)', padding:'12px 14px', textAlign:'center' }}>
                  <div style={{ color:'var(--accent)', display:'flex', justifyContent:'center', marginBottom:6 }}>{m.icon}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text-1)' }}>{m.val}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase',
                letterSpacing:'.06em', marginBottom:10 }}>Before You Begin</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  'Ensure you have a stable internet connection',
                  'The timer begins as soon as you start the assessment',
                  'You can navigate between questions freely before submitting',
                  'Suspicious activity such as tab switching will be logged',
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'var(--accent-subtle)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)' }}/>
                    </div>
                    <span style={{ fontSize:13.5, color:'var(--text-2)', lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => navigate('candidate','taking')}
              style={{ width:'100%', padding:'13px', background:'var(--accent)', color:'#fff',
                border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontFamily:'var(--font)',
                fontSize:14, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center',
                gap:8, transition:'background 150ms' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--accent-hover)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--accent)'}>
              Start Assessment <Icons.ArrowRight size={16}/>
            </button>
            <div style={{ textAlign:'center', marginTop:10, fontSize:12, color:'var(--text-3)' }}>
              By starting you agree to the assessment terms and conditions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAKING ASSESSMENT ────────────────────────────────────────────────────────

function CandidateTaking({ navigate }) {
  const assessment = MOCK.assessments[0];
  const questions  = MOCK.questions.slice(0, 8);
  const [current,  setCurrent]  = React.useState(0);
  const [answers,  setAnswers]  = React.useState({});
  const [timeLeft, setTimeLeft] = React.useState(assessment.timeLimit * 60);
  const [flagged,  setFlagged]  = React.useState({});

  React.useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => s <= 1 ? (clearInterval(t), 0) : s-1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const pct = (timeLeft / (assessment.timeLimit * 60)) * 100;
  const timerColor = pct > 50 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--danger)';
  const answeredCount = Object.keys(answers).length;
  const q = questions[current];
  const typeLabel = { mcq:'Multiple Choice', text:'Text Response', code:'Code Submission' };
  const setAnswer = val => setAnswers(a => ({...a,[q.id]:val}));

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }} className="fade-in">
      {/* Top bar */}
      <div style={{ height:'var(--topbar-height)', display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 20px', borderBottom:'1px solid var(--border)',
        background:'var(--bg-card)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'var(--accent)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M3 3h6a3 3 0 0 1 0 6H3V3z" fill="white" fillOpacity="0.9"/>
              <path d="M3 9h5l5 6H8L3 9z" fill="white" fillOpacity="0.55"/>
            </svg>
          </div>
          <span style={{ fontSize:13.5, fontWeight:600 }}>{assessment.title}</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 14px',
          background:'var(--bg)', border:`1px solid ${timerColor}44`, borderRadius:999 }}>
          <Icons.Clock size={14} style={{ color:timerColor }}/>
          <span style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-mono)', color:timerColor }}>
            {fmt(timeLeft)}
          </span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12.5, color:'var(--text-3)' }}>{answeredCount}/{questions.length} answered</span>
          <Btn size="sm" onClick={() => navigate('candidate','submitted')} icon={<Icons.Send size={13}/>}>Submit</Btn>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* Question navigator */}
        <div style={{ width:172, borderRight:'1px solid var(--border)', padding:'16px 12px',
          overflowY:'auto', flexShrink:0 }}>
          <div style={{ fontSize:10.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase',
            letterSpacing:'.06em', marginBottom:10 }}>Questions</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5 }}>
            {questions.map((qq, i) => {
              const ans = answers[qq.id] !== undefined;
              const isCur = i === current;
              const isFlag = flagged[qq.id];
              return (
                <button key={i} onClick={() => setCurrent(i)}
                  style={{ width:'100%', aspectRatio:'1', borderRadius:6, border:'none', cursor:'pointer',
                    fontFamily:'var(--font)', fontSize:12, fontWeight:600, transition:'all 120ms',
                    background: isCur?'var(--accent)': ans?'var(--success-subtle)':'var(--bg)',
                    color: isCur?'#fff': ans?'var(--success)':'var(--text-3)',
                    outline: isFlag?`2px solid var(--warning)`:'none', outlineOffset:2 }}>
                  {i+1}
                </button>
              );
            })}
          </div>
          <Divider style={{ margin:'14px 0 10px' }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {[
              { color:'var(--accent)',         label:'Current'   },
              { color:'var(--success-subtle)', label:'Answered', textColor:'var(--success)'  },
              { color:'var(--bg)',             label:'Not answered', textColor:'var(--text-3)' },
            ].map((l,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:l.color, flexShrink:0, border:'1px solid var(--border)' }}/>
                <span style={{ fontSize:11, color:'var(--text-3)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Question area */}
        <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>Progress</span>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>{answeredCount}/{questions.length} answered</span>
            </div>
            <ProgressBar value={answeredCount} max={questions.length}/>
          </div>

          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:20 }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)',
              display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text-3)' }}>Q{current+1}</span>
              <Badge status={q.type}>{typeLabel[q.type]}</Badge>
              <Badge status={q.difficulty}>{q.difficulty}</Badge>
              <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-3)' }}>{q.points} pts</span>
              <button onClick={() => setFlagged(f=>({...f,[q.id]:!f[q.id]}))}
                style={{ background:'none', border:'none', cursor:'pointer', padding:4,
                  color: flagged[q.id]?'var(--warning)':'var(--text-3)' }}>
                <Icons.Tag size={14}/>
              </button>
            </div>
            <div style={{ padding:'22px 20px' }}>
              <div style={{ fontSize:15.5, color:'var(--text-1)', lineHeight:1.65, fontWeight:500, marginBottom:22 }}>
                {q.title}
              </div>
              <QuestionInput q={q} value={answers[q.id]} onChange={setAnswer}/>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Btn variant="secondary" size="sm" icon={<Icons.ChevronLeft size={13}/>}
              disabled={current===0} onClick={() => setCurrent(c=>c-1)}>Previous</Btn>
            {current < questions.length-1
              ? <Btn size="sm" onClick={() => setCurrent(c=>c+1)}>
                  Save & Continue <Icons.ChevronRight size={13}/>
                </Btn>
              : <Btn size="sm" icon={<Icons.Send size={13}/>}
                  onClick={() => navigate('candidate','submitted')}>Submit Assessment</Btn>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionInput({ q, value, onChange }) {
  if (q.type === 'mcq') return (
    <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
      {q.options?.map((opt, i) => {
        const sel = value === opt;
        return (
          <div key={i} onClick={() => onChange(opt)}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', cursor:'pointer',
              background: sel?'var(--accent-subtle)':'var(--bg)',
              border:`1.5px solid ${sel?'var(--accent)':'var(--border)'}`,
              borderRadius:'var(--radius-sm)', transition:'all 120ms' }}>
            <div style={{ width:18, height:18, borderRadius:'50%',
              border:`2px solid ${sel?'var(--accent)':'var(--border)'}`,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 120ms' }}>
              {sel && <div style={{ width:9, height:9, borderRadius:'50%', background:'var(--accent)' }}/>}
            </div>
            <span style={{ fontSize:14, color:sel?'var(--text-1)':'var(--text-2)', fontWeight:sel?500:400 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', marginRight:10 }}>
                {String.fromCharCode(65+i)}.
              </span>
              {opt}
            </span>
          </div>
        );
      })}
    </div>
  );

  if (q.type === 'text') return (
    <div>
      <Textarea value={value||''} onChange={e=>onChange(e.target.value)} rows={6}
        placeholder="Type your answer here…"/>
      <div style={{ marginTop:5, fontSize:12, color:'var(--text-3)' }}>
        {(value||'').split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );

  if (q.type === 'code') return (
    <div>
      <div style={{ border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)',
        padding:'36px 24px', textAlign:'center', cursor:'pointer', background:'var(--bg)', transition:'all 150ms' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
        <Icons.Upload size={26} style={{ color:'var(--text-3)', marginBottom:10 }}/>
        <div style={{ fontSize:14, fontWeight:500, color:'var(--text-2)', marginBottom:4 }}>
          {value ? `✓  ${value}` : 'Drop your file here or click to browse'}
        </div>
        <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:14 }}>
          Accepted: .zip, .tar.gz, .pdf, .docx — max 20 MB
        </div>
        <button onClick={() => onChange('solution.zip')}
          style={{ padding:'7px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-sm)', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, color:'var(--text-1)' }}>
          Choose File
        </button>
      </div>
      <div style={{ marginTop:14 }}>
        <div style={{ fontSize:12.5, fontWeight:500, color:'var(--text-2)', marginBottom:8 }}>Language used (optional)</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['Java','Python','C#','JavaScript','TypeScript','Go','Other'].map(lang => <Tag key={lang}>{lang}</Tag>)}
        </div>
      </div>
    </div>
  );

  return null;
}

// ─── SUBMITTED ────────────────────────────────────────────────────────────────

function CandidateSubmitted({ navigate }) {
  const ref = React.useRef('PSG-' + Math.random().toString(36).slice(2,8).toUpperCase());
  return (
    <div className="fade-in" style={{ flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:32, width:'100%' }}>
      <div style={{ width:'100%', maxWidth:440, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--success-subtle)',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px',
          color:'var(--success)', border:'2px solid var(--success)44' }}>
          <Icons.CheckCircle size={36}/>
        </div>
        <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-.02em', marginBottom:8 }}>Assessment Submitted</div>
        <div style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.65, marginBottom:28 }}>
          Your responses have been recorded. You'll receive a notification once your assessment has been reviewed.
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', padding:'16px 20px', marginBottom:20 }}>
          <div style={{ fontSize:10.5, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>
            Reference Number
          </div>
          <div style={{ fontSize:17, fontWeight:700, fontFamily:'var(--font-mono)', color:'var(--accent)' }}>
            {ref.current}
          </div>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', padding:'16px 20px', marginBottom:24, textAlign:'left' }}>
          <div style={{ fontSize:10.5, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase',
            letterSpacing:'.06em', marginBottom:12 }}>What Happens Next</div>
          {[
            { icon:<Icons.Mail size={14}/>,  text:'A confirmation email will be sent shortly' },
            { icon:<Icons.Eye size={14}/>,   text:'A recruiter will review your responses' },
            { icon:<Icons.Zap size={14}/>,   text:"You'll hear back within 3–5 business days" },
          ].map((s,i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:i<2?10:0 }}>
              <div style={{ color:'var(--accent)', marginTop:1, flexShrink:0 }}>{s.icon}</div>
              <span style={{ fontSize:13.5, color:'var(--text-2)' }}>{s.text}</span>
            </div>
          ))}
        </div>

        <Btn variant="secondary" onClick={() => navigate('candidate','invite')}
          style={{ width:'100%', justifyContent:'center' }}>Return to Home</Btn>
      </div>
    </div>
  );
}

window.CandidatePortal = CandidatePortal;
