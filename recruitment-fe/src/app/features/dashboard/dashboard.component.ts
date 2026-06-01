import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';
import { DashboardService } from '../../core/dashboard/dashboard.service';
import { DashboardStats } from '../../core/dashboard/dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <span class="page-sub">{{ today | date:'EEEE, MMMM d, y' }}</span>
        </div>
        <div class="header-actions">
          <a routerLink="/candidates" class="btn btn-secondary btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="M22 6l-10 7L2 6"/>
            </svg>
            Invite Candidate
          </a>
          <a routerLink="/assessments/new" class="btn btn-primary btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Create Assessment
          </a>
        </div>
      </div>

      @if (statsError()) {
        <div class="stats-error">
          Failed to load dashboard stats. Showing placeholder values.
        </div>
      }

      <div class="content">
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-body">
              <div>
                <div class="stat-label">Total Assessments</div>
                <div class="stat-value">{{ assessments().length }}</div>
                <div class="stat-sub">+1 this week</div>
              </div>
              <div class="stat-icon accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-body">
              <div>
                <div class="stat-label">Active Candidates</div>
                <div class="stat-value">{{ stats()?.activeCandidates ?? '—' }}</div>
                <div class="stat-sub">Across all assessments</div>
              </div>
              <div class="stat-icon info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-body">
              <div>
                <div class="stat-label">Pending Reviews</div>
                <div class="stat-value">{{ stats()?.pendingReviews ?? '—' }}</div>
                <div class="stat-sub">Awaiting evaluation</div>
              </div>
              <div class="stat-icon warning">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-body">
              <div>
                <div class="stat-label">Average Score</div>
                <div class="stat-value">{{ avgScoreDisplay() }}</div>
                <div class="stat-sub">Last 30 days</div>
              </div>
              <div class="stat-icon success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="7"/>
                  <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="mid-grid">
          <div class="card no-pad">
            <div class="card-header">
              <span class="card-title">Recent Assessments</span>
              <a routerLink="/assessments" class="btn btn-ghost btn-sm">View all →</a>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Status</th>
                  <th class="align-right">Questions</th>
                  <th class="align-right">Time</th>
                </tr>
              </thead>
              <tbody>
                @if (loading()) {
                  <tr><td colspan="4" class="table-empty">Loading…</td></tr>
                } @else if (assessments().length === 0) {
                  <tr><td colspan="4" class="table-empty">No assessments yet</td></tr>
                } @else {
                  @for (a of assessments().slice(0, 5); track a.id) {
                    <tr class="clickable" [routerLink]="['/assessments', a.id]">
                      <td>
                        <div class="assessment-name">{{ a.title }}</div>
                        <div class="assessment-meta">Created {{ a.createdAt | date:'MMM d, y' }}</div>
                      </td>
                      <td>
                        <span class="status-badge" [class]="'status-' + a.status.toLowerCase()">
                          {{ a.status === 'PUBLISHED' ? 'Active' : 'Draft' }}
                        </span>
                      </td>
                      <td class="align-right text-dim">{{ a.questionCount }}</td>
                      <td class="align-right text-dim">{{ a.timeLimitMinutes }} min</td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <div class="card no-pad activity-card">
            <div class="card-header border-bottom">
              <span class="card-title">Recent Activity</span>
            </div>
            <div class="activity-list">
              @for (item of stats()?.recentActivity ?? []; track $index) {
                <div class="activity-item">
                  <div class="activity-dot" [class]="'dot-' + activityColor(item.type)"></div>
                  <div class="activity-body">
                    <div class="activity-text">{{ item.description }}</div>
                    <div class="activity-meta">
                      <span>{{ item.meta }}</span>
                      <span>{{ item.occurredAt | date:'MMM d, h:mm a' }}</span>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="activity-empty">No recent activity</div>
              }
            </div>
          </div>
        </div>

        <div class="card no-pad">
          <div class="card-header border-bottom">
            <span class="card-title">Candidate Pipeline</span>
            <a routerLink="/candidates" class="btn btn-ghost btn-sm">Manage →</a>
          </div>
          <div class="pipeline">
            @for (stage of pipelineStages(); track stage.label; let i = $index) {
              <div class="pipeline-stage" [class.last]="i === pipelineStages().length - 1">
                <div class="pipeline-count" [style.color]="stage.color">{{ stage.count }}</div>
                <div class="pipeline-label">{{ stage.label }}</div>
                <div class="pipeline-bar">
                  <div class="pipeline-fill" [style.width.%]="stage.count / 10 * 100" [style.background]="stage.color"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; min-height: 100vh; }

    .page-header {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      flex-shrink: 0;
    }

    .page-title { font-size: 15px; font-weight: 600; color: var(--text-1); letter-spacing: -0.01em; }
    .page-sub { font-size: 12px; color: var(--text-3); }

    .header-actions { display: flex; gap: 8px; align-items: center; }

    .stats-error {
      margin: 12px 24px 0;
      padding: 10px 14px;
      background: var(--danger-subtle, rgba(239,68,68,.08));
      color: var(--danger, #ef4444);
      border-radius: var(--radius-sm);
      font-size: 13px;
    }

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

    .content { padding: 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; }

    .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
    }

    .stat-body { display: flex; align-items: flex-start; justify-content: space-between; }

    .stat-label { font-size: 12px; color: var(--text-2); font-weight: 500; letter-spacing: 0.01em; margin-bottom: 10px; }
    .stat-value { font-size: 30px; font-weight: 700; color: var(--text-1); line-height: 1; letter-spacing: -0.02em; }
    .stat-sub { font-size: 11.5px; color: var(--text-3); margin-top: 6px; }

    .stat-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .stat-icon.accent { background: var(--accent-subtle); color: var(--accent); }
    .stat-icon.info { background: var(--info-subtle); color: var(--info); }
    .stat-icon.warning { background: var(--warning-subtle); color: var(--warning); }
    .stat-icon.success { background: var(--success-subtle); color: var(--success); }

    .mid-grid { display: grid; grid-template-columns: 1fr 320px; gap: 14px; }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
    }

    .card.no-pad { padding: 0; overflow: hidden; }

    .card-header {
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header.border-bottom { border-bottom: 1px solid var(--border); }

    .card-title { font-size: 13.5px; font-weight: 600; color: var(--text-1); }

    .table { width: 100%; border-collapse: collapse; }

    .table th {
      padding: 9px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-3);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .table td {
      padding: 11px 16px;
      font-size: 13.5px;
      color: var(--text-1);
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    .table tr:last-child td { border-bottom: none; }

    .table tr.clickable { cursor: pointer; transition: background 100ms; }
    .table tr.clickable:hover td { background: var(--bg-hover); }

    .align-right { text-align: right; }
    .text-dim { color: var(--text-3); }

    .table-empty { text-align: center; padding: 32px 16px !important; color: var(--text-3); font-size: 13px; }

    .assessment-name { font-weight: 500; }
    .assessment-meta { font-size: 11.5px; color: var(--text-3); margin-top: 2px; }

    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px; border-radius: 999px;
      font-size: 11.5px; font-weight: 500; white-space: nowrap;
    }

    .status-published { background: var(--success-subtle); color: var(--success); }
    .status-draft { background: rgba(148,163,184,.12); color: var(--text-2); }

    .activity-card { display: flex; flex-direction: column; }

    .activity-list { overflow-y: auto; flex: 1; }

    .activity-item {
      display: flex;
      gap: 12px;
      padding: 11px 20px;
      border-bottom: 1px solid var(--border);
    }

    .activity-item:last-child { border-bottom: none; }

    .activity-dot {
      width: 7px; height: 7px; border-radius: 50%;
      margin-top: 5px; flex-shrink: 0;
    }

    .dot-success { background: var(--success); }
    .dot-info { background: var(--info); }
    .dot-warning { background: var(--warning); }
    .dot-danger { background: var(--danger); }

    .activity-body { flex: 1; }
    .activity-text { font-size: 13px; color: var(--text-1); line-height: 1.45; }
    .activity-meta {
      display: flex; justify-content: space-between; margin-top: 3px; gap: 8px;
      font-size: 11.5px; color: var(--text-3);
    }

    .activity-empty {
      padding: 32px 20px;
      text-align: center;
      font-size: 13px;
      color: var(--text-3);
    }

    .pipeline { display: grid; grid-template-columns: repeat(4, 1fr); }

    .pipeline-stage {
      padding: 16px 20px;
      border-right: 1px solid var(--border);
    }

    .pipeline-stage.last { border-right: none; }

    .pipeline-count { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
    .pipeline-label { font-size: 12px; color: var(--text-3); margin-top: 3px; }
    .pipeline-bar { height: 3px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 6px; }
    .pipeline-fill { height: 100%; border-radius: 3px; transition: width 400ms ease; }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly assessmentService = inject(AssessmentService);
  private readonly dashboardService = inject(DashboardService);

  readonly assessments = signal<Assessment[]>([]);
  readonly loading = signal(true);
  readonly today = new Date();

  readonly stats = signal<DashboardStats | null>(null);
  readonly statsError = signal(false);

  readonly avgScoreDisplay = computed(() => {
    const s = this.stats();
    if (!s || s.averageScore === null) return '—';
    return s.averageScore.toFixed(1) + '%';
  });

  readonly pipelineStages = computed(() => {
    const p = this.stats()?.pipeline;
    if (!p) return [];
    return [
      { label: 'Invited', count: p.invited, color: 'var(--text-2)' },
      { label: 'In Progress', count: p.inProgress, color: 'var(--info)' },
      { label: 'Pending Review', count: p.pendingReview, color: 'var(--warning)' },
      { label: 'Completed', count: p.completed, color: 'var(--success)' },
    ];
  });

  activityColor(type: string): string {
    if (type === 'SUBMISSION_COMPLETED') return 'success';
    if (type === 'SUBMISSION_STARTED') return 'info';
    return 'warning';
  }

  ngOnInit() {
    this.assessmentService.listAssessments().subscribe({
      next: a => { this.assessments.set(a); this.loading.set(false); },
      error: () => this.loading.set(false),
    });

    this.dashboardService.getStats().subscribe({
      next: s => this.stats.set(s),
      error: () => this.statsError.set(true),
    });
  }
}
