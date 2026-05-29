import { Component, computed, signal } from '@angular/core';

interface SubmissionAnswer {
  questionId: string;
  questionTitle: string;
  questionType: 'MCQ' | 'TEXT' | 'CODE_SUBMISSION';
  candidateAnswer: string;
  score: number | null;
  maxScore: number;
  feedback: string;
}

interface Submission {
  id: string;
  candidateName: string;
  candidateEmail: string;
  assessment: string;
  status: 'pending' | 'evaluated';
  totalScore: number | null;
  maxScore: number;
  submittedAt: string;
  answers: SubmissionAnswer[];
}

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: '1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.j@example.com',
    assessment: 'Frontend Developer Assessment',
    status: 'evaluated',
    totalScore: 87,
    maxScore: 100,
    submittedAt: '2026-05-20T14:32:00Z',
    answers: [
      { questionId: 'q1', questionTitle: 'What is the Virtual DOM?', questionType: 'TEXT', candidateAnswer: 'The Virtual DOM is an in-memory representation of the actual DOM. React uses it to batch updates and minimize costly real DOM operations by diffing the previous and new virtual trees.', score: 9, maxScore: 10, feedback: '' },
      { questionId: 'q2', questionTitle: 'Time complexity of binary search', questionType: 'MCQ', candidateAnswer: 'O(log n)', score: 10, maxScore: 10, feedback: '' },
      { questionId: 'q3', questionTitle: 'Implement a debounce function', questionType: 'CODE_SUBMISSION', candidateAnswer: 'function debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}', score: 18, maxScore: 20, feedback: 'Good implementation. Missing TypeScript types.' },
    ],
  },
  {
    id: '2',
    candidateName: 'Marcus Chen',
    candidateEmail: 'mchen@techcorp.io',
    assessment: 'Backend Engineer Test',
    status: 'evaluated',
    totalScore: 92,
    maxScore: 100,
    submittedAt: '2026-05-21T10:15:00Z',
    answers: [
      { questionId: 'q4', questionTitle: 'Explain REST vs GraphQL', questionType: 'TEXT', candidateAnswer: 'REST uses fixed endpoints for each resource while GraphQL exposes a single endpoint and lets clients specify exactly which data they need. GraphQL reduces over/under-fetching but adds complexity.', score: 10, maxScore: 10, feedback: 'Excellent comparison with practical tradeoffs.' },
      { questionId: 'q5', questionTitle: 'SQL INNER JOIN vs LEFT JOIN', questionType: 'MCQ', candidateAnswer: 'INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table', score: 10, maxScore: 10, feedback: '' },
      { questionId: 'q6', questionTitle: 'Implement a rate limiter', questionType: 'CODE_SUBMISSION', candidateAnswer: 'class RateLimiter {\n  constructor(limit, windowMs) {\n    this.limit = limit;\n    this.windowMs = windowMs;\n    this.requests = new Map();\n  }\n  isAllowed(key) {\n    const now = Date.now();\n    const reqs = (this.requests.get(key) || []).filter(t => now - t < this.windowMs);\n    if (reqs.length >= this.limit) return false;\n    reqs.push(now);\n    this.requests.set(key, reqs);\n    return true;\n  }\n}', score: 19, maxScore: 20, feedback: '' },
    ],
  },
  {
    id: '3',
    candidateName: 'Aisha Okonkwo',
    candidateEmail: 'aisha.ok@startup.ng',
    assessment: 'Backend Engineer Test',
    status: 'pending',
    totalScore: null,
    maxScore: 100,
    submittedAt: '2026-05-18T16:45:00Z',
    answers: [
      { questionId: 'q4', questionTitle: 'Explain REST vs GraphQL', questionType: 'TEXT', candidateAnswer: 'REST is the older standard with multiple endpoints. GraphQL is newer and uses one endpoint with a query language.', score: null, maxScore: 10, feedback: '' },
      { questionId: 'q5', questionTitle: 'SQL INNER JOIN vs LEFT JOIN', questionType: 'MCQ', candidateAnswer: 'INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table', score: null, maxScore: 10, feedback: '' },
    ],
  },
  {
    id: '4',
    candidateName: 'Elena Petrova',
    candidateEmail: 'e.petrova@enterprise.ru',
    assessment: 'Backend Engineer Test',
    status: 'evaluated',
    totalScore: 81,
    maxScore: 100,
    submittedAt: '2026-05-19T09:20:00Z',
    answers: [
      { questionId: 'q4', questionTitle: 'Explain REST vs GraphQL', questionType: 'TEXT', candidateAnswer: 'REST uses HTTP methods (GET, POST, PUT, DELETE) with dedicated endpoints per resource. GraphQL provides a type system and query language, fetching only needed data in one round trip.', score: 9, maxScore: 10, feedback: '' },
      { questionId: 'q6', questionTitle: 'Implement a rate limiter', questionType: 'CODE_SUBMISSION', candidateAnswer: 'const rateLimit = (limit, windowMs) => {\n  const hits = {};\n  return (key) => {\n    const now = Date.now();\n    hits[key] = (hits[key] || []).filter(t => now - t < windowMs);\n    if (hits[key].length >= limit) return false;\n    hits[key].push(now);\n    return true;\n  };\n};', score: 17, maxScore: 20, feedback: 'Clean closure approach. No cleanup of old keys.' },
    ],
  },
  {
    id: '5',
    candidateName: 'Marcus Chen',
    candidateEmail: 'mchen@techcorp.io',
    assessment: 'Full Stack Challenge',
    status: 'pending',
    totalScore: null,
    maxScore: 120,
    submittedAt: '2026-05-26T11:00:00Z',
    answers: [
      { questionId: 'q7', questionTitle: 'Design a URL shortener', questionType: 'TEXT', candidateAnswer: 'Use a hash function (MD5/SHA) on the long URL, take first 7 chars. Store in Redis for fast lookup and PostgreSQL for persistence. Add CDN for redirect endpoints.', score: null, maxScore: 20, feedback: '' },
    ],
  },
];

@Component({
  selector: 'app-results',
  imports: [],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Results & Evaluation</h1>
          <span class="page-sub">{{ submissions().length }} submissions</span>
        </div>
        <div class="header-filters">
          @for (f of statusFilters; track f.value) {
            <button class="filter-chip" [class.active]="statusFilter() === f.value" (click)="statusFilter.set(f.value)">{{ f.label }}</button>
          }
        </div>
      </div>

      <div class="mock-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Sample data — results and evaluation backend not yet implemented.
        </div>

      <div class="split-layout">
        <div class="submissions-panel">
          @for (s of filteredSubmissions(); track s.id) {
            <div class="submission-item" [class.active]="selected()?.id === s.id" (click)="selectSubmission(s)">
              <div class="sub-avatar" [style.background]="avatarColor(s.candidateName)">{{ initials(s.candidateName) }}</div>
              <div class="sub-info">
                <div class="sub-name-row">
                  <span class="sub-name">{{ s.candidateName }}</span>
                  <span class="sub-status" [class]="'sub-status-' + s.status">{{ s.status === 'evaluated' ? 'Evaluated' : 'Pending' }}</span>
                </div>
                <span class="sub-assessment">{{ s.assessment }}</span>
                <span class="sub-date">{{ formatDate(s.submittedAt) }}</span>
              </div>
              @if (s.totalScore !== null) {
                <div class="sub-score" [class.score-high]="s.totalScore / s.maxScore >= 0.8" [class.score-mid]="s.totalScore / s.maxScore >= 0.6 && s.totalScore / s.maxScore < 0.8" [class.score-low]="s.totalScore / s.maxScore < 0.6">
                  {{ s.totalScore }}<span class="score-max">/{{ s.maxScore }}</span>
                </div>
              }
            </div>
          }
          @if (filteredSubmissions().length === 0) {
            <div class="empty-panel">No submissions.</div>
          }
        </div>

        <div class="detail-panel">
          @if (!selected()) {
            <div class="no-selection">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
              <span>Select a submission to review</span>
            </div>
          } @else {
            <div class="detail-scroll">
              <div class="detail-header">
                <div class="detail-avatar" [style.background]="avatarColor(selected()!.candidateName)">{{ initials(selected()!.candidateName) }}</div>
                <div class="detail-candidate-info">
                  <span class="detail-name">{{ selected()!.candidateName }}</span>
                  <span class="detail-email">{{ selected()!.candidateEmail }}</span>
                  <span class="detail-assessment">{{ selected()!.assessment }}</span>
                </div>
                <div class="detail-score-block">
                  @if (selected()!.totalScore !== null) {
                    <div class="total-score">{{ selected()!.totalScore }}</div>
                    <div class="total-max">/ {{ selected()!.maxScore }}</div>
                  } @else {
                    <div class="total-score pending-score">—</div>
                    <div class="total-max">/ {{ selected()!.maxScore }}</div>
                  }
                  <div class="score-bar-wrap">
                    <div class="score-bar" [style.width]="scorePercent(selected()!) + '%'" [class.bar-high]="(selected()!.totalScore ?? 0) / selected()!.maxScore >= 0.8" [class.bar-mid]="(selected()!.totalScore ?? 0) / selected()!.maxScore >= 0.6 && (selected()!.totalScore ?? 0) / selected()!.maxScore < 0.8" [class.bar-low]="(selected()!.totalScore ?? 0) / selected()!.maxScore < 0.6 && selected()!.totalScore !== null"></div>
                  </div>
                </div>
              </div>

              <div class="answers-list">
                @for (a of editedAnswers(); track a.questionId; let i = $index) {
                  <div class="answer-card">
                    <div class="answer-card-header">
                      <div class="q-num">Q{{ i + 1 }}</div>
                      <span class="q-type-badge type-{{ a.questionType.toLowerCase() }}">{{ typeLabel(a.questionType) }}</span>
                      <span class="q-title">{{ a.questionTitle }}</span>
                      <div class="score-input-wrap">
                        <input type="number" class="score-input" [value]="a.score ?? ''"
                               (input)="updateScore(i, $event)"
                               [min]="0" [max]="a.maxScore" placeholder="0" />
                        <span class="score-sep">/</span>
                        <span class="score-max-label">{{ a.maxScore }}</span>
                      </div>
                    </div>
                    <div class="answer-content">{{ a.candidateAnswer }}</div>
                    <textarea class="feedback-input" rows="2" [value]="a.feedback"
                              (input)="updateFeedback(i, $event)"
                              placeholder="Add feedback for this answer…"></textarea>
                  </div>
                }
              </div>

              <div class="save-row">
                <button class="btn btn-primary" (click)="saveEvaluation()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  Save Evaluation
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; min-height: 100vh; }

    .page-header {
      height: var(--topbar-height);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; border-bottom: 1px solid var(--border);
      background: var(--bg-card); flex-shrink: 0;
    }

    .page-title { font-size: 15px; font-weight: 600; color: var(--text-1); letter-spacing: -0.01em; }
    .page-sub { font-size: 12px; color: var(--text-3); }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500; cursor: pointer;
      border: 1px solid transparent; transition: all 120ms;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-hover); }

    .header-filters { display: flex; gap: 5px; }

    .filter-chip {
      padding: 5px 12px; border-radius: 999px; cursor: pointer;
      font-family: var(--font); font-size: 12.5px; font-weight: 400;
      background: transparent; color: var(--text-2); border: 1px solid var(--border);
      transition: all 120ms;
    }
    .filter-chip:hover { background: var(--bg-hover); color: var(--text-1); }
    .filter-chip.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); font-weight: 600; }

    .split-layout {
      display: grid; grid-template-columns: 320px 1fr;
      flex: 1; min-height: 0;
    }

    .submissions-panel {
      border-right: 1px solid var(--border);
      overflow-y: auto;
    }

    .submission-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 14px 16px; border-bottom: 1px solid var(--border);
      cursor: pointer; transition: background 120ms;
    }
    .submission-item:hover { background: var(--bg-hover); }
    .submission-item.active { background: var(--accent-subtle); }

    .sub-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .sub-info { flex: 1; min-width: 0; }

    .sub-name-row { display: flex; align-items: center; gap: 7px; margin-bottom: 2px; }

    .sub-name { font-size: 13px; font-weight: 600; color: var(--text-1); }

    .sub-status {
      font-size: 10.5px; padding: 1px 6px; border-radius: 999px; font-weight: 500;
    }
    .sub-status-evaluated { background: var(--success-subtle); color: var(--success); }
    .sub-status-pending { background: var(--warning-subtle); color: var(--warning); }

    .sub-assessment { display: block; font-size: 11.5px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sub-date { display: block; font-size: 11px; color: var(--text-3); margin-top: 2px; }

    .sub-score {
      font-size: 14px; font-weight: 700; flex-shrink: 0; margin-top: 2px;
    }
    .score-max { font-size: 11px; font-weight: 400; color: var(--text-3); }
    .score-high { color: var(--success); }
    .score-mid { color: var(--warning); }
    .score-low { color: var(--danger); }

    .detail-panel { overflow-y: auto; }

    .no-selection {
      height: 100%; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 10px;
      color: var(--text-3); font-size: 13px;
    }

    .detail-scroll { padding: 20px; }

    .detail-header {
      display: flex; align-items: flex-start; gap: 14px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px 20px;
      margin-bottom: 16px;
    }

    .detail-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .detail-candidate-info { flex: 1; }
    .detail-name { display: block; font-size: 15px; font-weight: 600; color: var(--text-1); }
    .detail-email { display: block; font-size: 12px; color: var(--text-3); margin-top: 2px; }
    .detail-assessment { display: block; font-size: 12px; color: var(--text-2); margin-top: 4px; }

    .detail-score-block { text-align: right; flex-shrink: 0; }
    .total-score { font-size: 26px; font-weight: 800; color: var(--text-1); line-height: 1; }
    .pending-score { color: var(--text-3); }
    .total-max { font-size: 12px; color: var(--text-3); margin-top: 2px; }
    .score-bar-wrap {
      width: 80px; height: 4px; background: var(--bg-elevated);
      border-radius: 999px; margin-top: 8px; overflow: hidden;
    }
    .score-bar { height: 100%; border-radius: 999px; transition: width 300ms; min-width: 4px; }
    .bar-high { background: var(--success); }
    .bar-mid { background: var(--warning); }
    .bar-low { background: var(--danger); }

    .answers-list { display: flex; flex-direction: column; gap: 12px; }

    .answer-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 16px;
    }

    .answer-card-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    }

    .q-num {
      width: 26px; height: 26px; border-radius: 50%;
      background: var(--bg-elevated); color: var(--text-2);
      font-size: 11.5px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .q-type-badge {
      display: inline-flex; padding: 2px 7px; border-radius: 999px;
      font-size: 11px; font-weight: 500; flex-shrink: 0;
    }
    .type-mcq { background: var(--accent-subtle); color: var(--accent); }
    .type-text { background: var(--info-subtle); color: var(--info); }
    .type-code_submission { background: rgba(168,85,247,0.13); color: #a855f7; }

    .q-title { font-size: 13px; font-weight: 500; color: var(--text-1); flex: 1; }

    .score-input-wrap { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .score-input {
      width: 48px; padding: 4px 7px; text-align: center;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13px; outline: none;
    }
    .score-input:focus { border-color: var(--accent); }
    .score-sep { font-size: 12px; color: var(--text-3); }
    .score-max-label { font-size: 12px; color: var(--text-3); }

    .answer-content {
      font-size: 13px; color: var(--text-2); line-height: 1.65;
      padding: 10px 12px; background: var(--bg-elevated);
      border-radius: var(--radius-sm); margin-bottom: 10px;
      white-space: pre-wrap; font-family: var(--font-mono);
    }

    .feedback-input {
      width: 100%; padding: 8px 12px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 12.5px; resize: none; outline: none;
      font-family: var(--font); line-height: 1.5; box-sizing: border-box;
      transition: border-color 150ms;
    }
    .feedback-input:focus { border-color: var(--accent); }
    .feedback-input::placeholder { color: var(--text-3); }

    .save-row { display: flex; justify-content: flex-end; margin-top: 16px; }

    .mock-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px; margin: 0 0 0 0;
      background: var(--warning-subtle); border-bottom: 1px solid rgba(245,158,11,.25);
      color: var(--warning); font-size: 12.5px; flex-shrink: 0;
    }

    .empty-panel { padding: 40px; text-align: center; color: var(--text-3); font-size: 13px; }
  `],
})
export class ResultsComponent {
  readonly submissions = signal<Submission[]>(MOCK_SUBMISSIONS);
  readonly selected = signal<Submission | null>(null);
  readonly editedAnswers = signal<SubmissionAnswer[]>([]);
  readonly statusFilter = signal('');

  readonly statusFilters = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'evaluated', label: 'Evaluated' },
  ];

  readonly filteredSubmissions = computed(() => {
    const filter = this.statusFilter();
    return this.submissions().filter(s => !filter || s.status === filter);
  });

  selectSubmission(s: Submission) {
    this.selected.set(s);
    this.editedAnswers.set(s.answers.map(a => ({ ...a })));
  }

  updateScore(index: number, event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    const answers = [...this.editedAnswers()];
    answers[index] = { ...answers[index], score: isNaN(val) ? null : val };
    this.editedAnswers.set(answers);
  }

  updateFeedback(index: number, event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    const answers = [...this.editedAnswers()];
    answers[index] = { ...answers[index], feedback: val };
    this.editedAnswers.set(answers);
  }

  saveEvaluation() {
    const sub = this.selected();
    if (!sub) return;
    const answers = this.editedAnswers();
    const total = answers.reduce((sum, a) => sum + (a.score ?? 0), 0);
    const updated: Submission = { ...sub, answers, totalScore: total, status: 'evaluated' };
    this.submissions.update(list => list.map(s => s.id === updated.id ? updated : s));
    this.selected.set(updated);
  }

  scorePercent(s: Submission): number {
    if (s.totalScore === null) return 0;
    return Math.round((s.totalScore / s.maxScore) * 100);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  typeLabel(type: string): string {
    return { MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code' }[type] ?? type;
  }
}
