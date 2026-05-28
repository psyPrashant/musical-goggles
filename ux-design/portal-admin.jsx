// portal-admin.jsx — Admin portal screens

function AdminPortal({ screen, screenState, navigate }) {
  switch(screen) {
    case 'assessment-builder': return <AssessmentBuilder navigate={navigate} assessmentId={screenState.assessmentId}/>;
    case 'assessments':   return <AdminAssessments navigate={navigate}/>;
    case 'question-bank': return <AdminQuestionBank navigate={navigate}/>;
    case 'candidates':    return <AdminCandidates navigate={navigate} showInvite={screenState.showInvite}/>;
    case 'results':       return <AdminResults navigate={navigate}/>;
    default:              return <AdminDashboard navigate={navigate}/>;
  }
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function AdminDashboard({ navigate }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }} className="fade-in">
      <PageHeader title="Dashboard" subtitle="Tuesday, May 27, 2026"
        actions={<>
          <Btn variant="secondary" size="sm" icon={<Icons.Mail size={13}/>}
            onClick={() => navigate('admin','candidates',{showInvite:true})}>Invite Candidate</Btn>
          <Btn size="sm" icon={<Icons.Plus size={13}/>}
            onClick={() => navigate('admin','assessment-builder')}>Create Assessment</Btn>
        </>}
      />
      <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', gap:14 }}>
          <StatCard label="Total Assessments" value="4"   sub="+1 this week"           icon={<Icons.Assessments size={18}/>} color="accent"/>
          <StatCard label="Active Candidates"  value="20"  sub="Across all assessments" icon={<Icons.Candidates size={18}/>}  color="info"/>
          <StatCard label="Pending Reviews"    value="2"   sub="Awaiting evaluation"    icon={<Icons.AlertCircle size={18}/>} color="warning"/>
          <StatCard label="Average Score"      value="79%" sub="Last 30 days"           icon={<Icons.Award size={18}/>}       color="success"/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:14 }}>
          <Card noPad style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between',
              alignItems:'center', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:13.5, fontWeight:600 }}>Recent Assessments</span>
              <Btn variant="ghost" size="sm" onClick={() => navigate('admin','assessments')}>View all →</Btn>
            </div>
            <Table
              columns={[
                { key:'title', label:'Assessment', render:(v,r) => (
                  <div>
                    <div style={{ fontWeight:500 }}>{v}</div>
                    <div style={{ fontSize:11.5, color:'var(--text-3)', marginTop:2 }}>{r.questions} questions · {r.timeLimit} min</div>
                  </div>
                )},
                { key:'status', label:'Status', render: v => <Badge status={v}>{v==='in_progress'?'In Progress':v.charAt(0).toUpperCase()+v.slice(1)}</Badge> },
                { key:'candidates',  label:'Candidates', align:'right' },
                { key:'completions', label:'Completed',  align:'right' },
              ]}
              rows={MOCK.assessments}
              onRowClick={() => navigate('admin','assessments')}
            />
          </Card>

          <Card noPad style={{ overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <span style={{ fontSize:13.5, fontWeight:600 }}>Recent Activity</span>
            </div>
            <div style={{ overflowY:'auto', flex:1 }}>
              {MOCK.activity.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'11px 20px',
                  borderBottom: i < MOCK.activity.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:`var(--${item.color})`,
                    marginTop:5, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'var(--text-1)', lineHeight:1.45 }}>{item.text}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, gap:8 }}>
                      <span style={{ fontSize:11.5, color:'var(--text-3)' }}>{item.meta}</span>
                      <span style={{ fontSize:11.5, color:'var(--text-3)', flexShrink:0 }}>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card noPad style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between',
            alignItems:'center', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:13.5, fontWeight:600 }}>Candidate Pipeline</span>
            <Btn variant="ghost" size="sm" onClick={() => navigate('admin','candidates')}>Manage →</Btn>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {[
              { label:'Invited', count:2, color:'var(--text-2)' },
              { label:'In Progress', count:1, color:'var(--info)' },
              { label:'Pending Review', count:1, color:'var(--warning)' },
              { label:'Completed', count:2, color:'var(--success)' },
            ].map((s,i) => (
              <div key={i} style={{ padding:'16px 20px', borderRight: i<3?'1px solid var(--border)':'none' }}>
                <div style={{ fontSize:26, fontWeight:700, color:s.color, letterSpacing:'-.02em' }}>{s.count}</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>{s.label}</div>
                <ProgressBar value={s.count} max={6} color={s.color} thin/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── ASSESSMENTS ─────────────────────────────────────────────────────────────

function AdminAssessments({ navigate }) {
  const [tab, setTab] = React.useState('all');
  const filtered = tab==='all' ? MOCK.assessments : MOCK.assessments.filter(a => a.status===tab);
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }} className="fade-in">
      <PageHeader title="Assessments" subtitle={`${MOCK.assessments.length} total`}
        actions={<Btn icon={<Icons.Plus size={13}/>} onClick={() => navigate('admin','assessment-builder')}>Create Assessment</Btn>}/>
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        <div style={{ display:'flex', gap:6, marginBottom:20 }}>
          {['all','active','draft','closed'].map(t => {
            const count = t==='all' ? MOCK.assessments.length : MOCK.assessments.filter(a=>a.status===t).length;
            return (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'5px 14px',
                background: tab===t?'var(--accent-subtle)':'transparent',
                color: tab===t?'var(--accent)':'var(--text-2)',
                border:`1px solid ${tab===t?'var(--accent)':'var(--border)'}`,
                borderRadius:999, cursor:'pointer', fontFamily:'var(--font)', fontSize:12.5,
                fontWeight: tab===t?600:400, transition:'all 120ms', display:'flex', alignItems:'center', gap:6 }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
                <span style={{ fontSize:11, opacity:.7, background:'var(--bg)', padding:'1px 6px', borderRadius:999 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(a => <AssessmentRow key={a.id} assessment={a} navigate={navigate}/>)}
        </div>
      </div>
    </div>
  );
}

function AssessmentRow({ assessment: a, navigate }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:'var(--bg-card)', border:`1px solid ${hov?'var(--border-hover)':'var(--border)'}`,
        borderRadius:'var(--radius-lg)', padding:'16px 20px', transition:'all 150ms' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:42, height:42, borderRadius:10, background:'var(--accent-subtle)',
          display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}>
          <Icons.Assessments size={19}/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, fontWeight:600 }}>{a.title}</span>
            <Badge status={a.status}>{a.status.charAt(0).toUpperCase()+a.status.slice(1)}</Badge>
          </div>
          <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text-3)', flexWrap:'wrap' }}>
            <span>{a.questions} questions</span>
            <span>{a.timeLimit} min</span>
            <span>{a.candidates} candidates</span>
            <span style={{ marginLeft:'auto', flexShrink:0 }}>Created {a.createdAt}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          {a.tags.slice(0,2).map(t => <Tag key={t}>{t}</Tag>)}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <Btn variant="secondary" size="sm" icon={<Icons.Edit size={13}/>}
            onClick={() => navigate('admin','assessment-builder',{assessmentId:a.id})}>Edit</Btn>
          {a.completions > 0 &&
            <Btn variant="ghost" size="sm" icon={<Icons.Results size={13}/>}
              onClick={() => navigate('admin','results')}>Results</Btn>}
        </div>
      </div>
    </div>
  );
}

// ─── ASSESSMENT BUILDER ───────────────────────────────────────────────────────

function AssessmentBuilder({ navigate, assessmentId }) {
  const existing = assessmentId ? MOCK.assessments.find(a=>a.id===assessmentId) : null;
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    title: existing?.title || '',
    description: existing ? 'Technical assessment evaluating proficiency in frontend development skills including React, CSS, and JavaScript.' : '',
    timeLimit: existing?.timeLimit || 60,
    passingScore: 70,
    accessType: 'invite',
  });
  const [qList, setQList] = React.useState(
    existing ? MOCK.questions.slice(0, Math.min(4, existing.questions)).map(q => ({...q, pts:q.points})) : []
  );
  const [settings, setSettings] = React.useState({ notifications:true, tabMonitor:true, aiDetect:false, clipMonitor:false, startDate:'', endDate:'' });
  const steps = ['Basic Info','Questions','Settings'];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }} className="fade-in">
      <PageHeader
        title={existing ? `Edit: ${existing.title}` : 'Create Assessment'}
        subtitle={`Step ${step+1} of 3`}
        actions={<>
          <Btn variant="ghost" size="sm" onClick={() => navigate('admin','assessments')}>Cancel</Btn>
          {step > 0 && <Btn variant="secondary" size="sm" icon={<Icons.ChevronLeft size={13}/>} onClick={() => setStep(s=>s-1)}>Back</Btn>}
          {step < 2
            ? <Btn size="sm" onClick={() => setStep(s=>s+1)} disabled={step===0 && !form.title}>
                Next <Icons.ChevronRight size={13}/>
              </Btn>
            : <Btn size="sm" icon={<Icons.Check size={13}/>} onClick={() => navigate('admin','assessments')}>
                {existing ? 'Save Changes' : 'Publish Assessment'}
              </Btn>
          }
        </>}
      />
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:32, maxWidth:560 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display:'flex', alignItems:'center', gap:8, cursor: i<=step?'pointer':'default' }}
                onClick={() => i<=step && setStep(i)}>
                <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:12, fontWeight:700, transition:'all 200ms',
                  background: i<=step?'var(--accent)':'var(--bg-elevated)',
                  color: i<=step?'#fff':'var(--text-3)',
                  border:`2px solid ${i<=step?'var(--accent)':'var(--border)'}` }}>
                  {i < step ? <Icons.Check size={13}/> : i+1}
                </div>
                <span style={{ fontSize:13, fontWeight: i===step?600:400, color: i===step?'var(--text-1)':'var(--text-3)' }}>{s}</span>
              </div>
              {i < steps.length-1 && (
                <div style={{ flex:1, height:2, margin:'0 12px', borderRadius:1, transition:'background 300ms',
                  background: i<step?'var(--accent)':'var(--border)' }}/>
              )}
            </React.Fragment>
          ))}
        </div>
        {step === 0 && <BuilderStep1 form={form} setForm={setForm}/>}
        {step === 1 && <BuilderStep2 qList={qList} setQList={setQList}/>}
        {step === 2 && <BuilderStep3 settings={settings} setSettings={setSettings} navigate={navigate}/>}
      </div>
    </div>
  );
}

function BuilderStep1({ form, setForm }) {
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div style={{ maxWidth:600 }}>
      <FormField label="Assessment Title *" hint="Candidates will see this name">
        <Input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Senior Frontend Developer Assessment" style={{ width:'100%' }}/>
      </FormField>
      <FormField label="Description" hint="Shown on the candidate start screen">
        <Textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe what this assessment covers…" rows={3}/>
      </FormField>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <FormField label="Time Limit (minutes)" hint="Set to 0 for no limit">
          <Input value={form.timeLimit} onChange={e=>set('timeLimit',e.target.value)} type="number" style={{ width:'100%' }}/>
        </FormField>
        <FormField label="Passing Score (%)">
          <Input value={form.passingScore} onChange={e=>set('passingScore',e.target.value)} type="number" style={{ width:'100%' }}/>
        </FormField>
      </div>
      <FormField label="Access Type">
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { val:'invite',   label:'Invite Only',        sub:'Candidates receive a direct link via email' },
            { val:'password', label:'Password Protected', sub:'Candidates need a password to access' },
            { val:'open',     label:'Open Access',        sub:'Anyone with the link can take this assessment' },
          ].map(o => (
            <div key={o.val} onClick={() => set('accessType',o.val)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', cursor:'pointer',
                background: form.accessType===o.val?'var(--accent-subtle)':'var(--bg-elevated)',
                border:`1px solid ${form.accessType===o.val?'var(--accent)':'var(--border)'}`,
                borderRadius:'var(--radius-sm)', transition:'all 120ms' }}>
              <div style={{ width:16, height:16, borderRadius:'50%',
                border:`2px solid ${form.accessType===o.val?'var(--accent)':'var(--border)'}`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {form.accessType===o.val && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)' }}/>}
              </div>
              <div>
                <div style={{ fontSize:13.5, fontWeight:500 }}>{o.label}</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:1 }}>{o.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function BuilderStep2({ qList, setQList }) {
  const [showBank, setShowBank] = React.useState(false);
  const [bankFilter, setBankFilter] = React.useState('all');
  const totalPts = qList.reduce((s,q)=>s+(parseInt(q.pts)||0),0);
  const addedIds = qList.map(q=>q.id);
  const bankFiltered = bankFilter==='all' ? MOCK.questions : MOCK.questions.filter(q=>q.type===bankFilter);
  const typeLabel = { mcq:'MCQ', text:'Text', code:'Code' };

  return (
    <div style={{ display:'flex', gap:20, minHeight:400 }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <span style={{ fontSize:14, fontWeight:600 }}>{qList.length} Questions</span>
            <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:10 }}>{totalPts} total points</span>
          </div>
          <Btn variant="secondary" size="sm" icon={<Icons.QuestionBank size={13}/>}
            onClick={() => setShowBank(b=>!b)}>{showBank?'Hide Bank':'Browse Bank'}</Btn>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {qList.length===0 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              padding:'40px', color:'var(--text-3)', gap:12, border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)' }}>
              <Icons.QuestionBank size={28}/>
              <div style={{ fontSize:13 }}>No questions added yet</div>
              <Btn size="sm" variant="secondary" onClick={() => setShowBank(true)}>Browse Question Bank</Btn>
            </div>
          )}
          {qList.map((q, i) => (
            <div key={q.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
              background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
              <Icons.GripVertical size={16} style={{ color:'var(--text-3)', flexShrink:0 }}/>
              <span style={{ fontSize:11.5, color:'var(--text-3)', width:18, textAlign:'center', flexShrink:0 }}>{i+1}</span>
              <Badge status={q.type}>{typeLabel[q.type]}</Badge>
              <span style={{ flex:1, fontSize:13.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.title}</span>
              <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                <input type="number" value={q.pts}
                  onChange={e => setQList(l=>l.map((x,j)=>j===i?{...x,pts:e.target.value}:x))}
                  style={{ width:50, padding:'4px 8px', background:'var(--bg)', border:'1px solid var(--border)',
                    borderRadius:4, color:'var(--text-1)', fontSize:12.5, fontFamily:'var(--font)', textAlign:'right' }}/>
                <span style={{ fontSize:11.5, color:'var(--text-3)' }}>pts</span>
              </div>
              <button onClick={() => setQList(l=>l.filter((_,j)=>j!==i))}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', display:'flex', padding:4 }}>
                <Icons.Trash size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {showBank && (
        <div style={{ width:320, background:'var(--bg-card)', border:'1px solid var(--border)',
          borderRadius:'var(--radius-lg)', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0, maxHeight:500 }}>
          <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
            <div style={{ fontSize:13.5, fontWeight:600, marginBottom:10 }}>Question Bank</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {['all','mcq','text','code'].map(f => (
                <button key={f} onClick={() => setBankFilter(f)}
                  style={{ padding:'3px 10px', background: bankFilter===f?'var(--accent-subtle)':'transparent',
                    color: bankFilter===f?'var(--accent)':'var(--text-3)',
                    border:`1px solid ${bankFilter===f?'var(--accent)':'var(--border)'}`,
                    borderRadius:999, fontSize:11.5, cursor:'pointer', fontFamily:'var(--font)' }}>
                  {f==='all'?'All':f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:8 }}>
            {bankFiltered.map(q => {
              const added = addedIds.includes(q.id);
              return (
                <div key={q.id} style={{ padding:'10px 12px', marginBottom:6, background:'var(--bg)',
                  border:'1px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:5, marginBottom:5 }}>
                        <Badge status={q.type}>{typeLabel[q.type]}</Badge>
                        <Badge status={q.difficulty}>{q.difficulty}</Badge>
                      </div>
                      <div style={{ fontSize:12.5, color:'var(--text-1)', lineHeight:1.4 }}>{q.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{q.category}</div>
                    </div>
                    <button onClick={() => !added && setQList(l=>[...l,{...q,pts:q.points}])}
                      style={{ padding:'4px 10px', background: added?'var(--success-subtle)':'var(--accent-subtle)',
                        color: added?'var(--success)':'var(--accent)', border:'none', borderRadius:4,
                        cursor: added?'default':'pointer', fontSize:12, fontFamily:'var(--font)', fontWeight:500, flexShrink:0 }}>
                      {added?'✓ Added':'+ Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BuilderStep3({ settings, setSettings, navigate }) {
  const set = (k,v) => setSettings(s=>({...s,[k]:v}));
  return (
    <div style={{ maxWidth:560, display:'flex', flexDirection:'column', gap:16 }}>
      <Card>
        <SectionLabel>Schedule</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <FormField label="Available From" hint="Blank = publish immediately">
            <Input value={settings.startDate} onChange={e=>set('startDate',e.target.value)} type="date" style={{ width:'100%' }}/>
          </FormField>
          <FormField label="Deadline" hint="Blank = no deadline">
            <Input value={settings.endDate} onChange={e=>set('endDate',e.target.value)} type="date" style={{ width:'100%' }}/>
          </FormField>
        </div>
      </Card>
      <Card>
        <SectionLabel>Notifications</SectionLabel>
        <Toggle checked={settings.notifications} onChange={v=>set('notifications',v)}
          label="Email notification when a candidate submits"/>
      </Card>
      <Card>
        <SectionLabel>Anti-Cheating</SectionLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Toggle checked={settings.tabMonitor} onChange={v=>set('tabMonitor',v)}
            label="Detect and log tab switching / focus loss"/>
          <Toggle checked={!!settings.aiDetect} onChange={v=>set('aiDetect',v)}
            label="Flag potentially AI-generated responses"/>
          <Toggle checked={!!settings.clipMonitor} onChange={v=>set('clipMonitor',v)}
            label="Monitor clipboard paste activity"/>
        </div>
      </Card>
      <Card>
        <SectionLabel>Preview</SectionLabel>
        <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:12 }}>
          See how this assessment appears to candidates before publishing.
        </div>
        <Btn variant="secondary" icon={<Icons.Eye size={13}/>}
          onClick={() => navigate('candidate','invite')}>Preview as Candidate</Btn>
      </Card>
    </div>
  );
}

// ─── QUESTION BANK ────────────────────────────────────────────────────────────

function AdminQuestionBank({ navigate }) {
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [catFilter,  setCatFilter]  = React.useState('all');
  const [search,     setSearch]     = React.useState('');
  const [showNew,    setShowNew]    = React.useState(false);
  const categories = ['all',...new Set(MOCK.questions.map(q=>q.category))];
  const filtered = MOCK.questions.filter(q => {
    if (typeFilter!=='all' && q.type!==typeFilter) return false;
    if (catFilter!=='all' && q.category!==catFilter) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const typeIcon = { mcq:<Icons.ListChecks size={14}/>, text:<Icons.AlignLeft size={14}/>, code:<Icons.Code size={14}/> };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }} className="fade-in">
      <PageHeader title="Question Bank" subtitle={`${MOCK.questions.length} questions`}
        actions={<Btn icon={<Icons.Plus size={13}/>} onClick={()=>setShowNew(true)}>Add Question</Btn>}/>
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center', flexWrap:'wrap' }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions…"
            prefix={<Icons.Search size={14}/>} style={{ width:240 }}/>
          <div style={{ display:'flex', gap:5 }}>
            {['all','mcq','text','code'].map(t => (
              <button key={t} onClick={()=>setTypeFilter(t)} style={{ padding:'5px 12px',
                background: typeFilter===t?'var(--accent-subtle)':'transparent',
                color: typeFilter===t?'var(--accent)':'var(--text-2)',
                border:`1px solid ${typeFilter===t?'var(--accent)':'var(--border)'}`,
                borderRadius:999, cursor:'pointer', fontFamily:'var(--font)', fontSize:12.5,
                fontWeight: typeFilter===t?600:400, transition:'all 120ms',
                display:'flex', alignItems:'center', gap:5 }}>
                {t!=='all' && typeIcon[t]}{t==='all'?'All Types':t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:5, marginBottom:18, flexWrap:'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={()=>setCatFilter(c)} style={{ padding:'3px 11px',
              background: catFilter===c?'var(--bg-elevated)':'transparent',
              color: catFilter===c?'var(--text-1)':'var(--text-3)',
              border:`1px solid ${catFilter===c?'var(--border-hover)':'var(--border)'}`,
              borderRadius:999, cursor:'pointer', fontFamily:'var(--font)', fontSize:12, transition:'all 100ms' }}>
              {c==='all'?'All Categories':c}
            </button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
          {filtered.map(q => <QuestionBankCard key={q.id} q={q}/>)}
          {filtered.length===0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'var(--text-3)' }}>
              No questions match your filters.
            </div>
          )}
        </div>
      </div>
      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Add New Question" width={520}>
        <NewQuestionForm onSave={()=>setShowNew(false)} onCancel={()=>setShowNew(false)}/>
      </Modal>
    </div>
  );
}

function QuestionBankCard({ q }) {
  const typeLabel = { mcq:'Multiple Choice', text:'Text Response', code:'Code Submission' };
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
      padding:'14px 16px', display:'flex', flexDirection:'column', gap:10, transition:'border-color 150ms' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-hover)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
      <div style={{ display:'flex', gap:6 }}>
        <Badge status={q.type}>{typeLabel[q.type]}</Badge>
        <Badge status={q.difficulty}>{q.difficulty.charAt(0).toUpperCase()+q.difficulty.slice(1)}</Badge>
      </div>
      <div style={{ fontSize:13.5, color:'var(--text-1)', lineHeight:1.5, fontWeight:500 }}>{q.title}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Tag>{q.category}</Tag>
        <div style={{ fontSize:11.5, color:'var(--text-3)' }}>{q.points} pts · Used in {q.usedIn}</div>
      </div>
      <div style={{ display:'flex', gap:6, paddingTop:6, borderTop:'1px solid var(--border)' }}>
        <Btn variant="ghost" size="sm" icon={<Icons.Edit size={12}/>} style={{ flex:1, justifyContent:'center' }}>Edit</Btn>
        <Btn variant="ghost" size="sm" icon={<Icons.Copy size={12}/>} style={{ flex:1, justifyContent:'center' }}>Duplicate</Btn>
        <Btn variant="ghost" size="sm" icon={<Icons.Trash size={12}/>} style={{ color:'var(--danger)' }}></Btn>
      </div>
    </div>
  );
}

function NewQuestionForm({ onSave, onCancel }) {
  const [type, setType] = React.useState('mcq');
  const [title, setTitle] = React.useState('');
  const [opts, setOpts] = React.useState(['','','','']);
  return (
    <div>
      <FormField label="Question Type">
        <div style={{ display:'flex', gap:6 }}>
          {[['mcq','MCQ'],['text','Text'],['code','Code']].map(([v,l]) => (
            <button key={v} onClick={()=>setType(v)} style={{ flex:1, padding:'7px',
              background:type===v?'var(--accent-subtle)':'var(--bg)',
              color:type===v?'var(--accent)':'var(--text-2)',
              border:`1px solid ${type===v?'var(--accent)':'var(--border)'}`,
              borderRadius:'var(--radius-sm)', cursor:'pointer', fontFamily:'var(--font)',
              fontSize:13, fontWeight:type===v?600:400 }}>{l}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Question Text *">
        <Textarea value={title} onChange={e=>setTitle(e.target.value)} rows={3} placeholder="Enter the question…"/>
      </FormField>
      {type==='mcq' && (
        <FormField label="Answer Options">
          {opts.map((o,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', border:'1.5px solid var(--border)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--text-3)', flexShrink:0 }}>
                {String.fromCharCode(65+i)}
              </div>
              <Input value={o} onChange={e=>setOpts(ops=>ops.map((x,j)=>j===i?e.target.value:x))}
                placeholder={`Option ${String.fromCharCode(65+i)}`} style={{ flex:1 }}/>
            </div>
          ))}
        </FormField>
      )}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={onSave} disabled={!title}>Save Question</Btn>
      </div>
    </div>
  );
}

// ─── CANDIDATES ───────────────────────────────────────────────────────────────

function AdminCandidates({ navigate, showInvite: initInvite }) {
  const [search,     setSearch]     = React.useState('');
  const [showInvite, setShowInvite] = React.useState(!!initInvite);
  const statusLabel = { invited:'Invited', in_progress:'In Progress', completed:'Completed', pending_review:'Pending Review' };
  const filtered = MOCK.candidates.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }} className="fade-in">
      <PageHeader title="Candidates" subtitle={`${MOCK.candidates.length} total`}
        actions={<Btn icon={<Icons.Send size={13}/>} onClick={()=>setShowInvite(true)}>Invite Candidate</Btn>}/>
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        <div style={{ marginBottom:16 }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name or email…" prefix={<Icons.Search size={14}/>} style={{ width:300 }}/>
        </div>
        <Card noPad style={{ overflow:'hidden' }}>
          <Table
            columns={[
              { key:'name', label:'Candidate', render:(v,r) => (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Avatar name={v} size={30}/>
                  <div>
                    <div style={{ fontWeight:500 }}>{v}</div>
                    <div style={{ fontSize:11.5, color:'var(--text-3)' }}>{r.email}</div>
                  </div>
                </div>
              )},
              { key:'assessment', label:'Assessment' },
              { key:'status', label:'Status', render: v => <Badge status={v}>{statusLabel[v]}</Badge> },
              { key:'score', label:'Score', align:'right', render: v => v!=null
                ? <span style={{ fontWeight:600, color:v>=70?'var(--success)':'var(--danger)' }}>{v}%</span>
                : <span style={{ color:'var(--text-3)' }}>—</span> },
              { key:'invited', label:'Invited', render: v => <span style={{ color:'var(--text-3)', fontSize:12.5 }}>{v}</span> },
              { key:'id', label:'', render:(_,r) => (
                <div style={{ display:'flex', gap:5 }}>
                  {r.status==='pending_review' &&
                    <Btn size="sm" variant="success" icon={<Icons.Eye size={12}/>}
                      onClick={() => navigate('admin','results',{candidateId:r.id})}>Mark</Btn>}
                  {r.status==='completed' &&
                    <Btn size="sm" variant="ghost" icon={<Icons.Results size={12}/>}
                      onClick={() => navigate('admin','results',{candidateId:r.id})}>View</Btn>}
                  {r.status==='invited' &&
                    <Btn size="sm" variant="ghost" icon={<Icons.Mail size={12}/>}>Resend</Btn>}
                </div>
              )},
            ]}
            rows={filtered}
            emptyMessage="No candidates found"
          />
        </Card>
      </div>
      <Modal open={showInvite} onClose={()=>setShowInvite(false)} title="Invite Candidate">
        <InviteForm onClose={()=>setShowInvite(false)}/>
      </Modal>
    </div>
  );
}

function InviteForm({ onClose }) {
  const [email, setEmail] = React.useState('');
  const [asmt,  setAsmt]  = React.useState('1');
  const [msg,   setMsg]   = React.useState('');
  const [sent,  setSent]  = React.useState(false);
  if (sent) return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--success-subtle)',
        display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--success)' }}>
        <Icons.CheckCircle size={28}/>
      </div>
      <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>Invitation Sent!</div>
      <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:20 }}>
        {email} will receive an email with their assessment link.
      </div>
      <Btn onClick={onClose}>Done</Btn>
    </div>
  );
  return (
    <div>
      <FormField label="Candidate Email *">
        <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="candidate@example.com" style={{ width:'100%' }}/>
      </FormField>
      <FormField label="Assessment *">
        <Select value={asmt} onChange={e=>setAsmt(e.target.value)} style={{ width:'100%' }}
          options={MOCK.assessments.filter(a=>a.status!=='closed').map(a=>({val:String(a.id),label:a.title}))}/>
      </FormField>
      <FormField label="Personal Message (optional)">
        <Textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3}
          placeholder="Hi! We'd love to learn more about your skills…"/>
      </FormField>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn icon={<Icons.Send size={13}/>} onClick={()=>setSent(true)} disabled={!email}>Send Invitation</Btn>
      </div>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────

function AdminResults({ navigate }) {
  const submitted = MOCK.candidates.filter(c => c.status==='completed' || c.status==='pending_review');
  const [selected, setSelected] = React.useState(submitted[0]||null);
  const statusLabel = { completed:'Completed', pending_review:'Pending Review' };
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }} className="fade-in">
      <PageHeader title="Results & Marking" subtitle={`${submitted.length} submissions`}/>
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        <div style={{ width:268, borderRight:'1px solid var(--border)', overflowY:'auto', flexShrink:0 }}>
          {submitted.map(c => (
            <div key={c.id} onClick={()=>setSelected(c)}
              style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer',
                background: selected?.id===c.id?'var(--accent-subtle)':'transparent', transition:'background 100ms' }}
              onMouseEnter={e=>{ if(selected?.id!==c.id) e.currentTarget.style.background='var(--bg-hover)'; }}
              onMouseLeave={e=>{ if(selected?.id!==c.id) e.currentTarget.style.background='transparent'; }}>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <Avatar name={c.name} size={30}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:500, color:selected?.id===c.id?'var(--accent)':'var(--text-1)' }}>{c.name}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.assessment}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                <Badge status={c.status}>{statusLabel[c.status]}</Badge>
                {c.score!=null && <Badge status="completed">{c.score}%</Badge>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {selected ? <MarkingPanel candidate={selected}/> : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-3)', fontSize:13 }}>
              Select a submission to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MarkingPanel({ candidate: c }) {
  const assessment = MOCK.assessments.find(a=>a.id===c.assessmentId);
  const questions  = MOCK.questions.slice(0, Math.min(assessment?.questions||5, 5));
  const [scores,   setScores]   = React.useState(questions.reduce((a,q)=>({...a,[q.id]:''}),{}));
  const [feedback, setFeedback] = React.useState({});
  const [saved,    setSaved]    = React.useState(false);
  const [openFb,   setOpenFb]   = React.useState({});
  const totalPts  = questions.reduce((s,q)=>s+q.points,0);
  const scoredPts = Object.values(scores).reduce((s,v)=>s+(parseInt(v)||0),0);
  const typeLabel = { mcq:'Multiple Choice', text:'Text Response', code:'Code Submission' };

  if (saved) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12 }}>
      <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--success-subtle)',
        display:'flex', alignItems:'center', justifyContent:'center', color:'var(--success)' }}>
        <Icons.CheckCircle size={28}/>
      </div>
      <div style={{ fontSize:15, fontWeight:600 }}>Evaluation Saved</div>
      <div style={{ fontSize:13, color:'var(--text-3)' }}>{c.name} — Final Score: {Math.round(scoredPts/totalPts*100)}%</div>
    </div>
  );

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ display:'flex', gap:14 }}>
          <Avatar name={c.name} size={44}/>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>{c.name}</div>
            <div style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>{assessment?.title}</div>
            <div style={{ display:'flex', gap:10, marginTop:6, fontSize:12, color:'var(--text-3)' }}>
              {c.timeSpent && <span>Time spent: {c.timeSpent}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:26, fontWeight:700, color:'var(--accent)', letterSpacing:'-.02em' }}>
            {scoredPts}/{totalPts}
          </div>
          <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{Math.round(scoredPts/totalPts*100)}% scored</div>
        </div>
      </div>
      <ProgressBar value={scoredPts} max={totalPts}/>
      <Divider/>
      {questions.map((q, i) => {
        const answer = MOCK.sampleAnswers[q.id];
        return (
          <div key={q.id} style={{ marginBottom:14, background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-3)', width:20 }}>Q{i+1}</span>
              <Badge status={q.type}>{typeLabel[q.type]}</Badge>
              <span style={{ flex:1, fontSize:13.5, fontWeight:500 }}>{q.title}</span>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <input type="number" value={scores[q.id]} min={0} max={q.points}
                  onChange={e=>setScores(s=>({...s,[q.id]:e.target.value}))}
                  style={{ width:48, padding:'4px 6px', background:'var(--bg)', border:'1px solid var(--border)',
                    borderRadius:4, color:'var(--accent)', fontSize:14, fontWeight:700, fontFamily:'var(--font)', textAlign:'center' }}/>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>/ {q.points}</span>
              </div>
            </div>
            {answer ? (
              <div style={{ padding:'12px 16px' }}>
                <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Candidate's Answer</div>
                {q.type==='mcq' ? (
                  <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                    {q.options?.map((o,j) => (
                      <div key={j} style={{ padding:'5px 12px', borderRadius:999,
                        background: o===answer?'var(--accent-subtle)':'var(--bg)',
                        border:`1px solid ${o===answer?'var(--accent)':'var(--border)'}`,
                        color: o===answer?'var(--accent)':'var(--text-3)', fontSize:12.5 }}>{o}</div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize:13.5, color:'var(--text-1)', lineHeight:1.6,
                    background:'var(--bg)', padding:'10px 14px', borderRadius:'var(--radius-sm)',
                    border:'1px solid var(--border)', fontFamily:q.type==='code'?'var(--font-mono)':'var(--font)' }}>
                    {answer}
                  </div>
                )}
                <div style={{ marginTop:8 }}>
                  <button onClick={()=>setOpenFb(f=>({...f,[q.id]:!f[q.id]}))}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)',
                      fontSize:12, fontFamily:'var(--font)', display:'flex', alignItems:'center', gap:4 }}>
                    <Icons.ChevronDown size={13} style={{ transform:openFb[q.id]?'rotate(180deg)':'none', transition:'transform 200ms' }}/>
                    {openFb[q.id]?'Hide':'Add'} feedback
                  </button>
                  {openFb[q.id] && (
                    <Textarea value={feedback[q.id]||''} rows={2} style={{ marginTop:6 }}
                      onChange={e=>setFeedback(f=>({...f,[q.id]:e.target.value}))}
                      placeholder="Optional feedback for this candidate…"/>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding:'12px 16px', color:'var(--text-3)', fontSize:13, fontStyle:'italic' }}>
                No answer submitted.
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
        <Btn variant="secondary">Save Draft</Btn>
        <Btn icon={<Icons.CheckCircle size={13}/>} onClick={()=>setSaved(true)}>Save Evaluation</Btn>
      </div>
    </div>
  );
}

window.AdminPortal = AdminPortal;
