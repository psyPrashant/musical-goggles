import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';
import { CandidateService } from '../../core/candidate/candidate.service';
import { Candidate, CandidateRequest } from '../../core/candidate/candidate.model';
import { ToastService } from '../../core/toast/toast.service';

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
                @if (editingId() === c.id) {
                  <!-- Inline edit mode -->
                  <div class="edit-cell">
                    <input type="text" class="edit-input" [value]="editFirst()" (input)="editFirst.set($any($event.target).value)" placeholder="First name" />
                    <input type="text" class="edit-input" [value]="editLast()" (input)="editLast.set($any($event.target).value)" placeholder="Last name" />
                  </div>
                  <div class="edit-cell">
                    <input type="email" class="edit-input" [value]="editEmail()" (input)="editEmail.set($any($event.target).value)" placeholder="Email" />
                    @if (editError()) {
                      <span class="edit-error">{{ editError() }}</span>
                    }
                  </div>
                  <div class="date-cell">{{ c.createdAt | date:'dd MMM yyyy' }}</div>
                  <div class="actions-cell edit-actions">
                    <button class="action-btn action-save" title="Save" (click)="saveEdit(c.id)" [disabled]="editSaving()">
                      @if (editSaving()) {
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                      } @else {
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      }
                    </button>
                    <button class="action-btn" title="Cancel" (click)="cancelEdit()">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                } @else {
                  <!-- Display mode -->
                  <div class="candidate-cell">
                    <div class="avatar" [style.background]="avatarColor(fullName(c))">{{ initials(fullName(c)) }}</div>
                    <div class="candidate-info">
                      <span class="candidate-name">{{ fullName(c) }}</span>
                    </div>
                  </div>
                  <div class="assessment-cell">{{ c.email }}</div>
                  <div class="date-cell">{{ c.createdAt | date:'dd MMM yyyy' }}</div>
                  <div class="actions-cell">
                    <button class="action-btn" title="Edit" (click)="startEdit(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="action-btn" title="Invite" (click)="openInviteForCandidate(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </button>
                  </div>
                }
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
          } @else if (showDraftConfirm()) {
            <!-- DRAFT assessment confirmation -->
            <div class="modal-body">
              <div class="draft-confirm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p class="draft-confirm-text">
                  <strong>{{ selectedAssessment()?.title }}</strong> is a draft and has not been published.
                  Would you like to publish it now and send the invite?
                </p>
              </div>
              @if (draftPublishError()) {
                <p class="invite-error">{{ draftPublishError() }}</p>
              }
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="cancelDraftConfirm()" [disabled]="inviteSending()">Cancel</button>
              <button class="btn btn-primary" (click)="publishAndSend()" [disabled]="inviteSending()">
                @if (inviteSending()) { Publishing… } @else { Publish & Send }
              </button>
            </div>
          } @else {
            <div class="modal-body">
              @if (knownEmailNotice()) {
                <div class="known-email-notice">{{ knownEmailNotice() }}</div>
              }
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
                    <option [value]="a.id">{{ a.title }}{{ a.status === 'DRAFT' ? ' (Draft)' : '' }}</option>
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
    .btn-ghost:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-1); }
    .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

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

    .candidates-table {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
    }

    .table-header {
      display: grid; grid-template-columns: 2fr 2fr 120px 72px;
      gap: 12px; padding: 10px 16px;
      background: var(--bg-elevated); border-bottom: 1px solid var(--border);
      font-size: 11.5px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em;
    }

    .table-row {
      display: grid; grid-template-columns: 2fr 2fr 120px 72px;
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

    .assessment-cell { font-size: 12.5px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .date-cell { font-size: 12px; color: var(--text-3); }

    .actions-cell { display: flex; justify-content: flex-end; gap: 2px; }

    .edit-actions { gap: 4px; }

    .action-btn {
      background: none; border: none; cursor: pointer; padding: 5px;
      border-radius: 4px; display: flex; align-items: center; color: var(--text-3);
      transition: color 120ms, background 120ms;
    }
    .action-btn:hover:not(:disabled) { color: var(--text-1); background: var(--bg-elevated); }
    .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .action-save:hover:not(:disabled) { color: var(--success) !important; }

    .edit-cell { display: flex; flex-direction: column; gap: 4px; }

    .edit-input {
      padding: 5px 8px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 12.5px; outline: none; width: 100%;
      transition: border-color 150ms; font-family: var(--font);
    }
    .edit-input:focus { border-color: var(--accent); }

    .edit-error { font-size: 11.5px; color: var(--danger); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }

    .invite-success { font-size: 13px; color: var(--text-2); margin: 0; }
    .invite-candidate-info { font-size: 13px; color: var(--text-2); margin: 0; }
    .invite-error { font-size: 13px; color: var(--danger); margin: 0; }
    .link-box { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; }
    .link-text { font-size: 12px; color: var(--accent); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .copy-btn { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer; color: var(--text-2); white-space: nowrap; }
    .copy-btn:hover { color: var(--text-1); }

    .known-email-notice {
      padding: 9px 12px; background: var(--info-subtle); border: 1px solid rgba(59,130,246,.2);
      border-radius: var(--radius-sm); font-size: 12.5px; color: var(--info);
    }

    .draft-confirm {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 4px 0;
    }
    .draft-confirm svg { flex-shrink: 0; margin-top: 2px; }
    .draft-confirm-text { font-size: 13.5px; color: var(--text-1); line-height: 1.55; margin: 0; }

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
    .field-hint { font-size: 12px; color: var(--text-3); }
  `],
})
export class CandidatesComponent implements OnInit {
  private readonly assessmentSvc = inject(AssessmentService);
  private readonly candidateSvc = inject(CandidateService);
  private readonly toastSvc = inject(ToastService);

  // ── List state ──────────────────────────────────────────────────────────────
  readonly candidates = signal<Candidate[]>([]);
  readonly assessments = signal<Assessment[]>([]);
  readonly search = signal('');

  // ── Invite modal state ───────────────────────────────────────────────────────
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
  readonly knownEmailNotice = signal('');

  // ── DRAFT confirmation state ─────────────────────────────────────────────────
  readonly showDraftConfirm = signal(false);
  readonly draftPublishError = signal('');

  // ── Inline edit state ────────────────────────────────────────────────────────
  readonly editingId = signal<string | null>(null);
  readonly editFirst = signal('');
  readonly editLast = signal('');
  readonly editEmail = signal('');
  readonly editError = signal('');
  readonly editSaving = signal(false);

  // ── Computed ─────────────────────────────────────────────────────────────────
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

  // ── Invite modal ─────────────────────────────────────────────────────────────

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
    this.knownEmailNotice.set('');
    this.showDraftConfirm.set(false);
    this.draftPublishError.set('');
  }

  sendInvite() {
    this.inviteError.set('');

    // DRAFT assessment guard — show confirmation before any HTTP call
    if (this.selectedAssessment()?.status === 'DRAFT') {
      this.showDraftConfirm.set(true);
      return;
    }

    this.inviteSending.set(true);
    this._doInviteFlow();
  }

  cancelDraftConfirm() {
    this.showDraftConfirm.set(false);
    this.draftPublishError.set('');
  }

  publishAndSend() {
    const assessmentId = this.inviteAssessment();
    this.inviteSending.set(true);
    this.draftPublishError.set('');

    this.assessmentSvc.publishAssessment(assessmentId).subscribe({
      next: published => {
        // Update assessment status in the local signal
        this.assessments.update(list =>
          list.map(a => a.id === published.id ? { ...a, status: published.status } : a)
        );
        this.showDraftConfirm.set(false);
        this._doInviteFlow();
      },
      error: () => {
        this.inviteSending.set(false);
        this.draftPublishError.set('Failed to publish assessment. Please try again.');
      },
    });
  }

  private _doInviteFlow() {
    const doInvite = (candidateId: string) => {
      const plainPassword = this.selectedAssessment()?.passwordProtected ? (this.invitePassword() || null) : null;
      this.candidateSvc.sendInvitation({ candidateId, assessmentId: this.inviteAssessment(), plainPassword })
        .subscribe({
          next: res => {
            this.inviteSending.set(false);
            this.inviteLink.set(res.invitationLink);
            this.candidateSvc.listCandidates().subscribe({ next: list => this.candidates.set(list) });
          },
          error: err => {
            this.inviteSending.set(false);
            const isDuplicate = err.status === 409 && (
              err.error?.detail === 'DUPLICATE_INVITE' ||
              err.error?.message === 'DUPLICATE_INVITE' ||
              err.error === 'DUPLICATE_INVITE'
            );
            if (isDuplicate) {
              this.toastSvc.show('This candidate already has a pending invitation for this assessment.', 'warning');
            } else {
              this.inviteError.set('Failed to send invitation. Please try again.');
            }
          },
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
          if (err.status === 409) {
            // Known email — look up existing candidate and proceed
            this.candidateSvc.getCandidateByEmail(this.inviteEmail()).subscribe({
              next: found => {
                this.inviteCandidate.set(found);
                this.knownEmailNotice.set(
                  `${found.firstName} ${found.lastName} is already registered. Inviting them to the selected assessment.`
                );
                doInvite(found.id);
              },
              error: () => {
                this.inviteSending.set(false);
                this.inviteError.set('A candidate with this email already exists.');
              },
            });
          } else {
            this.inviteSending.set(false);
            this.inviteError.set('Failed to create candidate. Please try again.');
          }
        },
      });
    }
  }

  copyLink() {
    navigator.clipboard.writeText(this.inviteLink()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  // ── Inline edit ───────────────────────────────────────────────────────────────

  startEdit(c: Candidate) {
    this.editingId.set(c.id);
    this.editFirst.set(c.firstName);
    this.editLast.set(c.lastName);
    this.editEmail.set(c.email);
    this.editError.set('');
    this.editSaving.set(false);
  }

  saveEdit(id: string) {
    this.editError.set('');
    this.editSaving.set(true);
    const req: CandidateRequest = {
      firstName: this.editFirst(),
      lastName: this.editLast(),
      email: this.editEmail(),
    };
    this.candidateSvc.updateCandidate(id, req).subscribe({
      next: updated => {
        this.candidates.update(list => list.map(c => c.id === id ? updated : c));
        this.editingId.set(null);
        this.editSaving.set(false);
      },
      error: err => {
        this.editSaving.set(false);
        this.editError.set(
          err.status === 409
            ? 'This email is already used by another candidate.'
            : 'Failed to save changes. Please try again.'
        );
      },
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editError.set('');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

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
