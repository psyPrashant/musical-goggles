import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { FlagService } from '../../core/flag/flag.service';
import { FlagListItem, FlagReason, FlagStatus } from '../../core/flag/flag.model';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';
import { CandidateService } from '../../core/candidate/candidate.service';

type ActiveForm =
  | { type: 'contact'; flagId: string; subject: string; message: string; sending: boolean; error: string | null; success: boolean }
  | { type: 'resolve'; flagId: string; notes: string; saving: boolean; error: string | null };

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

          <select class="field-select" [value]="filterStatus()" (change)="filterStatus.set($any($event.target).value)">
            <option value="">All statuses</option>
            <option value="FLAGGED">Flagged</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACTION_REQUIRED">Action Required</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

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
              <span>Actions</span>
            </div>
            @for (f of filtered(); track f.flagId) {
              <div class="table-row"
                   (click)="viewResult(f)">
                <div class="cell-name">
                  {{ f.candidateName }}
                  @if (f.candidateBlacklisted) { <span class="badge-bl">Blacklisted</span> }
                  @if (f.candidateActionRequired) { <span class="badge-ar">Action Required</span> }
                </div>
                <div class="cell">{{ f.assessmentName }}</div>
                <div class="cell">{{ reasonLabel(f.reason) }}</div>
                <div class="cell-date">{{ formatDate(f.createdAt) }}</div>
                <div class="cell">
                  <span class="status-badge" [class]="statusClass(f.status)">{{ statusLabel(f.status) }}</span>
                  @if (f.candidateActionRequired && f.status !== 'ACTION_REQUIRED') {
                    <span class="action-req-badge">⚠ Action Req.</span>
                  }
                  @if ((flagHistoryMap().get(f.submissionId)?.length ?? 0) > 1) {
                    <button class="btn-history-icon" title="View flag history"
                            (click)="$event.stopPropagation(); openHistorySubmissionId.set(openHistorySubmissionId() === f.submissionId ? null : f.submissionId)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                      </svg>
                    </button>
                  }
                </div>
                <div class="cell-actions" (click)="$event.stopPropagation()">
                  <!-- Actions dropdown trigger -->
                  <div class="dropdown-wrap">
                    <button class="btn-actions"
                            (click)="toggleDropdown(f.flagId)">
                      Actions ▾
                    </button>

                    @if (openDropdownId() === f.flagId) {
                      <div class="dropdown-menu">
                        <button class="dropdown-item" (click)="viewResult(f); closeDropdown()">View Result</button>
                        <button class="dropdown-item" (click)="openContactForm(f)">Contact Candidate</button>
                        <button class="dropdown-item" (click)="toggleBlacklist(f)">
                          {{ f.candidateBlacklisted ? 'Unblacklist' : 'Blacklist' }}
                        </button>
                        @if (f.status === 'FLAGGED' || f.status === 'UNDER_REVIEW' || f.status === 'ACTION_REQUIRED') {
                          <button class="dropdown-item" (click)="openResolveForm(f)">Resolve Flag</button>
                          <button class="dropdown-item danger" (click)="dismissFlag(f); closeDropdown()">
                            {{ dismissingFlagId() === f.flagId ? 'Dismissing…' : 'Dismiss' }}
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <!-- Blacklist error -->
                  @if (blacklistError()?.flagId === f.flagId) {
                    <span class="inline-error">{{ blacklistError()!.message }}</span>
                  }

                  <!-- Contact form -->
                  @if (activeForm()?.type === 'contact' && activeForm()!.flagId === f.flagId) {
                    @let form = $any(activeForm())!;
                    <div class="inline-form" (click)="$event.stopPropagation()">
                      <input class="field-input-sm" type="text" placeholder="Subject"
                             [value]="form.subject"
                             (input)="updateContactSubject($any($event.target).value)" />
                      <textarea class="field-textarea" placeholder="Message (required)"
                                [value]="form.message"
                                (input)="updateContactMessage($any($event.target).value)"></textarea>
                      @if (form.error) { <span class="inline-error">{{ form.error }}</span> }
                      @if (form.success) { <span class="inline-success">Email sent!</span> }
                      <div class="form-actions">
                        <button class="btn-save" [disabled]="!form.message || form.sending"
                                (click)="submitContact(f)">
                          {{ form.sending ? 'Sending…' : 'Send' }}
                        </button>
                        <button class="btn-cancel" (click)="activeForm.set(null)">Cancel</button>
                      </div>
                    </div>
                  }

                  <!-- Resolve form -->
                  @if (activeForm()?.type === 'resolve' && activeForm()!.flagId === f.flagId) {
                    @let form = $any(activeForm())!;
                    <div class="inline-form" (click)="$event.stopPropagation()">
                      <textarea class="field-textarea" placeholder="Resolution notes (required)"
                                [value]="form.notes"
                                (input)="updateResolveNotes($any($event.target).value)"></textarea>
                      @if (form.error) { <span class="inline-error">{{ form.error }}</span> }
                      <div class="form-actions">
                        <button class="btn-save" [disabled]="!form.notes || form.saving"
                                (click)="submitResolve(f)">
                          {{ form.saving ? 'Resolving…' : 'Confirm Resolve' }}
                        </button>
                        <button class="btn-cancel" (click)="activeForm.set(null)">Cancel</button>
                      </div>
                    </div>
                  }

                  @if (dismissError()?.flagId === f.flagId) {
                    <span class="inline-error">{{ dismissError()!.message }}</span>
                  }
                </div>
              </div>
              @if (openHistorySubmissionId() === f.submissionId) {
                <div class="flag-history-panel" (click)="$event.stopPropagation()">
                  <div class="flag-history-title">Flag History</div>
                  @for (h of (flagHistoryMap().get(f.submissionId) ?? []).slice().sort((a,b) => a.createdAt.localeCompare(b.createdAt)); track h.flagId) {
                    <div class="flag-history-entry">
                      <span class="fh-reason">{{ reasonLabel(h.reason) }}</span>
                      <span class="status-badge" [class]="statusClass(h.status)">{{ statusLabel(h.status) }}</span>
                      <span class="fh-date">{{ formatDate(h.createdAt) }}</span>
                    </div>
                  }
                </div>
              }
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
      border-radius: var(--radius-lg); overflow: visible;
    }

    .table-header {
      display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr;
      gap: 12px; padding: 10px 16px;
      background: var(--bg-elevated); border-bottom: 1px solid var(--border);
      font-size: 11.5px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    .table-row {
      display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr;
      gap: 12px; padding: 12px 16px; align-items: start;
      border-bottom: 1px solid var(--border); transition: background 120ms;
      cursor: pointer;
    }
    .table-row:last-child { border-bottom: none; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
    .table-row:hover { background: var(--bg-hover); }

    .cell-name { font-size: 13px; font-weight: 600; color: var(--text-1); display: flex; flex-direction: column; gap: 3px; }
    .cell { font-size: 13px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cell-date { font-size: 12px; color: var(--text-3); }
    .cell-actions { display: flex; flex-direction: column; gap: 6px; position: relative; }

    .badge-bl {
      display: inline-flex; padding: 1px 6px; border-radius: 999px; font-size: 10px; font-weight: 500;
      background: var(--danger-subtle); color: var(--danger);
    }
    .badge-ar {
      display: inline-flex; padding: 1px 6px; border-radius: 999px; font-size: 10px; font-weight: 500;
      background: var(--warning-subtle); color: var(--warning);
    }

    .status-badge {
      display: inline-flex; padding: 2px 8px; border-radius: 999px;
      font-size: 11.5px; font-weight: 500;
    }
    .status-flagged { background: var(--danger-subtle); color: var(--danger); }
    .status-under-review { background: var(--warning-subtle); color: var(--warning); }
    .status-action-required { background: rgba(234,88,12,.12); color: #ea580c; }
    .status-resolved { background: var(--success-subtle); color: var(--success); }
    .status-dismissed { background: rgba(148,163,184,.12); color: var(--text-2); }

    /* Dropdown */
    .dropdown-wrap { position: relative; display: inline-block; }
    .btn-actions {
      padding: 4px 10px; background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-2); font-size: 12px; cursor: pointer;
      font-family: var(--font); transition: all 120ms; white-space: nowrap;
    }
    .btn-actions:hover { background: var(--bg-hover); color: var(--text-1); }

    .dropdown-menu {
      position: absolute; top: calc(100% + 4px); right: 0; z-index: 50;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-sm); min-width: 160px;
      box-shadow: 0 4px 16px rgba(0,0,0,.18); overflow: hidden;
    }
    .dropdown-item {
      display: block; width: 100%; text-align: left; padding: 8px 14px;
      font-size: 13px; color: var(--text-1); background: transparent; border: none;
      cursor: pointer; font-family: var(--font); transition: background 100ms;
    }
    .dropdown-item:hover { background: var(--bg-hover); }
    .dropdown-item.danger { color: var(--danger); }
    .dropdown-item.danger:hover { background: var(--danger-subtle); }

    /* Inline forms */
    .inline-form {
      display: flex; flex-direction: column; gap: 6px; margin-top: 6px;
      padding: 10px; background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); min-width: 260px;
    }
    .field-input-sm {
      padding: 5px 8px; background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1); font-size: 12px;
      outline: none; font-family: var(--font);
    }
    .field-input-sm:focus { border-color: var(--accent); }
    .field-textarea {
      padding: 6px 8px; background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1); font-size: 12px;
      outline: none; font-family: var(--font); min-height: 72px; resize: vertical;
    }
    .field-textarea:focus { border-color: var(--accent); }
    .form-actions { display: flex; gap: 6px; }
    .btn-save {
      padding: 4px 12px; background: var(--accent); border: none;
      border-radius: var(--radius-sm); color: #fff; font-size: 12px;
      cursor: pointer; font-family: var(--font);
    }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel {
      padding: 4px 10px; background: transparent; border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-2); font-size: 12px;
      cursor: pointer; font-family: var(--font);
    }

    .action-req-badge { font-size: 10.5px; font-weight: 600; padding: 2px 6px; border-radius: 999px; background: var(--warning-subtle); color: var(--warning); white-space: nowrap; margin-left: 4px; }
    .btn-history-icon { background: none; border: none; cursor: pointer; color: var(--text-3); padding: 2px; margin-left: 4px; line-height: 1; }
    .btn-history-icon:hover { color: var(--accent); }
    .flag-history-panel { border-top: 1px solid var(--border); padding: 10px 16px; background: var(--bg-elevated); }
    .flag-history-title { font-size: 11px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
    .flag-history-entry { display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
    .flag-history-entry:last-child { border-bottom: none; }
    .fh-reason { flex: 1; color: var(--text-2); }
    .fh-date { color: var(--text-3); font-size: 11.5px; }
    .inline-error { font-size: 11.5px; color: var(--danger); }
    .inline-success { font-size: 11.5px; color: var(--success); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }
  `],
})
export class FlaggedSubmissionsComponent implements OnInit {
  private readonly flagSvc = inject(FlagService);
  private readonly assessmentSvc = inject(AssessmentService);
  private readonly candidateSvc = inject(CandidateService);
  private readonly router = inject(Router);

  readonly flags = signal<FlagListItem[]>([]);
  readonly assessments = signal<Assessment[]>([]);
  readonly loading = signal(false);
  readonly dismissingFlagId = signal<string | null>(null);
  readonly dismissError = signal<{ flagId: string; message: string } | null>(null);
  readonly blacklistError = signal<{ flagId: string; message: string } | null>(null);
  readonly openDropdownId = signal<string | null>(null);
  readonly activeForm = signal<ActiveForm | null>(null);
  readonly openHistorySubmissionId = signal<string | null>(null);

  readonly filterReason = signal<FlagReason | ''>('');
  readonly filterAssessmentId = signal('');
  readonly filterFromDate = signal('');
  readonly filterToDate = signal('');
  readonly filterStatus = signal<FlagStatus | ''>('');

  readonly flagHistoryMap = computed(() => {
    const map = new Map<string, FlagListItem[]>();
    for (const f of this.flags()) {
      const existing = map.get(f.submissionId) ?? [];
      map.set(f.submissionId, [...existing, f]);
    }
    return map;
  });

  readonly deduplicatedFlags = computed(() => {
    const latest: FlagListItem[] = [];
    for (const [, group] of this.flagHistoryMap()) {
      const sorted = [...group].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      latest.push(sorted[0]);
    }
    return latest;
  });

  readonly filtered = computed(() => {
    const reason = this.filterReason();
    const assessmentId = this.filterAssessmentId();
    const from = this.filterFromDate();
    const to = this.filterToDate();
    const status = this.filterStatus();
    return this.deduplicatedFlags().filter(f => {
      if (status && f.status !== status) return false;
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

  viewResult(flag: FlagListItem) {
    this.router.navigate(['/results'], { queryParams: { submission: flag.submissionId } });
  }

  toggleDropdown(flagId: string) {
    this.openDropdownId.update(id => id === flagId ? null : flagId);
    this.activeForm.set(null);
    this.blacklistError.set(null);
    this.dismissError.set(null);
  }

  closeDropdown() {
    this.openDropdownId.set(null);
  }

  openContactForm(flag: FlagListItem) {
    this.closeDropdown();
    this.activeForm.set({
      type: 'contact',
      flagId: flag.flagId,
      subject: `Regarding your recent assessment — action required`,
      message: '',
      sending: false,
      error: null,
      success: false,
    });
  }

  updateContactSubject(value: string) {
    const f = this.activeForm();
    if (f?.type === 'contact') this.activeForm.set({ ...f, subject: value });
  }

  updateContactMessage(value: string) {
    const f = this.activeForm();
    if (f?.type === 'contact') this.activeForm.set({ ...f, message: value });
  }

  submitContact(flag: FlagListItem) {
    const f = this.activeForm();
    if (f?.type !== 'contact' || !f.message) return;
    this.activeForm.set({ ...f, sending: true, error: null });
    this.candidateSvc.contactCandidate(flag.candidateId, { subject: f.subject, message: f.message }).subscribe({
      next: () => {
        this.activeForm.set({ ...f, sending: false, success: true, error: null });
        this.flagSvc.transitionFlag(flag.submissionId, flag.flagId, { status: 'ACTION_REQUIRED' }).subscribe({
          next: () => {
            this.flags.update(list => list.map(item =>
              item.flagId === flag.flagId
                ? { ...item, candidateActionRequired: true, status: 'ACTION_REQUIRED' as FlagStatus }
                : item
            ));
          },
        });
      },
      error: () => {
        const cur = this.activeForm();
        if (cur?.type === 'contact') this.activeForm.set({ ...cur, sending: false, error: 'Failed to send email. Try again.' });
      },
    });
  }

  openResolveForm(flag: FlagListItem) {
    this.closeDropdown();
    this.activeForm.set({ type: 'resolve', flagId: flag.flagId, notes: '', saving: false, error: null });
  }

  updateResolveNotes(value: string) {
    const f = this.activeForm();
    if (f?.type === 'resolve') this.activeForm.set({ ...f, notes: value });
  }

  submitResolve(flag: FlagListItem) {
    const f = this.activeForm();
    if (f?.type !== 'resolve' || !f.notes) return;
    this.activeForm.set({ ...f, saving: true, error: null });

    const resolve$ = flag.status === 'FLAGGED'
      ? this.flagSvc.transitionFlag(flag.submissionId, flag.flagId, { status: 'UNDER_REVIEW' }).pipe(
          switchMap(() => this.flagSvc.transitionFlag(flag.submissionId, flag.flagId, {
            status: 'RESOLVED', resolutionNotes: f.notes,
          }))
        )
      : this.flagSvc.transitionFlag(flag.submissionId, flag.flagId, {
          status: 'RESOLVED', resolutionNotes: f.notes,
        });

    resolve$.subscribe({
      next: () => {
        this.activeForm.set(null);
        this.flags.update(list => list.map(item =>
          item.flagId === flag.flagId ? { ...item, status: 'RESOLVED' as FlagStatus } : item
        ));
      },
      error: () => {
        const cur = this.activeForm();
        if (cur?.type === 'resolve') this.activeForm.set({ ...cur, saving: false, error: 'Resolve failed. Try again.' });
      },
    });
  }

  toggleBlacklist(flag: FlagListItem) {
    this.closeDropdown();
    this.blacklistError.set(null);
    this.candidateSvc.setBlacklist(flag.candidateId, !flag.candidateBlacklisted).subscribe({
      next: () => {
        this.flags.update(list => list.map(item =>
          item.flagId === flag.flagId
            ? { ...item, candidateBlacklisted: !flag.candidateBlacklisted }
            : item
        ));
      },
      error: (err) => {
        const msg = err?.status === 403
          ? 'Only admins can remove a candidate from the blacklist.'
          : 'Blacklist update failed. Try again.';
        this.blacklistError.set({ flagId: flag.flagId, message: msg });
      },
    });
  }

  dismissFlag(flag: FlagListItem) {
    this.dismissingFlagId.set(flag.flagId);
    this.dismissError.set(null);

    const dismiss$ = flag.status === 'FLAGGED'
      ? this.flagSvc.transitionFlag(flag.submissionId, flag.flagId, { status: 'UNDER_REVIEW' }).pipe(
          switchMap(() => this.flagSvc.transitionFlag(flag.submissionId, flag.flagId, {
            status: 'DISMISSED', resolutionNotes: 'Dismissed from flagged list',
          }))
        )
      : this.flagSvc.transitionFlag(flag.submissionId, flag.flagId, {
          status: 'DISMISSED', resolutionNotes: 'Dismissed from flagged list',
        });

    dismiss$.subscribe({
      next: () => {
        this.dismissingFlagId.set(null);
        this.flags.update(list => list.map(item =>
          item.flagId === flag.flagId ? { ...item, status: 'DISMISSED' as FlagStatus } : item
        ));
      },
      error: () => {
        this.dismissingFlagId.set(null);
        this.dismissError.set({ flagId: flag.flagId, message: 'Dismiss failed. Try again.' });
      },
    });
  }

  clearFilters() {
    this.filterReason.set('');
    this.filterAssessmentId.set('');
    this.filterFromDate.set('');
    this.filterToDate.set('');
    this.filterStatus.set('');
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
    return 'status-badge status-' + status.toLowerCase().replace(/_/g, '-');
  }

  statusLabel(status: FlagStatus): string {
    const map: Record<FlagStatus, string> = {
      FLAGGED: 'Flagged',
      UNDER_REVIEW: 'Under Review',
      ACTION_REQUIRED: 'Action Required',
      RESOLVED: 'Resolved',
      DISMISSED: 'Dismissed',
    };
    return map[status] ?? status;
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
