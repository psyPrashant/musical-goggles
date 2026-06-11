import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';
import { DatePipe } from '@angular/common';

type Tab = 'all' | 'active' | 'draft' | 'closed';

@Component({
  selector: 'app-assessments',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Assessments</h1>
          <span class="page-sub">{{ assessments().length }} total</span>
        </div>
        <a routerLink="/assessments/new" class="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Create Assessment
        </a>
      </div>

      <div class="content">
        <div class="tab-bar">
          @for (tab of tabs; track tab.id) {
            <button class="tab" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
              {{ tab.label }}
              <span class="tab-count">{{ tabCount(tab.id) }}</span>
            </button>
          }
        </div>

        @if (loading()) {
          <div class="empty-state">Loading…</div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">No assessments found.</div>
        } @else {
          <div class="assessment-list">
            @for (a of filtered(); track a.id) {
              <div class="assessment-row">
                <div class="assessment-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                </div>
                <div class="assessment-info">
                  <div class="assessment-title-row">
                    <span class="assessment-title">{{ a.title }}</span>
                    <span class="status-badge" [class]="'status-' + a.status.toLowerCase()">
                      {{ a.status === 'PUBLISHED' ? 'Active' : 'Draft' }}
                    </span>
                  </div>
                  <div class="assessment-meta">
                    <span>{{ a.questionCount }} questions</span>
                    <span>{{ a.timeLimitMinutes }} min</span>
                    <span>Created {{ a.createdAt | date:'MMM d, y' }}</span>
                  </div>
                </div>
                <div class="assessment-actions">
                  @if (a.status === 'DRAFT') {
                    <button class="btn btn-ghost btn-sm publish-btn" (click)="publish(a)">Publish</button>
                  }
                  <a [routerLink]="['/assessments', a.id, 'preview']" class="btn btn-ghost btn-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Preview
                  </a>
                  <a [routerLink]="['/assessments', a.id, 'edit']" class="btn btn-secondary btn-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </a>
                  <a [routerLink]="['/results']" class="btn btn-ghost btn-sm">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 20V10M12 20V4M6 20v-6"/>
                    </svg>
                    Results
                  </a>
                  <button class="btn btn-ghost btn-sm danger-btn" (click)="confirmDelete(a)" title="Delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        @if (error()) {
          <div class="error-banner">{{ error() }}</div>
        }
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
      text-decoration: none; white-space: nowrap;
    }
    .btn-sm { padding: 5px 11px; font-size: 12px; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-secondary { background: var(--bg-elevated); color: var(--text-1); border-color: var(--border); }
    .btn-secondary:hover { background: var(--bg-hover); }
    .btn-ghost { background: transparent; color: var(--text-2); }
    .btn-ghost:hover { background: var(--bg-hover); color: var(--text-1); }

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .tab-bar { display: flex; gap: 6px; margin-bottom: 20px; }

    .tab {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 14px; border-radius: 999px; cursor: pointer;
      font-family: var(--font); font-size: 12.5px; font-weight: 400;
      background: transparent; color: var(--text-2); border: 1px solid var(--border);
      transition: all 120ms;
    }

    .tab:hover { background: var(--bg-hover); color: var(--text-1); }

    .tab.active {
      background: var(--accent-subtle); color: var(--accent);
      border-color: var(--accent); font-weight: 600;
    }

    .tab-count {
      font-size: 11px; opacity: 0.7;
      background: var(--bg); padding: 1px 6px; border-radius: 999px;
    }

    .assessment-list { display: flex; flex-direction: column; gap: 10px; }

    .assessment-row {
      display: flex; align-items: center; gap: 14px;
      background: var(--bg-card); border: 1px solid var(--border);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      box-shadow: var(--card-shadow);
      border-radius: var(--radius-lg); padding: 16px 20px;
      transition: border-color 150ms, transform 150ms, box-shadow 150ms;
    }

    .assessment-row:hover {
      border-color: var(--border-hover);
      transform: translateY(-1px);
    }

    .assessment-icon {
      width: 42px; height: 42px; border-radius: 10px;
      background: var(--gradient-accent); color: #fff;
      box-shadow: 0 0 14px rgba(255, 107, 44, 0.25);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .assessment-info { flex: 1; min-width: 0; }

    .assessment-title-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 4px; flex-wrap: wrap;
    }

    .assessment-title { font-size: 14px; font-weight: 600; color: var(--text-1); }

    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 999px;
      font-size: 11.5px; font-weight: 500; white-space: nowrap;
    }

    .status-published { background: var(--success-subtle); color: var(--success); }
    .status-draft { background: rgba(148,163,184,.12); color: var(--text-2); }

    .assessment-meta {
      display: flex; gap: 16px; font-size: 12px; color: var(--text-3);
    }

    .assessment-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: center; }

    .publish-btn { color: var(--success); }
    .publish-btn:hover { background: var(--success-subtle); }

    .danger-btn:hover { color: var(--danger); background: var(--danger-subtle); }

    .empty-state {
      text-align: center; padding: 60px; color: var(--text-3); font-size: 13px;
    }

    .error-banner {
      margin-top: 16px; padding: 10px 14px;
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,.25);
      border-radius: var(--radius-sm); color: var(--danger); font-size: 13px;
    }
  `],
})
export class AssessmentsComponent implements OnInit {
  private readonly svc = inject(AssessmentService);

  readonly assessments = signal<Assessment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<Tab>('all');

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'draft', label: 'Draft' },
    { id: 'closed', label: 'Closed' },
  ];

  readonly filtered = computed(() => {
    const tab = this.activeTab();
    if (tab === 'all') return this.assessments();
    if (tab === 'active') return this.assessments().filter(a => a.status === 'PUBLISHED');
    if (tab === 'draft') return this.assessments().filter(a => a.status === 'DRAFT');
    return [];
  });

  tabCount(tab: Tab): number {
    if (tab === 'all') return this.assessments().length;
    if (tab === 'active') return this.assessments().filter(a => a.status === 'PUBLISHED').length;
    if (tab === 'draft') return this.assessments().filter(a => a.status === 'DRAFT').length;
    return 0;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.listAssessments().subscribe({
      next: list => { this.assessments.set(list); this.loading.set(false); },
      error: () => { this.error.set('Failed to load assessments.'); this.loading.set(false); },
    });
  }

  publish(a: Assessment) {
    this.error.set(null);
    this.svc.publishAssessment(a.id).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error?.detail ?? 'Failed to publish.'),
    });
  }

  confirmDelete(a: Assessment) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.svc.deleteAssessment(a.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Failed to delete assessment.'),
    });
  }
}
