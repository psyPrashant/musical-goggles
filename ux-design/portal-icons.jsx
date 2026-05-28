// portal-icons.jsx — SVG icon library

const Ico = ({ d, size = 18, style, ...rest }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...style }}
    {...rest}
  >
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IcoEl = ({ size = 18, style, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...style }} {...rest}>
    {children}
  </svg>
);

const Icons = {
  Dashboard:    p => <Ico {...p} d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]} />,
  Assessments:  p => <Ico {...p} d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]} />,
  QuestionBank: p => <Ico {...p} d={["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z","M9 9h6","M9 12h4"]} />,
  Candidates:   p => <Ico {...p} d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]} />,
  Results:      p => <Ico {...p} d={["M18 20V10","M12 20V4","M6 20v-6"]} />,
  Plus:         p => <Ico {...p} d="M12 5v14M5 12h14" />,
  Search:       p => <Ico {...p} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" />,
  Sliders:      p => <Ico {...p} d={["M4 5h16","M4 12h16","M4 19h16","M8 2v6","M16 9v6","M11 16v6"]} />,
  Clock:        p => <Ico {...p} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"]} />,
  Check:        p => <Ico {...p} d="M20 6L9 17l-5-5" />,
  X:            p => <Ico {...p} d="M18 6L6 18M6 6l12 12" />,
  Edit:         p => <Ico {...p} d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} />,
  Trash:        p => <Ico {...p} d={["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"]} />,
  Mail:         p => <Ico {...p} d={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"]} />,
  Upload:       p => <Ico {...p} d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} />,
  ChevronRight: p => <Ico {...p} d="M9 18l6-6-6-6" />,
  ChevronDown:  p => <Ico {...p} d="M6 9l6 6 6-6" />,
  ChevronLeft:  p => <Ico {...p} d="M15 18l-6-6 6-6" />,
  Code:         p => <Ico {...p} d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  AlignLeft:    p => <Ico {...p} d="M21 6H3M15 12H3M17 18H3" />,
  ListChecks:   p => <Ico {...p} d={["M10 6H3","M10 12H3","M10 18H3","M14 6l3 3 4-4","M14 12l3 3 4-4"]} />,
  Award:        p => <Ico {...p} d={["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z","M8.21 13.89L7 23l5-3 5 3-1.21-9.12"]} />,
  AlertCircle:  p => <Ico {...p} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 8v4","M12 16h.01"]} />,
  CheckCircle:  p => <Ico {...p} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4L12 14.01l-3-3"]} />,
  ArrowRight:   p => <Ico {...p} d="M5 12h14M12 5l7 7-7 7" />,
  Eye:          p => <Ico {...p} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />,
  Play:         p => <Ico {...p} d="M5 3l14 9-14 9V3z" />,
  Send:         p => <Ico {...p} d={["M22 2L11 13","M22 2L15 22l-4-9-9-4 20-7z"]} />,
  GripVertical: p => (
    <IcoEl {...p}>
      <circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none"/>
    </IcoEl>
  ),
  LogOut:       p => <Ico {...p} d={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"]} />,
  User:         p => <Ico {...p} d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]} />,
  Tag:          p => <Ico {...p} d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />,
  Zap:          p => <Ico {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  Shield:       p => <Ico {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  Copy:         p => <Ico {...p} d={["M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z","M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"]} />,
};

window.Ico = Ico;
window.IcoEl = IcoEl;
window.Icons = Icons;
