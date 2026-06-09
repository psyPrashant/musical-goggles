import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkingService } from '../../core/marking/marking.service';
import { ResultQuestion, ResultSummary, SubmissionSummary } from '../../core/marking/marking.model';
import { FlagService } from '../../core/flag/flag.service';
import { FlagAuditEntry, FlagListItem, FlagReason, FlagResponse, FlagStatus } from '../../core/flag/flag.model';
import { ReminderService } from '../../core/reminder/reminder.service';
import { ReminderSendLogDto } from '../../core/reminder/reminder.model';

@Component({
  selector: 'app-results',
  imports: [],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Results & Evaluation</h1>
          <span class="page-sub">{{ filteredSubmissions().length }} submissions</span>
        </div>
        <div class="header-filters">
          <select class="assessment-select" [value]="assessmentFilter()" (change)="assessmentFilter.set($any($event.target).value)">
            <option value="">All Assessments</option>
            @for (a of availableAssessments(); track a.assessmentId) {
              <option [value]="a.assessmentId">{{ a.assessmentTitle }}</option>
            }
          </select>
          @for (f of statusFilters; track f.value) {
            <button class="filter-chip" [class.active]="statusFilter() === f.value" (click)="statusFilter.set(f.value)">{{ f.label }}</button>
          }
        </div>
      </div>

      <div class="split-layout">
        <!-- Left panel: submission list -->
        <div class="submissions-panel">
          @if (loadingList()) {
            <div class="empty-panel">Loading…</div>
          } @else if (filteredSubmissions().length === 0) {
            <div class="empty-panel">No submissions.</div>
          } @else {
            @for (s of filteredSubmissions(); track s.submissionId) {
              <div class="submission-item"
                   [class.active]="selectedSummary()?.invitationId === s.invitationId"
                   (click)="selectSubmission(s)">
                <div class="sub-avatar" [style.background]="avatarColor(s.candidateName)">{{ initials(s.candidateName) }}</div>
                <div class="sub-info">
                  <div class="sub-name-row">
                    <span class="sub-name">{{ s.candidateName }}</span>
                    @if (s.candidateBlacklisted) {
                      <span class="sub-bl-symbol" title="Blacklisted">⊘</span>
                    }
                  </div>
                  <div class="sub-tags">
                    <span class="sub-status" [class]="statusClass(s)">{{ statusLabel(s) }}</span>
                    @if ((s.status === 'SUBMITTED' || s.status === 'AUTO_SUBMITTED') && s.markedCount < s.totalAnswers) {
                      <span class="pending-badge">⏳ Pending</span>
                    }
                    @if (s.flagStatus === 'FLAGGED' || s.flagStatus === 'UNDER_REVIEW' || s.flagStatus === 'ACTION_REQUIRED') {
                      <span class="flag-badge">⚑ {{ s.flagStatus === 'ACTION_REQUIRED' ? 'Action Required' : 'Flagged' }}</span>
                    }
                  </div>
                  <span class="sub-date">{{ formatDate(s.submittedAt) }}</span>
                  <span class="sub-progress">{{ s.markedCount }}/{{ s.totalAnswers }} marked</span>
                  <span class="sub-score">{{ scorePercent(s) }}</span>
                </div>
              </div>
            }
          }
        </div>

        <!-- Right panel: result detail -->
        <div class="detail-panel">
          @if (!result()) {
            @if (loadingResult()) {
              <div class="no-selection">Loading result…</div>
            } @else if (selectedSummary()?.status === 'NOT_STARTED') {
              <!-- Invited but hasn't started yet -->
              <div class="detail-scroll">
                <div class="detail-header">
                  <div class="detail-avatar" [style.background]="avatarColor(selectedSummary()!.candidateName)">{{ initials(selectedSummary()!.candidateName) }}</div>
                  <div class="detail-candidate-info">
                    <span class="detail-name">{{ selectedSummary()!.candidateName }}</span>
                    <span class="detail-assessment" style="margin-top:4px">
                      <span class="sub-status status-not-started">Not Started</span>
                    </span>
                    <span class="detail-submitted">Invited — hasn't opened the assessment yet</span>
                  </div>
                </div>
                <!-- Reminder section for not-started candidates -->
                <div class="reminder-section">
                  @if (!showReminderConfirm()) {
                    <button class="btn-reminder" (click)="showReminderConfirm.set(true)" [disabled]="reminderSending()">✉ Send Reminder</button>
                  } @else {
                    <div class="reminder-confirm">
                      <span class="reminder-confirm-text">Send a reminder email to this candidate?</span>
                      <button class="save-btn" (click)="sendReminder()" [disabled]="reminderSending()">{{ reminderSending() ? 'Sending…' : 'Confirm' }}</button>
                      <button class="save-btn secondary" (click)="showReminderConfirm.set(false)">Cancel</button>
                    </div>
                  }
                  @if (reminderSuccess()) {
                    <span class="reminder-toast">✓ Reminder sent</span>
                  }
                </div>
                <!-- Reminder history -->
                <div class="audit-section">
                  <div class="audit-title">Reminder History</div>
                  @if (reminderHistory().length === 0) {
                    <div class="audit-empty">No reminders sent yet</div>
                  } @else {
                    @for (r of reminderHistory(); track r.id) {
                      <div class="audit-entry">
                        <span class="audit-action">
                          <span class="reminder-type-badge" [class.type-auto]="r.sendType === 'AUTOMATED'">{{ r.sendType === 'AUTOMATED' ? 'Automated' : 'Manual' }}</span>
                          {{ r.sentBy ? 'by recruiter' : 'by system' }}
                        </span>
                        <span class="audit-meta">{{ formatDate(r.sentAt) }}</span>
                      </div>
                    }
                  }
                </div>
              </div>
            } @else {
              <div class="no-selection">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                <span>Select a submission to review</span>
              </div>
            }
          } @else {
            <div class="detail-scroll">
              <!-- Header -->
              <div class="detail-header">
                <div class="detail-avatar" [style.background]="avatarColor(result()!.candidateName)">{{ initials(result()!.candidateName) }}</div>
                <div class="detail-candidate-info">
                  <div class="detail-name-row">
                    <span class="detail-name">{{ result()!.candidateName }}</span>
                    @if (selectedSummary()?.candidateBlacklisted) {
                      <span class="detail-bl-tag">Blacklisted</span>
                    }
                  </div>
                  <span class="detail-assessment">{{ result()!.assessmentTitle }}</span>
                  <span class="detail-submitted">Submitted: {{ formatDate(result()!.submittedAt) }}</span>
                </div>
                <div class="detail-score-block">
                  <div class="total-score">{{ result()!.totalScore }}/{{ result()!.maxScore }}</div>
                  <div class="total-max">pts</div>
                  <span class="marking-badge" [class.badge-done]="result()!.markingStatus === 'FULLY_MARKED'" [class.badge-pending]="result()!.markingStatus === 'PENDING_REVIEW'">
                    {{ result()!.markingStatus === 'FULLY_MARKED' ? '✓ Fully Marked' : '⏳ Pending Review' }}
                  </span>
                  <div class="answered-stat">{{ result()!.answeredCount }}/{{ totalQuestionCount() }} answered</div>
                  @if (activeFlag()) {
                    <span class="flag-badge-detail">⚑ {{ activeFlag()!.status === 'FLAGGED' ? 'Flagged' : activeFlag()!.status === 'ACTION_REQUIRED' ? 'Action Required' : 'Under Review' }}</span>
                  }
                </div>
              </div>

              <!-- Flag controls -->
              <div class="flag-section">
                @if (!activeFlag()) {
                  @if (!showFlagForm()) {
                    <button class="btn-flag" (click)="showFlagForm.set(true)">⚑ Flag Submission</button>
                  } @else {
                    <div class="flag-form">
                      <select class="field-select-sm" [value]="flagReason()" (change)="flagReason.set($any($event.target).value)">
                        <option value="">Select reason…</option>
                        <option value="COPIED_ANSWERS">Copied Answers</option>
                        <option value="TIMING_ANOMALY">Timing Anomaly</option>
                        <option value="AI_GENERATED_CONTENT">AI-Generated Content</option>
                        <option value="SUSPICIOUS_BEHAVIOUR">Suspicious Behaviour</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <button class="save-btn" (click)="submitFlag()" [disabled]="!flagReason() || flagSaving()">Submit Flag</button>
                      <button class="save-btn secondary" (click)="showFlagForm.set(false)">Cancel</button>
                    </div>
                  }
                } @else {
                  <div class="flag-transition">
                    @if (activeFlag()!.status === 'FLAGGED') {
                      <button class="btn-flag-action" (click)="transitionFlag('UNDER_REVIEW', null)">Mark Under Review</button>
                    }
                    @if (activeFlag()!.status === 'UNDER_REVIEW') {
                      @if (!showResolveForm()) {
                        <button class="btn-flag-action resolve" (click)="showResolveForm.set('RESOLVED')">Resolve</button>
                        <button class="btn-flag-action dismiss" (click)="showResolveForm.set('DISMISSED')">Dismiss</button>
                      } @else {
                        <div class="flag-form">
                          <input type="text" class="field-input-sm" [value]="resolveNotes()"
                                 (input)="resolveNotes.set($any($event.target).value)"
                                 placeholder="Resolution notes (required)…" />
                          <button class="save-btn" (click)="transitionFlag(showResolveForm()!, resolveNotes())"
                                  [disabled]="!resolveNotes().trim() || flagSaving()">
                            Confirm {{ showResolveForm() }}
                          </button>
                          <button class="save-btn secondary" (click)="showResolveForm.set(null)">Cancel</button>
                        </div>
                      }
                    }
                  </div>
                }
              </div>

              <!-- Flag audit trail -->
              @if (auditTrail().length > 0) {
                <div class="audit-section">
                  <div class="audit-title">Flag History</div>
                  @for (entry of auditTrail(); track entry.id) {
                    <div class="audit-entry">
                      <span class="audit-action">{{ entry.action === 'CREATED' ? 'Flagged' : entry.fromStatus + ' → ' + entry.toStatus }}</span>
                      <span class="audit-meta">by {{ entry.actorUsername }} · {{ formatDate(entry.occurredAt) }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Reminder section -->
              @if (selectedSummary()!.status !== 'SUBMITTED' && selectedSummary()!.status !== 'AUTO_SUBMITTED') {
                <div class="reminder-section">
                  @if (!showReminderConfirm()) {
                    <button class="btn-reminder" (click)="showReminderConfirm.set(true)" [disabled]="reminderSending()">
                      ✉ Send Reminder
                    </button>
                  } @else {
                    <div class="reminder-confirm">
                      <span class="reminder-confirm-text">Send a reminder email to this candidate?</span>
                      <button class="save-btn" (click)="sendReminder()" [disabled]="reminderSending()">
                        {{ reminderSending() ? 'Sending…' : 'Confirm' }}
                      </button>
                      <button class="save-btn secondary" (click)="showReminderConfirm.set(false)">Cancel</button>
                    </div>
                  }
                  @if (reminderSuccess()) {
                    <span class="reminder-toast">✓ Reminder sent</span>
                  }
                </div>
              }

              <!-- Reminder history -->
              <div class="audit-section">
                <div class="audit-title">Reminder History</div>
                @if (reminderHistory().length === 0) {
                  <div class="audit-empty">No reminders sent yet</div>
                } @else {
                  @for (r of reminderHistory(); track r.id) {
                    <div class="audit-entry">
                      <span class="audit-action">
                        <span class="reminder-type-badge" [class.type-auto]="r.sendType === 'AUTOMATED'">
                          {{ r.sendType === 'AUTOMATED' ? 'Automated' : 'Manual' }}
                        </span>
                        {{ r.sentBy ? 'by recruiter' : 'by system' }}
                      </span>
                      <span class="audit-meta">{{ formatDate(r.sentAt) }}</span>
                    </div>
                  }
                }
              </div>

              <!-- Submission flag history -->
              <div class="audit-section">
                <div class="audit-title">Flag History</div>
                @if (submissionFlags().length === 0) {
                  <div class="audit-empty">No flags raised</div>
                } @else {
                  @for (f of submissionFlags(); track f.flagId) {
                    <div class="flag-history-entry">
                      <div class="flag-history-row">
                        <span class="flag-history-reason">{{ flagReasonLabel(f.reason) }}</span>
                        <span class="flag-history-status" [class]="'fh-status-' + f.status.toLowerCase()">{{ f.status }}</span>
                        <span class="audit-meta">{{ formatDate(f.createdAt) }}</span>
                      </div>
                    </div>
                  }
                }
              </div>

              <!-- Per-question answers -->
              <div class="answers-list">
                @for (q of result()!.questions; track q.questionId; let i = $index) {
                  @if (q.questionType === 'GROUP') {
                    <!-- GROUP: preamble header + individually-markable sub-questions -->
                    <div class="answer-card group-preamble-card">
                      <div class="answer-card-header">
                        <div class="q-num">Q{{ i + 1 }}</div>
                        <span class="q-type-badge type-group">Group</span>
                        <span class="q-title">{{ q.questionTitle }}</span>
                        <span class="q-max-score">/ {{ q.maxScore }} pt{{ q.maxScore !== 1 ? 's' : '' }}</span>
                      </div>
                      @for (sub of q.subQuestions ?? []; track sub.questionId; let si = $index) {
                        <div class="sub-answer-card">
                          <div class="answer-card-header">
                            <div class="q-num sub-q-num">{{ si + 1 }}.</div>
                            <span class="q-type-badge type-{{ sub.questionType.toLowerCase() }}">{{ typeLabel(sub.questionType) }}</span>
                            <span class="q-title">{{ sub.questionTitle }}</span>
                            @if (sub.autoMarked) {
                              <span class="auto-badge">Auto-scored</span>
                            }
                            <span class="q-max-score">/ {{ sub.maxScore }} pt{{ sub.maxScore !== 1 ? 's' : '' }}</span>
                            @if (sub.score !== null) {
                              <span class="score-display">{{ sub.score }}/{{ sub.maxScore }}</span>
                            }
                          </div>
                          <div class="answer-content">{{ sub.candidateAnswer ?? '(No answer)' }}</div>
                          @if (sub.feedback) {
                            <div class="feedback-display">{{ sub.feedback }}</div>
                          }
                          @if (!sub.autoMarked || sub.questionType !== 'MCQ') {
                            <div class="mark-row">
                              <input type="number" class="score-input" [min]="0" [max]="sub.maxScore"
                                     [value]="editScores()[sub.questionId] ?? sub.score ?? ''"
                                     (input)="onScoreInput(sub.questionId, $event)" (blur)="onScoreBlur(sub.questionId, $event, sub.maxScore)"
                                     placeholder="Score (max {{ sub.maxScore }})" />
                              <input type="text" class="feedback-input-inline"
                                     [value]="editFeedback()[sub.questionId] ?? sub.feedback ?? ''"
                                     (input)="onFeedbackInput(sub.questionId, $event)"
                                     placeholder="Feedback (optional)" />
                              <button class="save-btn" (click)="saveScore(sub)" [disabled]="saving()">Save</button>
                            </div>
                          } @else {
                            <div class="mark-row">
                              <span class="override-hint">Override auto-score:</span>
                              <input type="number" class="score-input" [min]="0" [max]="sub.maxScore"
                                     [value]="editScores()[sub.questionId] ?? ''"
                                     (input)="onScoreInput(sub.questionId, $event)" (blur)="onScoreBlur(sub.questionId, $event, sub.maxScore)"
                                     placeholder="{{ sub.score }}" />
                              <button class="save-btn secondary" (click)="saveScore(sub)" [disabled]="saving()">Override</button>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="answer-card">
                      <div class="answer-card-header">
                        <div class="q-num">Q{{ i + 1 }}</div>
                        <span class="q-type-badge type-{{ q.questionType.toLowerCase() }}">{{ typeLabel(q.questionType) }}</span>
                        <span class="q-title">{{ q.questionTitle }}</span>
                        @if (q.autoMarked) {
                          <span class="auto-badge">Auto-scored</span>
                        }
                        <span class="q-max-score">/ {{ q.maxScore }} pt{{ q.maxScore !== 1 ? 's' : '' }}</span>
                        @if (q.score !== null) {
                          <span class="score-display">{{ q.score }}/{{ q.maxScore }}</span>
                        }
                      </div>

                      <div class="answer-content">{{ q.candidateAnswer ?? '(No answer)' }}</div>

                      @if (q.feedback) {
                        <div class="feedback-display">{{ q.feedback }}</div>
                      }

                      <!-- Score input for text/code or override for MCQ -->
                      @if (!q.autoMarked || q.questionType !== 'MCQ') {
                        <div class="mark-row">
                          <input type="number" class="score-input" [min]="0" [max]="q.maxScore"
                                 [value]="editScores()[q.questionId] ?? q.score ?? ''"
                                 (input)="onScoreInput(q.questionId, $event)" (blur)="onScoreBlur(q.questionId, $event, q.maxScore)"
                                 placeholder="Score (max {{ q.maxScore }})" />
                          <input type="text" class="feedback-input-inline"
                                 [value]="editFeedback()[q.questionId] ?? q.feedback ?? ''"
                                 (input)="onFeedbackInput(q.questionId, $event)"
                                 placeholder="Feedback (optional)" />
                          <button class="save-btn" (click)="saveScore(q)" [disabled]="saving()">Save</button>
                        </div>
                      } @else {
                        <!-- MCQ auto-scored — allow override -->
                        <div class="mark-row">
                          <span class="override-hint">Override auto-score:</span>
                          <input type="number" class="score-input" [min]="0" [max]="q.maxScore"
                                 [value]="editScores()[q.questionId] ?? ''"
                                 (input)="onScoreInput(q.questionId, $event)" (blur)="onScoreBlur(q.questionId, $event, q.maxScore)"
                                 placeholder="{{ q.score }}" />
                          <button class="save-btn secondary" (click)="saveScore(q)" [disabled]="saving()">Override</button>
                        </div>
                      }
                    </div>
                  }
                }
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

    .header-filters { display: flex; gap: 5px; }

    .assessment-select {
      padding: 5px 10px; border-radius: var(--radius-sm); cursor: pointer;
      font-family: var(--font); font-size: 12.5px;
      background: var(--bg-elevated); color: var(--text-2); border: 1px solid var(--border);
      outline: none; transition: border-color 120ms;
    }
    .assessment-select:focus { border-color: var(--accent); color: var(--text-1); }

    .filter-chip {
      padding: 5px 12px; border-radius: 999px; cursor: pointer;
      font-family: var(--font); font-size: 12.5px; font-weight: 400;
      background: transparent; color: var(--text-2); border: 1px solid var(--border);
      transition: all 120ms;
    }
    .filter-chip:hover { background: var(--bg-hover); color: var(--text-1); }
    .filter-chip.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); font-weight: 600; }

    .split-layout {
      display: grid; grid-template-columns: 300px 1fr;
      flex: 1; min-height: 0;
    }

    .submissions-panel { border-right: 1px solid var(--border); overflow-y: auto; }

    .submission-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px; border-bottom: 1px solid var(--border);
      cursor: pointer; transition: background 120ms;
    }
    .submission-item:hover { background: var(--bg-hover); }
    .submission-item.active { background: var(--accent-subtle); }

    .sub-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .sub-info { flex: 1; min-width: 0; }
    .sub-name-row { display: flex; align-items: center; gap: 5px; margin-bottom: 2px; }
    .sub-name { font-size: 13px; font-weight: 600; color: var(--text-1); }
    .sub-bl-symbol { font-size: 13px; color: var(--danger); flex-shrink: 0; }
    .sub-tags { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-bottom: 2px; }

    .sub-status { font-size: 10px; padding: 1px 6px; border-radius: 999px; font-weight: 500; }
    .status-submitted { background: var(--success-subtle); color: var(--success); }
    .status-auto { background: var(--info-subtle); color: var(--info); }
    .status-progress { background: var(--warning-subtle); color: var(--warning); }
    .status-not-started { background: var(--bg-elevated); color: var(--text-3); border: 1px solid var(--border); }

    .sub-date { display: block; font-size: 11px; color: var(--text-3); }
    .sub-progress { display: block; font-size: 11px; color: var(--text-2); margin-top: 1px; }
    .sub-score { display: block; font-size: 11px; color: var(--accent); font-weight: 600; margin-top: 1px; }

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
      border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 16px;
    }

    .detail-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .detail-candidate-info { flex: 1; }
    .detail-name-row { display: flex; align-items: center; gap: 8px; }
    .detail-name { font-size: 15px; font-weight: 600; color: var(--text-1); }
    .detail-bl-tag { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: var(--danger-subtle); color: var(--danger); white-space: nowrap; }
    .detail-assessment { display: block; font-size: 12px; color: var(--text-2); margin-top: 2px; }
    .detail-submitted { display: block; font-size: 11px; color: var(--text-3); margin-top: 2px; }

    .detail-score-block { text-align: right; flex-shrink: 0; }
    .total-score { font-size: 26px; font-weight: 800; color: var(--text-1); line-height: 1; }
    .total-max { font-size: 12px; color: var(--text-3); }

    .marking-badge {
      display: inline-block; margin-top: 6px; padding: 2px 8px;
      border-radius: 999px; font-size: 11px; font-weight: 500;
    }
    .answered-stat { font-size: 11px; color: var(--text-3); margin-top: 4px; }
    .badge-done { background: var(--success-subtle); color: var(--success); }
    .badge-pending { background: var(--warning-subtle); color: var(--warning); }

    .answers-list { display: flex; flex-direction: column; gap: 12px; }

    .answer-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 16px;
    }

    .answer-card-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
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
    .type-group { background: rgba(20,184,166,0.13); color: #14b8a6; }

    .group-preamble-card { display: flex; flex-direction: column; gap: 10px; }

    .sub-answer-card {
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 12px 14px;
      display: flex; flex-direction: column; gap: 8px;
    }

    .sub-q-num {
      width: 22px; height: 22px; border-radius: 50%;
      background: var(--bg); color: var(--text-3);
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .q-title { font-size: 13px; font-weight: 500; color: var(--text-1); flex: 1; }

    .auto-badge {
      font-size: 10.5px; padding: 2px 7px; border-radius: 999px;
      background: var(--success-subtle); color: var(--success); font-weight: 500;
    }

    .q-max-score {
      font-size: 11px; color: var(--text-3); margin-left: auto; white-space: nowrap;
    }

    .score-display {
      font-size: 12px; font-weight: 700; color: var(--text-1);
      background: var(--bg-elevated); padding: 2px 8px; border-radius: 999px;
    }

    .answer-content {
      font-size: 13px; color: var(--text-2); line-height: 1.65;
      padding: 10px 12px; background: var(--bg-elevated);
      border-radius: var(--radius-sm); margin-bottom: 10px;
      white-space: pre-wrap; font-family: var(--font-mono);
    }

    .feedback-display {
      font-size: 12.5px; color: var(--text-2); font-style: italic;
      padding: 6px 10px; border-left: 3px solid var(--accent-subtle);
      margin-bottom: 10px;
    }

    .mark-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }

    .override-hint { font-size: 12px; color: var(--text-3); }

    .score-input {
      width: 64px; padding: 5px 8px; text-align: center;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13px; outline: none;
    }
    .score-input:focus { border-color: var(--accent); }

    .feedback-input-inline {
      flex: 1; padding: 5px 10px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 12.5px; outline: none; font-family: var(--font);
    }
    .feedback-input-inline:focus { border-color: var(--accent); }
    .feedback-input-inline::placeholder { color: var(--text-3); }

    .save-btn {
      padding: 5px 14px; border-radius: var(--radius-sm);
      background: var(--accent); color: #fff; border: none;
      font-size: 12.5px; font-weight: 600; cursor: pointer;
      font-family: var(--font); transition: background 120ms;
    }
    .save-btn:hover:not(:disabled) { background: var(--accent-hover); }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .save-btn.secondary { background: var(--bg-elevated); color: var(--text-2); border: 1px solid var(--border); }
    .save-btn.secondary:hover:not(:disabled) { background: var(--bg-hover); }

    .empty-panel { padding: 40px; text-align: center; color: var(--text-3); font-size: 13px; }

    .pending-badge { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--warning-subtle); color: var(--warning); font-weight: 600; flex-shrink: 0; }
    .flag-badge { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--danger-subtle); color: var(--danger); font-weight: 600; flex-shrink: 0; }
    .flag-badge-detail { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: var(--danger-subtle); color: var(--danger); }

    .flag-section {
      margin: 0 20px 16px;
      padding: 12px 14px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-lg);
    }

    .btn-flag {
      background: none; border: 1px solid var(--danger); color: var(--danger);
      padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 500;
      cursor: pointer; font-family: var(--font); transition: all 120ms;
    }
    .btn-flag:hover { background: var(--danger-subtle); }

    .flag-form { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    .field-select-sm, .field-input-sm {
      padding: 5px 10px; background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1); font-size: 13px; outline: none;
      font-family: var(--font);
    }
    .field-select-sm:focus, .field-input-sm:focus { border-color: var(--accent); }
    .field-input-sm { flex: 1; min-width: 220px; }

    .flag-transition { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

    .btn-flag-action {
      padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 500;
      cursor: pointer; font-family: var(--font); border: 1px solid var(--border);
      background: var(--bg-elevated); color: var(--text-2); transition: all 120ms;
    }
    .btn-flag-action:hover { background: var(--bg-hover); color: var(--text-1); }
    .btn-flag-action.resolve { border-color: var(--success); color: var(--success); }
    .btn-flag-action.resolve:hover { background: var(--success-subtle); }
    .btn-flag-action.dismiss { border-color: var(--text-3); }

    .audit-section {
      margin: 0 20px 16px; padding: 12px 14px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
    }
    .audit-title { font-size: 12px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
    .audit-entry { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--border); }
    .audit-entry:last-child { border-bottom: none; }
    .flag-history-entry { padding: 6px 0; border-bottom: 1px solid var(--border); }
    .flag-history-entry:last-child { border-bottom: none; }
    .flag-history-row { display: flex; align-items: center; gap: 8px; }
    .flag-history-reason { font-size: 12px; color: var(--text-1); flex: 1; }
    .flag-history-status { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 999px; }
    .flag-history-notes { font-size: 11.5px; color: var(--text-3); margin-top: 3px; font-style: italic; }
    .fh-status-flagged { background: var(--warning-subtle); color: var(--warning); }
    .fh-status-under_review { background: var(--info-subtle); color: var(--info); }
    .fh-status-action_required { background: rgba(234,88,12,.12); color: #ea580c; }
    .fh-status-resolved { background: var(--success-subtle); color: var(--success); }
    .fh-status-dismissed { background: var(--bg-elevated); color: var(--text-3); }
    .audit-action { font-size: 12.5px; color: var(--text-1); font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .audit-meta { font-size: 11.5px; color: var(--text-3); }
    .audit-empty { font-size: 12px; color: var(--text-3); font-style: italic; }

    .reminder-section {
      margin: 0 20px 16px; padding: 12px 14px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .btn-reminder {
      background: none; border: 1px solid var(--accent); color: var(--accent);
      padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 500;
      cursor: pointer; font-family: var(--font); transition: all 120ms;
    }
    .btn-reminder:hover:not(:disabled) { background: var(--accent-subtle); }
    .btn-reminder:disabled { opacity: 0.5; cursor: not-allowed; }
    .reminder-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .reminder-confirm-text { font-size: 12.5px; color: var(--text-2); }
    .reminder-toast { font-size: 12px; color: var(--success); font-weight: 500; }
    .reminder-type-badge {
      display: inline-block; padding: 1px 6px; border-radius: 999px; font-size: 10.5px; font-weight: 500;
      background: var(--info-subtle); color: var(--info);
    }
    .reminder-type-badge.type-auto { background: var(--accent-subtle); color: var(--accent); }
  `],
})
export class ResultsComponent implements OnInit {
  private readonly markingSvc = inject(MarkingService);
  private readonly flagSvc = inject(FlagService);
  private readonly reminderSvc = inject(ReminderService);
  private readonly route = inject(ActivatedRoute);

  readonly submissions = signal<SubmissionSummary[]>([]);
  readonly selectedSummary = signal<SubmissionSummary | null>(null);
  readonly result = signal<ResultSummary | null>(null);
  readonly loadingList = signal(false);
  readonly loadingResult = signal(false);
  readonly saving = signal(false);
  readonly statusFilter = signal('');
  readonly assessmentFilter = signal('');

  // Flag state
  readonly activeFlag = signal<FlagResponse | null>(null);
  readonly auditTrail = signal<FlagAuditEntry[]>([]);
  readonly showFlagForm = signal(false);
  readonly flagReason = signal<FlagReason | ''>('');
  readonly flagSaving = signal(false);
  readonly showResolveForm = signal<FlagStatus | null>(null);
  readonly resolveNotes = signal('');

  // Flag history for selected submission
  readonly submissionFlags = signal<FlagListItem[]>([]);

  // Reminder state
  readonly showReminderConfirm = signal(false);
  readonly reminderSending = signal(false);
  readonly reminderSuccess = signal(false);
  readonly reminderHistory = signal<ReminderSendLogDto[]>([]);

  readonly editScores = signal<Record<string, number | undefined>>({});
  readonly editFeedback = signal<Record<string, string | undefined>>({});

  readonly statusFilters = [
    { value: '', label: 'All' },
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'AUTO_SUBMITTED', label: 'Auto-submitted' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
  ];

  readonly availableAssessments = computed(() => {
    const seen = new Set<string>();
    const result: { assessmentId: string; assessmentTitle: string }[] = [];
    for (const s of this.submissions()) {
      if (s.assessmentId && !seen.has(s.assessmentId)) {
        seen.add(s.assessmentId);
        result.push({ assessmentId: s.assessmentId, assessmentTitle: s.assessmentTitle });
      }
    }
    return result;
  });

  readonly filteredSubmissions = computed(() => {
    const statusF = this.statusFilter();
    const assessmentF = this.assessmentFilter();
    let list = this.submissions();
    if (assessmentF) {
      list = list.filter(s => s.assessmentId === assessmentF);
    }
    if (!statusF) return list;
    if (statusF === 'PENDING_REVIEW') {
      return list.filter(s =>
        (s.status === 'SUBMITTED' || s.status === 'AUTO_SUBMITTED') &&
        s.markedCount < s.totalAnswers,
      );
    }
    return list.filter(s => s.status === statusF);
  });

  ngOnInit() {
    this.loadingList.set(true);
    this.markingSvc.listAllSubmissions().subscribe({
      next: list => {
        this.submissions.set(list);
        this.loadingList.set(false);
        const targetId = this.route.snapshot.queryParamMap.get('submission');
        if (targetId) {
          const match = list.find(s => s.submissionId === targetId);
          if (match) this.selectSubmission(match);
        }
      },
      error: () => this.loadingList.set(false),
    });
  }

  selectSubmission(s: SubmissionSummary) {
    this.selectedSummary.set(s);
    this.result.set(null);
    this.editScores.set({});
    this.editFeedback.set({});
    this.activeFlag.set(null);
    this.auditTrail.set([]);
    this.showFlagForm.set(false);
    this.flagReason.set('');
    this.showResolveForm.set(null);
    this.resolveNotes.set('');
    this.showReminderConfirm.set(false);
    this.reminderSending.set(false);
    this.reminderSuccess.set(false);
    this.reminderHistory.set([]);
    this.submissionFlags.set([]);
    // NOT_STARTED candidates have no submission to load
    if (s.status !== 'NOT_STARTED' && s.submissionId) {
      this.loadingResult.set(true);
      this.markingSvc.getResult(s.submissionId).subscribe({
        next: r => { this.result.set(r); this.loadingResult.set(false); },
        error: () => this.loadingResult.set(false),
      });
      if (s.flagStatus === 'FLAGGED' || s.flagStatus === 'UNDER_REVIEW' || s.flagStatus === 'ACTION_REQUIRED') {
        this.loadActiveFlagForSubmission(s.submissionId, s.flagStatus as FlagStatus);
      }
      this.flagSvc.getCandidateFlags(s.candidateId).subscribe({
        next: flags => this.submissionFlags.set(flags.filter(f => f.submissionId === s.submissionId)),
      });
    }
    // Load reminder history via invitationId
    this.reminderSvc.getReminderHistory(s.invitationId).subscribe({
      next: history => this.reminderHistory.set(history),
    });
  }

  private loadActiveFlagForSubmission(submissionId: string, status: FlagStatus) {
    // We'll load via the candidate flags endpoint to find the open flag
    // Since we don't have a GET single flag endpoint, we store flag info from create/transition responses
    // and seed activeFlag from submission list flagStatus
    const stub: FlagResponse = {
      flagId: '', submissionId, reason: 'OTHER', status,
      resolutionNotes: null, createdBy: '', createdAt: ''
    };
    this.activeFlag.set(stub);
  }

  submitFlag() {
    const s = this.selectedSummary();
    const reason = this.flagReason();
    if (!s || !s.submissionId || !reason) return;
    this.flagSaving.set(true);
    this.flagSvc.createFlag(s.submissionId, { reason }).subscribe({
      next: flag => {
        this.activeFlag.set(flag);
        this.showFlagForm.set(false);
        this.flagReason.set('');
        this.flagSaving.set(false);
        this.loadAuditTrail(s.submissionId!, flag.flagId);
        this.submissions.update(list => list.map(sub =>
          sub.submissionId === s.submissionId ? { ...sub, flagStatus: 'FLAGGED' as any } : sub
        ));
      },
      error: () => this.flagSaving.set(false),
    });
  }

  transitionFlag(newStatus: FlagStatus, notes: string | null) {
    const s = this.selectedSummary();
    const flag = this.activeFlag();
    if (!s || !s.submissionId || !flag?.flagId) return;
    this.flagSaving.set(true);
    this.flagSvc.transitionFlag(s.submissionId, flag.flagId, { status: newStatus, resolutionNotes: notes }).subscribe({
      next: updated => {
        this.activeFlag.set(updated);
        this.showResolveForm.set(null);
        this.resolveNotes.set('');
        this.flagSaving.set(false);
        this.loadAuditTrail(s.submissionId!, updated.flagId);
        const flagStatus = (newStatus === 'RESOLVED' || newStatus === 'DISMISSED') ? null : newStatus;
        this.submissions.update(list => list.map(sub =>
          sub.submissionId === s.submissionId ? { ...sub, flagStatus: flagStatus as any } : sub
        ));
      },
      error: () => this.flagSaving.set(false),
    });
  }

  private loadAuditTrail(submissionId: string, flagId: string) {
    if (!flagId) return;
    this.flagSvc.getAuditTrail(submissionId, flagId).subscribe({
      next: entries => this.auditTrail.set(entries),
    });
  }

  sendReminder() {
    const s = this.selectedSummary();
    if (!s) return;
    this.reminderSending.set(true);
    this.reminderSvc.sendReminder(s.invitationId).subscribe({
      next: log => {
        this.reminderSending.set(false);
        this.showReminderConfirm.set(false);
        this.reminderSuccess.set(true);
        this.reminderHistory.update(h => [log, ...h]);
        setTimeout(() => this.reminderSuccess.set(false), 3000);
      },
      error: () => this.reminderSending.set(false),
    });
  }

  onScoreInput(questionId: string, event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.editScores.update(s => ({ ...s, [questionId]: isNaN(val) ? undefined : val }));
  }

  onScoreBlur(questionId: string, event: Event, maxScore: number) {
    const input = event.target as HTMLInputElement;
    const raw = parseFloat(input.value);
    if (!isNaN(raw)) {
      const clamped = Math.min(Math.max(raw, 0), maxScore);
      if (clamped !== raw) {
        input.value = String(clamped);
        this.editScores.update(s => ({ ...s, [questionId]: clamped }));
      }
    }
  }

  onFeedbackInput(questionId: string, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.editFeedback.update(f => ({ ...f, [questionId]: val }));
  }

  saveScore(q: ResultQuestion) {
    const r = this.result();
    const s = this.selectedSummary();
    if (!r || !s || !s.submissionId) return;

    const rawScore = this.editScores()[q.questionId] ?? q.score;
    if (rawScore == null) return;
    const scoreVal = Math.min(Math.max(rawScore, 0), q.maxScore);

    const feedbackVal = this.editFeedback()[q.questionId] ?? q.feedback ?? undefined;
    this.saving.set(true);

    const score$ = q.answerId
      ? this.markingSvc.scoreAnswer(r.submissionId, q.answerId, { score: scoreVal, feedback: feedbackVal })
      : this.markingSvc.scoreAnswerByQuestion(r.submissionId, q.questionId, { score: scoreVal, feedback: feedbackVal });

    score$.subscribe({
      next: saved => {
        this.saving.set(false);
        // Refresh the result to show updated score/marking status
        this.markingSvc.getResult(r.submissionId).subscribe({
          next: updated => {
            this.result.set(updated);
            this.editScores.update(e => { const c = {...e}; delete c[q.questionId]; return c; });
            this.editFeedback.update(e => { const c = {...e}; delete c[q.questionId]; return c; });
            // Update marking progress in list
            this.submissions.update(list => list.map(sub =>
              sub.submissionId === s.submissionId
                ? { ...sub, markedCount: updated.questions.filter(qq => qq.score !== null).length }
                : sub
            ));
          },
        });
      },
      error: () => this.saving.set(false),
    });
  }

  statusClass(s: SubmissionSummary): string {
    if (s.status === 'SUBMITTED') return 'sub-status status-submitted';
    if (s.status === 'AUTO_SUBMITTED') return 'sub-status status-auto';
    if (s.status === 'NOT_STARTED') return 'sub-status status-not-started';
    return 'sub-status status-progress';
  }

  statusLabel(s: SubmissionSummary): string {
    if (s.status === 'SUBMITTED') return 'Submitted';
    if (s.status === 'AUTO_SUBMITTED') return 'Auto-submitted';
    if (s.status === 'NOT_STARTED') return 'Not Started';
    return 'In Progress';
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  flagReasonLabel(reason: FlagReason): string {
    const map: Record<FlagReason, string> = {
      COPIED_ANSWERS: 'Copied Answers',
      TIMING_ANOMALY: 'Timing Anomaly',
      AI_GENERATED_CONTENT: 'AI-Generated Content',
      SUSPICIOUS_BEHAVIOUR: 'Suspicious Behaviour',
      OTHER: 'Other',
    };
    return map[reason] ?? reason;
  }

  scorePercent(s: SubmissionSummary): string {
    if (s.maxScore <= 0 || s.markedCount < s.totalAnswers || s.totalAnswers === 0) return '—';
    return Math.round((s.totalScore / s.maxScore) * 100) + '%';
  }

  typeLabel(type: string): string {
    return { MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code', GROUP: 'Group' }[type] ?? type;
  }

  totalQuestionCount(): number {
    return (this.result()?.questions ?? []).reduce(
      (sum, q) => sum + (q.questionType === 'GROUP' ? (q.subQuestions?.length ?? 0) : 1),
      0
    );
  }
}
