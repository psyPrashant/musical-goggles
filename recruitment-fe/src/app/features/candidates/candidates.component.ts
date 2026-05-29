import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';
import { CandidateService } from '../../core/candidate/candidate.service';
import { Candidate } from '../../core/candidate/candidate.model';

@Component({
  selector: 'app-candidates',
  imports: [DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Candidates</h1>
          <span class="page-sub">{{ filtered().length }} candidates</span>
        </div>
        <button class="btn btn-primary" (click)="showInvite.set(true)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Invite Candidate
        </button>
      </div>

      <div class="content">
        <div class="filter-row">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input class="search-input" [value]="search()" (input)="search.set($any($event.target).value)" placeholder="Search by name or email…"/>
          </div>
        </div>

        @if (filtered().length === 0) {
          <div class="empty-state">No candidates match your filters.</div>
        } @else {
          <div class="candidates-table">
            <div class="table-header">
              <span>Candidate</span>
              <span>Email</span>
              <span>Added</span>
              <span></span>
            </div>
            @for (c of filtered(); track c.id) {
              <div class="table-row">
                <div class="candidate-cell">
                  <div class="avatar" [style.background]="avatarColor(fullName(c))">{{ initials(fullName(c)) }}</div>
                  <div class="candidate-info">
                    <span class="candidate-name">{{ fullName(c) }}</span>
                  </div>
                </div>
                <div class="assessment-cell">{{ c.email }}</div>
                <div class="date-cell">{{ c.createdAt | date:'dd MMM yyyy' }}</div>
                <div class="actions-cell">
                  <button class="action-btn" title="Invite" (click)="openInviteForCandidate(c)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (showInvite()) {
      <div class="overlay" (click)="closeInvite()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">{{ inviteLink() ? 'Invitation Sent' : 'Invite Candidate' }}</span>
            <button class="modal-close" (click)="closeInvite()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          @if (inviteLink()) {
            <div class="modal-body">
              <p class="invite-success">Invitation sent! Share this link with the candidate:</p>
              <div class="link-box">
                <span class="link-text">{{ inviteLink() }}</span>
                <button class="copy-btn" (click)="copyLink()">{{ copied() ? 'Copied!' : 'Copy' }}</button>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" (click)="closeInvite()">Done</button>
            </div>
          } @else {
            <div class="modal-body">
              @if (!inviteCandidate()) {
                <div class="field">
                  <label class="field-label">First Name <span class="required">*</span></label>
                  <input type="text" [value]="inviteFirstName()" (input)="inviteFirstName.set($any($event.target).value)"
                         class="field-input" placeholder="Jane" />
                </div>
                <div class="field">
                  <label class="field-label">Last Name <span class="required">*</span></label>
                  <input type="text" [value]="inviteLastName()" (input)="inviteLastName.set($any($event.target).value)"
                         class="field-input" placeholder="Smith" />
                </div>
                <div class="field">
                  <label class="field-label">Email <span class="required">*</span></label>
                  <input type="email" [value]="inviteEmail()" (input)="inviteEmail.set($any($event.target).value)"
                         class="field-input" placeholder="candidate@example.com" />
                </div>
              } @else {
                <p class="invite-candidate-info">Inviting <strong>{{ fullName(inviteCandidate()!) }}</strong> ({{ inviteCandidate()!.email }})</p>
              }
              <div class="field">
                <label class="field-label">Assessment <span class="required">*</span></label>
                <select class="field-select" [value]="inviteAssessment()" (change)="inviteAssessment.set($any($event.target).value)">
                  <option value="">Select an assessment…</option>
                  @for (a of assessments(); track a.id) {
                    <option [value]="a.id">{{ a.title }}</option>
                  }
                </select>
              </div>
              @if (selectedAssessment()?.passwordProtected) {
                <div class="field">
                  <label class="field-label">Assessment Password</label>
                  <input type="password" class="field-input" [value]="invitePassword()"
                         (input)="invitePassword.set($any($event.target).value)"
                         placeholder="Enter password to include in email…" autocomplete="off"/>
                  <span class="field-hint">This will be sent to the candidate in the invitation email</span>
                </div>
              }
              @if (inviteError()) {
                <p class="invite-error">{{ inviteError() }}</p>
              }
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="closeInvite()">Cancel</button>
              <button class="btn btn-primary" (click)="sendInvite()" [disabled]="inviteSending() || !inviteAssessment() || (!inviteCandidate() && (!inviteEmail() || !inviteFirstName() || !inviteLastName()))">
                @if (inviteSending()) { Sending… } @else {
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Invite
                }
              </button>
            </div>
          }
        </div>
      </div>
    }
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
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: var(--text-2); }
    .btn-ghost:hover { background: var(--bg-hover); color: var(--text-1); }

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .filter-row {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 18px;
    }

    .search-wrap { position: relative; display: flex; align-items: center; }

    .search-icon { position: absolute; left: 10px; color: var(--text-3); pointer-events: none; }

    .search-input {
      padding: 7px 10px 7px 32px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13px; outline: none; width: 260px; transition: border-color 150ms;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-input::placeholder { color: var(--text-3); }

    .status-filters { display: flex; gap: 5px; }

    .filter-chip {
      padding: 5px 12px; border-radius: 999px; cursor: pointer;
      font-family: var(--font); font-size: 12.5px; font-weight: 400;
      background: transparent; color: var(--text-2); border: 1px solid var(--border);
      transition: all 120ms;
    }
    .filter-chip:hover { background: var(--bg-hover); color: var(--text-1); }
    .filter-chip.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); font-weight: 600; }

    .candidates-table {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
    }

    .table-header {
      display: grid; grid-template-columns: 2fr 2fr 120px 40px;
      gap: 12px; padding: 10px 16px;
      background: var(--bg-elevated); border-bottom: 1px solid var(--border);
      font-size: 11.5px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em;
    }

    .table-row {
      display: grid; grid-template-columns: 2fr 2fr 120px 40px;
      gap: 12px; padding: 12px 16px; align-items: center;
      border-bottom: 1px solid var(--border); transition: background 120ms;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: var(--bg-hover); }

    .candidate-cell { display: flex; align-items: center; gap: 10px; }

    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .candidate-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }

    .candidate-name { font-size: 13px; font-weight: 600; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .candidate-email { font-size: 11.5px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .assessment-cell { font-size: 12.5px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .status-badge {
      display: inline-flex; padding: 2px 9px; border-radius: 999px;
      font-size: 11.5px; font-weight: 500; white-space: nowrap;
    }
    .status-invited { background: var(--info-subtle); color: var(--info); }
    .status-in-progress { background: var(--warning-subtle); color: var(--warning); }
    .status-completed { background: var(--success-subtle); color: var(--success); }
    .status-expired { background: rgba(148,163,184,.12); color: var(--text-2); }

    .score-pill {
      display: inline-flex; padding: 2px 9px; border-radius: 999px;
      font-size: 12px; font-weight: 600;
    }
    .score-high { background: var(--success-subtle); color: var(--success); }
    .score-mid { background: var(--warning-subtle); color: var(--warning); }
    .score-low { background: var(--danger-subtle); color: var(--danger); }

    .score-na { font-size: 12px; color: var(--text-3); }

    .date-cell { font-size: 12px; color: var(--text-3); }

    .actions-cell { display: flex; justify-content: flex-end; }

    .action-btn {
      background: none; border: none; cursor: pointer; padding: 5px;
      border-radius: 4px; display: flex; align-items: center; color: var(--text-3);
      transition: color 120ms, background 120ms;
    }
    .action-btn:hover { color: var(--text-1); background: var(--bg-elevated); }

    .mock-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px; margin-bottom: 16px;
      background: var(--warning-subtle); border: 1px solid rgba(245,158,11,.25);
      border-radius: var(--radius-sm); color: var(--warning); font-size: 12.5px;
    }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }

    .invite-success { font-size: 13px; color: var(--text-2); margin: 0; }
    .invite-candidate-info { font-size: 13px; color: var(--text-2); margin: 0; }
    .invite-error { font-size: 13px; color: var(--danger); margin: 0; }
    .link-box { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; }
    .link-text { font-size: 12px; color: var(--accent); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .copy-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer; color: var(--text-2); white-space: nowrap; }
    .copy-btn:hover { color: var(--text-1); }

    /* Invite modal */
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 24px;
    }

    .modal {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); width: 100%; max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--border);
    }

    .modal-title { font-size: 14px; font-weight: 600; color: var(--text-1); }

    .modal-close {
      background: none; border: none; cursor: pointer; padding: 4px;
      border-radius: 4px; color: var(--text-3); display: flex; align-items: center;
      transition: color 120ms, background 120ms;
    }
    .modal-close:hover { color: var(--text-1); background: var(--bg-hover); }

    .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

    .modal-footer {
      display: flex; gap: 8px; justify-content: flex-end;
      padding: 14px 20px; border-top: 1px solid var(--border);
    }

    .field { display: flex; flex-direction: column; gap: 6px; }

    .field-label { font-size: 13px; font-weight: 500; color: var(--text-2); }

    .required { color: var(--danger); }

    .field-input, .field-select, .field-textarea {
      padding: 8px 12px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13.5px; outline: none; transition: border-color 150ms;
      font-family: var(--font);
    }
    .field-input:focus, .field-select:focus, .field-textarea:focus { border-color: var(--accent); }
    .field-input::placeholder, .field-textarea::placeholder { color: var(--text-3); }
    .field-select { cursor: pointer; }
    .field-textarea { resize: vertical; line-height: 1.6; }
  `],
})
export class CandidatesComponent implements OnInit {
  private readonly assessmentSvc = inject(AssessmentService);
  private readonly candidateSvc = inject(CandidateService);

  readonly candidates = signal<Candidate[]>([]);
  readonly assessments = signal<Assessment[]>([]);
  readonly search = signal('');
  readonly showInvite = signal(false);
  readonly inviteCandidate = signal<Candidate | null>(null);
  readonly inviteFirstName = signal('');
  readonly inviteLastName = signal('');
  readonly inviteEmail = signal('');
  readonly inviteAssessment = signal('');
  readonly invitePassword = signal('');
  readonly inviteSending = signal(false);
  readonly inviteError = signal('');
  readonly inviteLink = signal('');
  readonly copied = signal(false);

  readonly selectedAssessment = computed(() =>
    this.assessments().find(a => a.id === this.inviteAssessment()) ?? null,
  );

  readonly filtered = computed(() => {
    const s = this.search().toLowerCase();
    return this.candidates().filter(c =>
      !s || this.fullName(c).toLowerCase().includes(s) || c.email.toLowerCase().includes(s)
    );
  });

  ngOnInit() {
    this.assessmentSvc.listAssessments().subscribe({ next: list => this.assessments.set(list) });
    this.candidateSvc.listCandidates().subscribe({ next: list => this.candidates.set(list) });
  }

  openInviteForCandidate(c: Candidate) {
    this.inviteCandidate.set(c);
    this.showInvite.set(true);
  }

  closeInvite() {
    this.showInvite.set(false);
    this.inviteCandidate.set(null);
    this.inviteFirstName.set('');
    this.inviteLastName.set('');
    this.inviteEmail.set('');
    this.inviteAssessment.set('');
    this.invitePassword.set('');
    this.inviteError.set('');
    this.inviteLink.set('');
    this.copied.set(false);
  }

  sendInvite() {
    this.inviteError.set('');
    this.inviteSending.set(true);

    const doInvite = (candidateId: string) => {
      const plainPassword = this.selectedAssessment()?.passwordProtected ? (this.invitePassword() || null) : null;
      this.candidateSvc.sendInvitation({ candidateId, assessmentId: this.inviteAssessment(), plainPassword })
        .subscribe({
          next: res => {
            this.inviteSending.set(false);
            this.inviteLink.set(res.invitationLink);
            this.candidateSvc.listCandidates().subscribe({ next: list => this.candidates.set(list) });
          },
          error: () => {
            this.inviteSending.set(false);
            this.inviteError.set('Failed to send invitation. Please try again.');
          }
        });
    };

    const existing = this.inviteCandidate();
    if (existing) {
      doInvite(existing.id);
    } else {
      this.candidateSvc.createCandidate({
        firstName: this.inviteFirstName(),
        lastName: this.inviteLastName(),
        email: this.inviteEmail(),
      }).subscribe({
        next: candidate => doInvite(candidate.id),
        error: err => {
          this.inviteSending.set(false);
          this.inviteError.set(err.status === 409
            ? 'A candidate with this email already exists.'
            : 'Failed to create candidate. Please try again.');
        }
      });
    }
  }

  copyLink() {
    navigator.clipboard.writeText(this.inviteLink()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  fullName(c: Candidate): string {
    return `${c.firstName} ${c.lastName}`;
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  }
}
