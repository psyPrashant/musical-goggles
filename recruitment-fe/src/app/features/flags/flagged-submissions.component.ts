import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FlagService } from '../../core/flag/flag.service';
import { FlagListItem, FlagReason } from '../../core/flag/flag.model';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';

@Component({
  selector: 'app-flagged-submissions',
  imports: [],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Flagged Submissions</h1>
          <span class="page-sub">{{ filtered().length }} flags</span>
        </div>
      </div>

      <div class="content">
        <!-- Filters -->
        <div class="filter-row">
          <select class="field-select" [value]="filterReason()" (change)="filterReason.set($any($event.target).value)">
            <option value="">All reasons</option>
            <option value="COPIED_ANSWERS">Copied Answers</option>
            <option value="TIMING_ANOMALY">Timing Anomaly</option>
            <option value="AI_GENERATED_CONTENT">AI-Generated Content</option>
            <option value="SUSPICIOUS_BEHAVIOUR">Suspicious Behaviour</option>
            <option value="OTHER">Other</option>
          </select>

          <select class="field-select" [value]="filterAssessmentId()" (change)="filterAssessmentId.set($any($event.target).value)">
            <option value="">All assessments</option>
            @for (a of assessments(); track a.id) {
              <option [value]="a.id">{{ a.title }}</option>
            }
          </select>

          <input type="date" class="field-input" [value]="filterFromDate()"
                 (change)="filterFromDate.set($any($event.target).value)" placeholder="From date" />
          <input type="date" class="field-input" [value]="filterToDate()"
                 (change)="filterToDate.set($any($event.target).value)" placeholder="To date" />

          <button class="btn-ghost" (click)="clearFilters()">Clear</button>
        </div>

        @if (loading()) {
          <div class="empty-state">Loading…</div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">No flagged submissions match your filters.</div>
        } @else {
          <div class="flags-table">
            <div class="table-header">
              <span>Candidate</span>
              <span>Assessment</span>
              <span>Reason</span>
              <span>Date Flagged</span>
              <span>Status</span>
            </div>
            @for (f of filtered(); track f.flagId) {
              <div class="table-row">
                <div class="cell-name">{{ f.candidateName }}</div>
                <div class="cell">{{ f.assessmentName }}</div>
                <div class="cell">{{ reasonLabel(f.reason) }}</div>
                <div class="cell-date">{{ formatDate(f.createdAt) }}</div>
                <div class="cell">
                  <span class="status-badge" [class]="statusClass(f.status)">{{ f.status }}</span>
                </div>
              </div>
            }
          </div>
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

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .filter-row {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 18px;
    }

    .field-select, .field-input {
      padding: 6px 10px; background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1); font-size: 13px;
      outline: none; font-family: var(--font); transition: border-color 150ms;
    }
    .field-select:focus, .field-input:focus { border-color: var(--accent); }

    .btn-ghost {
      padding: 6px 12px; background: transparent; border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-2); font-size: 13px;
      cursor: pointer; transition: all 120ms; font-family: var(--font);
    }
    .btn-ghost:hover { background: var(--bg-hover); color: var(--text-1); }

    .flags-table {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
    }

    .table-header {
      display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
      gap: 12px; padding: 10px 16px;
      background: var(--bg-elevated); border-bottom: 1px solid var(--border);
      font-size: 11.5px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em;
    }

    .table-row {
      display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
      gap: 12px; padding: 12px 16px; align-items: center;
      border-bottom: 1px solid var(--border); transition: background 120ms;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: var(--bg-hover); }

    .cell-name { font-size: 13px; font-weight: 600; color: var(--text-1); }
    .cell { font-size: 13px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cell-date { font-size: 12px; color: var(--text-3); }

    .status-badge {
      display: inline-flex; padding: 2px 8px; border-radius: 999px;
      font-size: 11.5px; font-weight: 500;
    }
    .status-flagged { background: var(--danger-subtle); color: var(--danger); }
    .status-under-review { background: var(--warning-subtle); color: var(--warning); }
    .status-resolved { background: var(--success-subtle); color: var(--success); }
    .status-dismissed { background: rgba(148,163,184,.12); color: var(--text-2); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }
  `],
})
export class FlaggedSubmissionsComponent implements OnInit {
  private readonly flagSvc = inject(FlagService);
  private readonly assessmentSvc = inject(AssessmentService);

  readonly flags = signal<FlagListItem[]>([]);
  readonly assessments = signal<Assessment[]>([]);
  readonly loading = signal(false);

  readonly filterReason = signal<FlagReason | ''>('');
  readonly filterAssessmentId = signal('');
  readonly filterFromDate = signal('');
  readonly filterToDate = signal('');

  readonly filtered = computed(() => {
    const reason = this.filterReason();
    const assessmentId = this.filterAssessmentId();
    const from = this.filterFromDate();
    const to = this.filterToDate();
    return this.flags().filter(f => {
      if (reason && f.reason !== reason) return false;
      if (assessmentId && !f.assessmentName.includes(assessmentId)) return false;
      if (from && f.createdAt < from) return false;
      if (to && f.createdAt > to + 'T23:59:59') return false;
      return true;
    });
  });

  ngOnInit() {
    this.loading.set(true);
    this.flagSvc.getAllFlags().subscribe({
      next: list => { this.flags.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.assessmentSvc.listAssessments().subscribe({ next: list => this.assessments.set(list) });
  }

  clearFilters() {
    this.filterReason.set('');
    this.filterAssessmentId.set('');
    this.filterFromDate.set('');
    this.filterToDate.set('');
  }

  reasonLabel(reason: FlagReason): string {
    const map: Record<FlagReason, string> = {
      COPIED_ANSWERS: 'Copied Answers',
      TIMING_ANOMALY: 'Timing Anomaly',
      AI_GENERATED_CONTENT: 'AI-Generated',
      SUSPICIOUS_BEHAVIOUR: 'Suspicious',
      OTHER: 'Other',
    };
    return map[reason] ?? reason;
  }

  statusClass(status: string): string {
    return 'status-badge status-' + status.toLowerCase().replace('_', '-');
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
