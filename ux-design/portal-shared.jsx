// portal-shared.jsx — UI primitives + mock data

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK = {
  assessments: [
    { id: 1, title: "Senior Frontend Developer", status: "active",  questions: 12, timeLimit: 90,  candidates: 8,  completions: 5,  createdAt: "May 20, 2026", tags: ["React","CSS","JavaScript"] },
    { id: 2, title: "Python Backend Engineer",   status: "active",  questions: 15, timeLimit: 120, candidates: 12, completions: 9,  createdAt: "May 15, 2026", tags: ["Python","APIs","SQL"] },
    { id: 3, title: "System Design Challenge",   status: "draft",   questions: 5,  timeLimit: 60,  candidates: 0,  completions: 0,  createdAt: "May 25, 2026", tags: ["Architecture","Design"] },
    { id: 4, title: "Junior JavaScript Developer", status: "closed", questions: 10, timeLimit: 45, candidates: 20, completions: 18, createdAt: "May 1, 2026",  tags: ["JavaScript","HTML","CSS"] },
  ],
  questions: [
    { id: 1, type: "mcq",  title: "What is the time complexity of binary search?",         category: "Algorithms",       difficulty: "medium", usedIn: 2, points: 10, options: ["O(n)","O(log n)","O(n²)","O(1)"],             answer: 1 },
    { id: 2, type: "text", title: "Explain the concept of closure in JavaScript",          category: "JavaScript",       difficulty: "medium", usedIn: 3, points: 15 },
    { id: 3, type: "mcq",  title: "Which HTTP method is idempotent?",                      category: "Web",              difficulty: "easy",   usedIn: 1, points: 5,  options: ["POST","PUT","PATCH","DELETE"],               answer: 1 },
    { id: 4, type: "code", title: "Build a REST API endpoint for user authentication",     category: "Backend",          difficulty: "hard",   usedIn: 1, points: 30 },
    { id: 5, type: "text", title: "Describe the four pillars of Object-Oriented Programming", category: "Fundamentals", difficulty: "easy",   usedIn: 4, points: 10 },
    { id: 6, type: "mcq",  title: "What is the output of `typeof null` in JavaScript?",   category: "JavaScript",       difficulty: "easy",   usedIn: 2, points: 5,  options: ['"null"','"object"','"undefined"','"string"'], answer: 1 },
    { id: 7, type: "text", title: "Explain database indexing and when to use it",          category: "Database",         difficulty: "medium", usedIn: 1, points: 15 },
    { id: 8, type: "mcq",  title: "Which data structure uses FIFO ordering?",              category: "Data Structures",  difficulty: "easy",   usedIn: 2, points: 5,  options: ["Stack","Queue","Tree","Graph"],              answer: 1 },
  ],
  candidates: [
    { id: 1, name: "Alex Thompson", email: "alex.t@example.com",   assessment: "Senior Frontend Developer", assessmentId: 1, status: "completed",     score: 87, invited: "2 days ago",  timeSpent: "72 min" },
    { id: 2, name: "Sarah Kim",     email: "sarah.k@example.com",  assessment: "Python Backend Engineer",   assessmentId: 2, status: "in_progress",   score: null, invited: "1 day ago",  timeSpent: null },
    { id: 3, name: "Marcus Johnson",email: "marcus.j@example.com", assessment: "Senior Frontend Developer", assessmentId: 1, status: "invited",       score: null, invited: "3 hours ago", timeSpent: null },
    { id: 4, name: "Priya Patel",   email: "priya.p@example.com",  assessment: "Python Backend Engineer",   assessmentId: 2, status: "pending_review",score: null, invited: "5 days ago", timeSpent: "115 min" },
    { id: 5, name: "David Chen",    email: "david.c@example.com",  assessment: "Junior JavaScript Developer",assessmentId: 4, status: "completed",    score: 64, invited: "1 week ago", timeSpent: "41 min" },
    { id: 6, name: "Emma Wilson",   email: "emma.w@example.com",   assessment: "Senior Frontend Developer", assessmentId: 1, status: "invited",       score: null, invited: "1 hour ago", timeSpent: null },
  ],
  activity: [
    { text: "Alex Thompson completed Senior Frontend Developer", meta: "Score: 87%",              time: "2h ago",  color: "success" },
    { text: "Sarah Kim started Python Backend Engineer",         meta: "Currently in progress",   time: "3h ago",  color: "info"    },
    { text: "Emma Wilson invited to Senior Frontend Developer",  meta: "Awaiting response",       time: "1h ago",  color: "warning" },
    { text: "Priya Patel's submission ready for review",         meta: "Python Backend Engineer", time: "1d ago",  color: "warning" },
    { text: "System Design Challenge created",                   meta: "Draft — not yet published",time: "2d ago", color: "info"    },
  ],
  // candidate's sample answers for marking view
  sampleAnswers: {
    1: "O(log n) — because binary search halves the search space on each step.",
    2: "A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function has returned. This is because the inner function maintains a reference to the outer function's scope chain, not just the values at the time of creation...",
    3: "PUT",
    5: "The four pillars of OOP are: Encapsulation — bundling data and methods; Abstraction — hiding implementation; Inheritance — deriving new classes; Polymorphism — many forms through method overriding...",
    7: "Database indexing creates a separate data structure that enables faster data retrieval without scanning every row. Indexes are best used on columns that appear frequently in WHERE clauses or JOIN conditions...",
  },
};

// ─── BUTTON ──────────────────────────────────────────────────────────────────

function Btn({ variant = 'primary', size = 'md', children, onClick, disabled, style: xs, icon, type = 'button' }) {
  const [hov, setHov] = React.useState(false);
  const V = {
    primary:   { bg: 'var(--accent)',         bgH: 'var(--accent-hover)', color: '#fff',              border: 'transparent' },
    secondary: { bg: 'var(--bg-elevated)',    bgH: 'var(--bg-hover)',     color: 'var(--text-1)',     border: 'var(--border)' },
    ghost:     { bg: 'transparent',           bgH: 'var(--bg-hover)',     color: 'var(--text-2)',     border: 'transparent' },
    danger:    { bg: 'var(--danger-subtle)',  bgH: 'rgba(239,68,68,.2)',  color: 'var(--danger)',     border: 'transparent' },
    success:   { bg: 'var(--success-subtle)', bgH: 'rgba(16,185,129,.2)', color: 'var(--success)',    border: 'transparent' },
  }[variant];
  const S = { sm: { padding: '5px 11px', fontSize: 12 }, md: { padding: '8px 15px', fontSize: 13 }, lg: { padding: '11px 22px', fontSize: 14 } }[size];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:6, background: hov&&!disabled ? V.bgH : V.bg,
        color:V.color, border:`1px solid ${V.border}`, borderRadius:'var(--radius-sm)', cursor:disabled?'not-allowed':'pointer',
        fontFamily:'var(--font)', fontWeight:500, opacity:disabled?.5:1, transition:'all 120ms ease',
        whiteSpace:'nowrap', ...S, ...xs }}>
      {icon}{children}
    </button>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────────────

function Badge({ status, children }) {
  const C = {
    active:         { bg:'var(--success-subtle)',           color:'var(--success)',  dot:true  },
    draft:          { bg:'rgba(148,163,184,.12)',            color:'var(--text-2)',   dot:false },
    closed:         { bg:'rgba(100,116,139,.08)',            color:'var(--text-3)',   dot:false },
    completed:      { bg:'var(--success-subtle)',           color:'var(--success)',  dot:false },
    in_progress:    { bg:'var(--info-subtle)',              color:'var(--info)',     dot:true  },
    invited:        { bg:'rgba(148,163,184,.1)',             color:'var(--text-2)',   dot:false },
    pending_review: { bg:'var(--warning-subtle)',           color:'var(--warning)', dot:true  },
    mcq:            { bg:'var(--accent-subtle)',            color:'var(--accent)',   dot:false },
    text:           { bg:'var(--info-subtle)',              color:'var(--info)',     dot:false },
    code:           { bg:'rgba(168,85,247,.13)',            color:'#a855f7',         dot:false },
    easy:           { bg:'var(--success-subtle)',           color:'var(--success)',  dot:false },
    medium:         { bg:'var(--warning-subtle)',           color:'var(--warning)', dot:false },
    hard:           { bg:'var(--danger-subtle)',            color:'var(--danger)',   dot:false },
  };
  const c = C[status] || { bg:'var(--bg-elevated)', color:'var(--text-2)', dot:false };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px',
      background:c.bg, color:c.color, borderRadius:999, fontSize:11.5, fontWeight:500, whiteSpace:'nowrap' }}>
      {c.dot && <span style={{ width:5, height:5, borderRadius:'50%', background:c.color, flexShrink:0 }}/>}
      {children}
    </span>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────

function Card({ children, style: xs, onClick, noPad }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => onClick&&setHov(true)} onMouseLeave={() => onClick&&setHov(false)}
      style={{ background:'var(--bg-card)', border:`1px solid ${hov?'var(--border-hover)':'var(--border)'}`,
        borderRadius:'var(--radius-lg)', padding: noPad?0:'var(--density-card)',
        cursor:onClick?'pointer':'default', transition:'border-color 150ms ease', ...xs }}>
      {children}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color = 'accent' }) {
  const cMap = { accent:'var(--accent)', success:'var(--success)', warning:'var(--warning)', info:'var(--info)' };
  const sMap = { accent:'var(--accent-subtle)', success:'var(--success-subtle)', warning:'var(--warning-subtle)', info:'var(--info-subtle)' };
  return (
    <Card style={{ flex:1, minWidth:160 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:10, fontWeight:500, letterSpacing:'.01em' }}>{label}</div>
          <div style={{ fontSize:30, fontWeight:700, color:'var(--text-1)', lineHeight:1, letterSpacing:'-.02em' }}>{value}</div>
          {sub && <div style={{ fontSize:11.5, color:'var(--text-3)', marginTop:6 }}>{sub}</div>}
        </div>
        <div style={{ width:40, height:40, borderRadius:10, background:sMap[color], display:'flex',
          alignItems:'center', justifyContent:'center', color:cMap[color], flexShrink:0 }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────

function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ height:'var(--topbar-height)', display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 24px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
      <div>
        <h1 style={{ fontSize:15, fontWeight:600, color:'var(--text-1)', letterSpacing:'-.01em' }}>{title}</h1>
        {subtitle && <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display:'flex', gap:8, alignItems:'center' }}>{actions}</div>}
    </div>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────

function Input({ value, onChange, placeholder, style: xs, type = 'text', prefix, small }) {
  const pad = small ? '6px 10px' : '8px 12px';
  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center', ...xs }}>
      {prefix && <div style={{ position:'absolute', left:10, color:'var(--text-3)', display:'flex', pointerEvents:'none' }}>{prefix}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', padding: prefix ? (small?'6px 10px 6px 32px':'8px 12px 8px 34px') : pad,
          background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
          color:'var(--text-1)', fontSize: small?12.5:13.5, fontFamily:'var(--font)',
          outline:'none', transition:'border-color 150ms' }}
        onFocus={e => e.target.style.borderColor='var(--accent)'}
        onBlur={e => e.target.style.borderColor='var(--border)'} />
    </div>
  );
}

// ─── TEXTAREA ────────────────────────────────────────────────────────────────

function Textarea({ value, onChange, placeholder, rows = 4, style: xs }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ width:'100%', padding:'8px 12px', background:'var(--bg)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-sm)', color:'var(--text-1)', fontSize:13.5, fontFamily:'var(--font)',
        outline:'none', resize:'vertical', lineHeight:1.6, ...xs }}
      onFocus={e => e.target.style.borderColor='var(--accent)'}
      onBlur={e => e.target.style.borderColor='var(--border)'} />
  );
}

// ─── SELECT ──────────────────────────────────────────────────────────────────

function Select({ value, onChange, options, style: xs }) {
  return (
    <select value={value} onChange={onChange}
      style={{ padding:'8px 12px', background:'var(--bg)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-sm)', color:'var(--text-1)', fontSize:13.5,
        fontFamily:'var(--font)', outline:'none', cursor:'pointer', ...xs }}>
      {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
  );
}

// ─── TABLE ───────────────────────────────────────────────────────────────────

function Table({ columns, rows, onRowClick, emptyMessage }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ padding:'9px 16px', textAlign:col.align||'left', fontSize:11,
                fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em',
                borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding:'40px 16px', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>
              {emptyMessage || 'No items found'}
            </td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} onClick={() => onRowClick&&onRowClick(row)}
              style={{ borderBottom:'1px solid var(--border)', cursor:onRowClick?'pointer':'default', transition:'background 100ms' }}
              onMouseEnter={e => onRowClick&&(e.currentTarget.style.background='var(--bg-hover)')}
              onMouseLeave={e => onRowClick&&(e.currentTarget.style.background='transparent')}>
              {columns.map(col => (
                <td key={col.key} style={{ padding:'var(--density-py) 16px', fontSize:13.5,
                  color:'var(--text-1)', textAlign:col.align||'left', verticalAlign:'middle' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }) {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const palette = ['#6366f1','#14b8a6','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#10b981','#ec4899'];
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:`${color}20`,
      border:`1.5px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*.36, fontWeight:600, color, flexShrink:0, letterSpacing:'-.01em' }}>
      {initials}
    </div>
  );
}

// ─── SMALL HELPERS ───────────────────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span style={{ padding:'2px 8px', background:'var(--bg)', border:'1px solid var(--border)',
      borderRadius:999, fontSize:11, color:'var(--text-3)', whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
}

function FormField({ label, hint, children, style: xs }) {
  return (
    <div style={{ marginBottom:18, ...xs }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:500, color:'var(--text-2)', marginBottom:6 }}>{label}</label>}
      {children}
      {hint && <div style={{ fontSize:11.5, color:'var(--text-3)', marginTop:5 }}>{hint}</div>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'var(--accent)', thin }) {
  const pct = Math.min(100, Math.round((value/max)*100));
  return (
    <div style={{ height:thin?3:5, background:'var(--border)', borderRadius:3, overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width 400ms ease' }}/>
    </div>
  );
}

function Divider({ style: xs }) {
  return <div style={{ height:1, background:'var(--border)', margin:'16px 0', ...xs }}/>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
      <div onClick={() => onChange(!checked)} style={{ width:36, height:20, borderRadius:10,
        background:checked?'var(--accent)':'var(--border)', position:'relative', transition:'background 200ms', flexShrink:0 }}>
        <div style={{ position:'absolute', top:3, left:checked?19:3, width:14, height:14,
          borderRadius:'50%', background:'#fff', transition:'left 200ms', boxShadow:'0 1px 3px rgba(0,0,0,.3)' }}/>
      </div>
      {label && <span style={{ fontSize:13.5, color:'var(--text-1)' }}>{label}</span>}
    </label>
  );
}

function SectionLabel({ children, style: xs }) {
  return <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase',
    letterSpacing:'.06em', marginBottom:10, ...xs }}>{children}</div>;
}

function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:500,
      display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth:'90vw', maxHeight:'90vh',
        background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
        boxShadow:'0 24px 80px rgba(0,0,0,.5)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex',
          justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:15, fontWeight:600, color:'var(--text-1)' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            color:'var(--text-3)', display:'flex', padding:4, borderRadius:4 }}>
            <Icons.X size={16}/>
          </button>
        </div>
        <div style={{ padding:20, overflowY:'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// Export everything
Object.assign(window, {
  MOCK, Btn, Badge, Card, StatCard, PageHeader, Input, Textarea, Select,
  Table, Avatar, Tag, FormField, ProgressBar, Divider, Toggle, SectionLabel, Modal
});
