import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';
import { CandidateService } from '../../core/candidate/candidate.service';
import { Candidate, CandidateHistoryItem, CandidateRequest, HistoryStatus } from '../../core/candidate/candidate.model';
import { ToastService } from '../../core/toast/toast.service';
import { FlagService } from '../../core/flag/flag.service';
import { FlagListItem } from '../../core/flag/flag.model';

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
                    <button class="action-btn" title="Assessment history" (click)="openAssessmentHistory(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                      </svg>
                    </button>
                    <button class="action-btn" title="View flag history" (click)="openFlagHistory(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                        <line x1="4" y1="22" x2="4" y2="15"/>
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

    @if (showAssessmentHistory()) {
      <div class="overlay" (click)="showAssessmentHistory.set(false)">
        <div class="modal modal-wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">Assessment History — {{ fullName(historyCandidate()!) }}</span>
            <button class="modal-close" (click)="showAssessmentHistory.set(false)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <!-- Filter + Sort controls -->
            <div class="history-controls">
              <div class="history-filters">
                @for (f of historyFilters; track f.value) {
                  <button class="filter-chip" [class.active]="historyStatusFilter() === f.value"
                          (click)="historyStatusFilter.set(f.value)">{{ f.label }}</button>
                }
              </div>
              <button class="btn-ghost-sm" (click)="historySortAsc.set(!historySortAsc())">
                {{ historySortAsc() ? '↑ Oldest first' : '↓ Newest first' }}
              </button>
            </div>

            @if (historyLoading()) {
              <p class="invite-success">Loading…</p>
            } @else if (historyFiltered().length === 0) {
              <p class="invite-success">No assessment history recorded.</p>
            } @else {
              <div class="history-table">
                <div class="history-table-header">
                  <span>Assessment</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Score</span>
                  <span>Role</span>
                </div>
                @for (entry of historyFiltered(); track entry.assessmentId + (entry.submissionId ?? '')) {
                  <div class="history-table-row">
                    <div class="history-name">
                      @if (entry.submissionId && (entry.status === 'SUBMITTED' || entry.status === 'AUTO_SUBMITTED')) {
                        <a class="history-link" [attr.href]="'/results?submission=' + entry.submissionId">
                          {{ entry.assessmentName }}
                        </a>
                      } @else {
                        {{ entry.assessmentName }}
                      }
                    </div>
                    <div class="history-date">
                      {{ formatFlagDate(entry.status === 'SUBMITTED' || entry.status === 'AUTO_SUBMITTED' ? (entry.submittedAt ?? entry.invitedAt) : entry.invitedAt) }}
                    </div>
                    <div>
                      <span class="history-status-badge" [class]="historyStatusClass(entry.status)">
                        {{ historyStatusLabel(entry.status) }}
                      </span>
                    </div>
                    <div class="history-score">
                      @if (entry.status === 'SUBMITTED' || entry.status === 'AUTO_SUBMITTED') {
                        @if (entry.markingStatus === 'FULLY_MARKED') {
                          {{ entry.totalScore }} pts
                        } @else {
                          <span class="score-pending">Pending review</span>
                        }
                      } @else {
                        —
                      }
                    </div>
                    <div class="history-role">{{ entry.linkedRole ?? 'No linked role' }}</div>
                  </div>
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="showAssessmentHistory.set(false)">Close</button>
          </div>
        </div>
      </div>
    }

    @if (showFlagHistory()) {
      <div class="overlay" (click)="showFlagHistory.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">Flag History — {{ fullName(flagHistoryCandidate()!) }}</span>
            <button class="modal-close" (click)="showFlagHistory.set(false)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal-body">
            @if (flagHistoryLoading()) {
              <p class="invite-success">Loading…</p>
            } @else if (candidateFlags().length === 0) {
              <p class="invite-success">No flags recorded.</p>
            } @else {
              <div class="flag-history-list">
                @for (f of candidateFlags(); track f.flagId) {
                  <div class="flag-history-row">
                    <div class="flag-history-main">
                      <span class="flag-history-assessment">{{ f.assessmentName }}</span>
                      <span class="flag-status-badge status-{{ f.status.toLowerCase().replace('_','-') }}">{{ f.status }}</span>
                    </div>
                    <div class="flag-history-meta">{{ reasonLabel(f.reason) }} · {{ formatFlagDate(f.createdAt) }}</div>
                  </div>
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="showFlagHistory.set(false)">Close</button>
          </div>
        </div>
      </div>
    }

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

    .flag-history-list { display: flex; flex-direction: column; gap: 8px; }
    .flag-history-row { padding: 10px 12px; background: var(--bg-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border); }
    .flag-history-main { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .flag-history-assessment { font-size: 13px; font-weight: 500; color: var(--text-1); flex: 1; }
    .flag-history-meta { font-size: 11.5px; color: var(--text-3); }
    .flag-status-badge { display: inline-flex; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 500; }
    .status-flagged { background: var(--danger-subtle); color: var(--danger); }
    .status-under-review { background: var(--warning-subtle); color: var(--warning); }
    .status-resolved { background: var(--success-subtle); color: var(--success); }
    .status-dismissed { background: rgba(148,163,184,.12); color: var(--text-2); }

    .modal-wide { max-width: 720px; }

    .history-controls { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
    .history-filters { display: flex; gap: 5px; flex-wrap: wrap; }
    .filter-chip {
      padding: 4px 11px; border-radius: 999px; cursor: pointer;
      font-family: var(--font); font-size: 12px; font-weight: 400;
      background: transparent; color: var(--text-2); border: 1px solid var(--border); transition: all 120ms;
    }
    .filter-chip:hover { background: var(--bg-hover); color: var(--text-1); }
    .filter-chip.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); font-weight: 600; }
    .btn-ghost-sm {
      padding: 4px 10px; background: transparent; border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-2); font-size: 12px;
      cursor: pointer; transition: all 120ms; font-family: var(--font);
    }
    .btn-ghost-sm:hover { background: var(--bg-hover); color: var(--text-1); }

    .history-table { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
    .history-table-header {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 10px; padding: 8px 12px;
      background: var(--bg-elevated); border-bottom: 1px solid var(--border);
      font-size: 11px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em;
    }
    .history-table-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 10px; padding: 10px 12px; align-items: center;
      border-bottom: 1px solid var(--border); transition: background 120ms;
    }
    .history-table-row:last-child { border-bottom: none; }
    .history-table-row:hover { background: var(--bg-hover); }
    .history-name { font-size: 13px; font-weight: 500; color: var(--text-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .history-link { color: var(--accent); text-decoration: none; }
    .history-link:hover { text-decoration: underline; }
    .history-date { font-size: 12px; color: var(--text-3); }
    .history-score { font-size: 12.5px; font-weight: 600; color: var(--text-1); }
    .score-pending { font-size: 11.5px; color: var(--text-3); font-weight: 400; font-style: italic; }
    .history-role { font-size: 11.5px; color: var(--text-3); }
    .history-status-badge { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; }
    .h-status-submitted { background: var(--success-subtle); color: var(--success); }
    .h-status-pending { background: var(--info-subtle); color: var(--info); }
    .h-status-expired { background: rgba(148,163,184,.12); color: var(--text-2); }
    .h-status-in-progress { background: var(--warning-subtle); color: var(--warning); }

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
  private readonly flagSvc = inject(FlagService);

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

  // ── Assessment history state ─────────────────────────────────────────────────
  readonly showAssessmentHistory = signal(false);
  readonly historyCandidate = signal<Candidate | null>(null);
  readonly historyItems = signal<CandidateHistoryItem[]>([]);
  readonly historyLoading = signal(false);
  readonly historyStatusFilter = signal<HistoryStatus | ''>('');
  readonly historySortAsc = signal(false);

  readonly historyFilters = [
    { value: '' as const, label: 'All' },
    { value: 'SUBMITTED' as HistoryStatus, label: 'Completed' },
    { value: 'PENDING' as HistoryStatus, label: 'Pending' },
    { value: 'EXPIRED' as HistoryStatus, label: 'Expired' },
  ];

  readonly historyFiltered = computed(() => {
    const filter = this.historyStatusFilter();
    let items = this.historyItems();
    if (filter === 'SUBMITTED') {
      items = items.filter(i => i.status === 'SUBMITTED' || i.status === 'AUTO_SUBMITTED');
    } else if (filter) {
      items = items.filter(i => i.status === filter);
    }
    return this.historySortAsc()
      ? [...items].sort((a, b) => a.invitedAt.localeCompare(b.invitedAt))
      : [...items].sort((a, b) => b.invitedAt.localeCompare(a.invitedAt));
  });

  // ── Flag history state ───────────────────────────────────────────────────────
  readonly showFlagHistory = signal(false);
  readonly flagHistoryCandidate = signal<Candidate | null>(null);
  readonly candidateFlags = signal<FlagListItem[]>([]);
  readonly flagHistoryLoading = signal(false);

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

  // ── Assessment history ────────────────────────────────────────────────────────

  openAssessmentHistory(c: Candidate) {
    this.historyCandidate.set(c);
    this.showAssessmentHistory.set(true);
    this.historyItems.set([]);
    this.historyStatusFilter.set('');
    this.historySortAsc.set(false);
    this.historyLoading.set(true);
    this.candidateSvc.getHistory(c.id).subscribe({
      next: items => { this.historyItems.set(items); this.historyLoading.set(false); },
      error: () => this.historyLoading.set(false),
    });
  }

  historyStatusLabel(status: HistoryStatus): string {
    const map: Record<HistoryStatus, string> = {
      PENDING: 'Pending', EXPIRED: 'Expired',
      IN_PROGRESS: 'In Progress', SUBMITTED: 'Submitted', AUTO_SUBMITTED: 'Auto-submitted',
    };
    return map[status] ?? status;
  }

  historyStatusClass(status: HistoryStatus): string {
    if (status === 'SUBMITTED' || status === 'AUTO_SUBMITTED') return 'history-status-badge h-status-submitted';
    if (status === 'PENDING') return 'history-status-badge h-status-pending';
    if (status === 'EXPIRED') return 'history-status-badge h-status-expired';
    return 'history-status-badge h-status-in-progress';
  }

  // ── Flag history ──────────────────────────────────────────────────────────────

  openFlagHistory(c: Candidate) {
    this.flagHistoryCandidate.set(c);
    this.showFlagHistory.set(true);
    this.candidateFlags.set([]);
    this.flagHistoryLoading.set(true);
    this.flagSvc.getCandidateFlags(c.id).subscribe({
      next: flags => { this.candidateFlags.set(flags); this.flagHistoryLoading.set(false); },
      error: () => this.flagHistoryLoading.set(false),
    });
  }

  reasonLabel(reason: string): string {
    const map: Record<string, string> = {
      COPIED_ANSWERS: 'Copied Answers', TIMING_ANOMALY: 'Timing Anomaly',
      AI_GENERATED_CONTENT: 'AI-Generated', SUSPICIOUS_BEHAVIOUR: 'Suspicious', OTHER: 'Other',
    };
    return map[reason] ?? reason;
  }

  formatFlagDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
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
