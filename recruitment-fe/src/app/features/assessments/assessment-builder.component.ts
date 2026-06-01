import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { QuestionService } from '../../core/question/question.service';
import { AssessmentDetail } from '../../core/assessment/assessment.model';
import { Question } from '../../core/question/question.model';

@Component({
  selector: 'app-assessment-builder',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="builder">
      <div class="builder-header">
        <div class="header-left">
          <h1 class="header-title">{{ isNew() ? 'Create Assessment' : 'Edit Assessment' }}</h1>
          <span class="header-sub">Step {{ step() }} of 3</span>
        </div>
        <div class="header-actions">
          <a routerLink="/assessments" class="btn btn-ghost">Cancel</a>
          @if (step() > 1) {
            <button class="btn btn-secondary" (click)="prevStep()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
          }
          @if (step() < 3) {
            <button class="btn btn-primary" (click)="nextStep()" [disabled]="step() === 1 && form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Next' }}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          } @else {
            <button class="btn btn-primary" (click)="finish()" [disabled]="saving()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {{ assessment()?.status === 'DRAFT' ? 'Save & Finish' : 'Save Changes' }}
            </button>
          }
        </div>
      </div>

      <div class="step-indicator">
        @for (s of steps; track s.n) {
          <div class="step-item" [class.done]="step() > s.n" [class.active]="step() === s.n" (click)="goToStep(s.n)">
            <div class="step-circle">
              @if (step() > s.n) {
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              } @else {
                {{ s.n }}
              }
            </div>
            <span class="step-label">{{ s.label }}</span>
          </div>
          @if (s.n < 3) {
            <div class="step-line" [class.filled]="step() > s.n"></div>
          }
        }
      </div>

      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      <div class="builder-body">
        @if (step() === 1) {
          <div class="step-content">
            <form [formGroup]="form" class="info-form">
              <div class="field">
                <label class="field-label">Assessment Title <span class="required">*</span></label>
                <input formControlName="title" class="field-input" placeholder="e.g. Senior Frontend Developer Assessment"/>
                <span class="field-hint">Candidates will see this name</span>
              </div>

              <div class="field">
                <label class="field-label">Description</label>
                <textarea formControlName="description" class="field-textarea" rows="3" placeholder="Describe what this assessment covers…"></textarea>
                <span class="field-hint">Shown on the candidate start screen</span>
              </div>

              <div class="field-row">
                <div class="field">
                  <label class="field-label">Time Limit (minutes)</label>
                  <input formControlName="timeLimitMinutes" type="number" class="field-input" placeholder="60"/>
                  <span class="field-hint">Set to 0 for no limit</span>
                </div>
                <div class="field">
                  <label class="field-label">Passing Score (%)</label>
                  <input [value]="passingScore()" (input)="passingScore.set(+$any($event.target).value)" type="number" class="field-input" placeholder="70"/>
                </div>
              </div>

              <div class="field">
                <label class="field-label">Access Type</label>
                <div class="access-options">
                  @for (opt of accessOptions; track opt.value) {
                    <div class="access-option" [class.selected]="accessType() === opt.value" (click)="accessType.set(opt.value)">
                      <div class="radio-circle">
                        @if (accessType() === opt.value) {
                          <div class="radio-dot"></div>
                        }
                      </div>
                      <div>
                        <div class="access-option-label">{{ opt.label }}</div>
                        <div class="access-option-sub">{{ opt.sub }}</div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              @if (accessType() === 'password') {
                <div class="field">
                  <label class="field-label">Access Password</label>
                  <input type="password" class="field-input" [value]="accessPassword()"
                         (input)="accessPassword.set($any($event.target).value)"
                         placeholder="Enter password for candidates…" autocomplete="new-password"/>
                  <span class="field-hint">Candidates must enter this before starting</span>
                </div>
              }
            </form>
          </div>
        }

        @if (step() === 2) {
          <div class="questions-step">
            <div class="questions-main">
              <div class="questions-header">
                <div>
                  <span class="questions-count">{{ assessment()?.questions?.length ?? 0 }} Questions</span>
                  <span class="questions-meta">added to this assessment</span>
                </div>
                <button class="btn btn-secondary btn-sm" (click)="bankOpen.set(!bankOpen())">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <path d="M9 9h6M9 12h4"/>
                  </svg>
                  {{ bankOpen() ? 'Hide Bank' : 'Browse Bank' }}
                </button>
              </div>

              <div class="question-list">
                @if ((assessment()?.questions?.length ?? 0) === 0) {
                  <div class="empty-questions">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <p>No questions added yet</p>
                    <button class="btn btn-secondary btn-sm" (click)="bankOpen.set(true)">Browse Question Bank</button>
                  </div>
                }
                @for (q of assessment()?.questions; track q.questionId; let i = $index) {
                  <div class="q-row">
                    <svg class="drag-handle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                    <span class="q-num">{{ i + 1 }}</span>
                    <span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabelMap[q.type] }}</span>
                    <span class="q-title">{{ q.title }}</span>
                    @if (q.type === 'GROUP' && q.subQuestionCount > 0) {
                      <span class="sub-q-hint">{{ q.subQuestionCount }} sub-questions</span>
                    }
                    <button class="icon-btn danger" (click)="removeQuestion(q.questionId)" title="Remove">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>

            @if (bankOpen()) {
              <div class="bank-panel">
                <div class="bank-header">
                  <span class="bank-title">Question Bank</span>
                  <div class="bank-filters">
                    @for (f of bankFilters; track f.value) {
                      <button class="filter-chip" [class.active]="bankType() === f.value" (click)="bankType.set(f.value)">{{ f.label }}</button>
                    }
                  </div>
                  <input class="bank-search" [value]="bankSearch()" (input)="bankSearch.set($any($event.target).value)" placeholder="Search…"/>
                </div>
                <div class="bank-list">
                  @for (q of filteredBank(); track q.id) {
                    <div class="bank-item">
                      <div class="bank-item-body">
                        <div class="bank-item-badges">
                          <span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabelMap[q.type] }}</span>
                        </div>
                        <p class="bank-item-title">{{ q.title }}</p>
                        @if (q.tags[0]) { <span class="bank-item-tag">{{ q.tags[0] }}</span> }
                      </div>
                      <button
                        class="add-btn"
                        [class.added]="isAdded(q.id)"
                        [disabled]="isAdded(q.id)"
                        (click)="addQuestion(q.id)"
                      >{{ isAdded(q.id) ? '✓' : '+ Add' }}</button>
                    </div>
                  }
                  @if (filteredBank().length === 0) {
                    <p class="bank-empty">No questions match</p>
                  }
                </div>
              </div>
            }
          </div>
        }

        @if (step() === 3) {
          <div class="step-content settings-step">
            <div class="settings-card">
              <span class="settings-section-label">Schedule</span>
              <div class="field-row">
                <div class="field">
                  <label class="field-label">Available From</label>
                  <input [value]="startDate()" (input)="startDate.set($any($event.target).value)" type="date" class="field-input"/>
                  <span class="field-hint">Blank = publish immediately</span>
                </div>
                <div class="field">
                  <label class="field-label">Deadline</label>
                  <input [value]="endDate()" (input)="endDate.set($any($event.target).value)" type="date" class="field-input"/>
                  <span class="field-hint">Blank = no deadline</span>
                </div>
              </div>
            </div>

            <div class="settings-card">
              <span class="settings-section-label">Notifications</span>
              <label class="toggle-label">
                <div class="toggle" [class.on]="notifyOnSubmit()" (click)="notifyOnSubmit.set(!notifyOnSubmit())">
                  <div class="toggle-thumb"></div>
                </div>
                Email notification when a candidate submits
              </label>
            </div>

            <div class="settings-card">
              <span class="settings-section-label">Anti-Cheating</span>
              <div class="toggle-group">
                <label class="toggle-label">
                  <div class="toggle" [class.on]="tabMonitor()" (click)="tabMonitor.set(!tabMonitor())">
                    <div class="toggle-thumb"></div>
                  </div>
                  Detect and log tab switching / focus loss
                </label>
                <label class="toggle-label">
                  <div class="toggle" [class.on]="aiDetect()" (click)="aiDetect.set(!aiDetect())">
                    <div class="toggle-thumb"></div>
                  </div>
                  Flag potentially AI-generated responses
                </label>
                <label class="toggle-label">
                  <div class="toggle" [class.on]="clipMonitor()" (click)="clipMonitor.set(!clipMonitor())">
                    <div class="toggle-thumb"></div>
                  </div>
                  Monitor clipboard paste activity
                </label>
              </div>
            </div>

            @if (assessment()) {
              <div class="settings-card">
                <span class="settings-section-label">Preview</span>
                <p class="settings-desc">See how this assessment appears to candidates before publishing.</p>
                <a [routerLink]="['/assessments', assessment()!.id, 'preview']" class="btn btn-secondary">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Preview as Candidate
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .builder {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg);
    }

    .builder-header {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .header-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-1);
      letter-spacing: -0.01em;
    }

    .header-sub {
      font-size: 12px;
      color: var(--text-3);
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 120ms;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn-sm { padding: 5px 11px; font-size: 12px; }

    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-secondary { background: var(--bg-elevated); color: var(--text-1); border-color: var(--border); }
    .btn-secondary:hover { background: var(--bg-hover); }

    .btn-ghost { background: transparent; color: var(--text-2); }
    .btn-ghost:hover { background: var(--bg-hover); color: var(--text-1); }

    .step-indicator {
      display: flex;
      align-items: center;
      padding: 24px 24px 0;
      max-width: 560px;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      transition: all 200ms;
      background: var(--bg-elevated);
      color: var(--text-3);
      border: 2px solid var(--border);
      flex-shrink: 0;
    }

    .step-item.active .step-circle {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }

    .step-item.done .step-circle {
      background: var(--success-subtle);
      color: var(--success);
      border-color: var(--success);
    }

    .step-label {
      font-size: 13px;
      font-weight: 400;
      color: var(--text-3);
      white-space: nowrap;
    }

    .step-item.active .step-label { color: var(--text-1); font-weight: 600; }
    .step-item.done .step-label { color: var(--text-2); }

    .step-line {
      flex: 1;
      height: 2px;
      background: var(--border);
      margin: 0 12px;
      border-radius: 1px;
      transition: background 300ms;
    }

    .step-line.filled { background: var(--accent); }

    .error-banner {
      margin: 16px 24px 0;
      padding: 10px 14px;
      background: var(--danger-subtle);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: var(--radius-sm);
      color: var(--danger);
      font-size: 13px;
    }

    .builder-body {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .step-content { max-width: 600px; }

    .info-form { display: flex; flex-direction: column; gap: 2px; }

    .field { margin-bottom: 18px; }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-2);
      margin-bottom: 6px;
    }

    .required { color: var(--danger); }

    .field-input {
      width: 100%;
      padding: 8px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-1);
      font-size: 13.5px;
      outline: none;
      transition: border-color 150ms;
    }

    .field-input:focus { border-color: var(--accent); }
    .field-input::placeholder { color: var(--text-3); }

    .field-textarea {
      width: 100%;
      padding: 8px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-1);
      font-size: 13.5px;
      outline: none;
      resize: vertical;
      line-height: 1.6;
      transition: border-color 150ms;
    }

    .field-textarea:focus { border-color: var(--accent); }
    .field-textarea::placeholder { color: var(--text-3); }

    .field-hint { font-size: 11.5px; color: var(--text-3); margin-top: 5px; display: block; }

    .access-options { display: flex; flex-direction: column; gap: 8px; }

    .access-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      cursor: pointer;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: all 120ms;
    }

    .access-option.selected {
      background: var(--accent-subtle);
      border-color: var(--accent);
    }

    .radio-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .access-option.selected .radio-circle { border-color: var(--accent); }

    .radio-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
    }

    .access-option-label { font-size: 13.5px; font-weight: 500; color: var(--text-1); }
    .access-option-sub { font-size: 12px; color: var(--text-3); margin-top: 1px; }

    /* Step 2 */
    .questions-step {
      display: flex;
      gap: 20px;
      min-height: 400px;
    }

    .questions-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

    .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .questions-count { font-size: 14px; font-weight: 600; color: var(--text-1); }
    .questions-meta { font-size: 12px; color: var(--text-3); margin-left: 8px; }

    .question-list { display: flex; flex-direction: column; gap: 8px; }

    .empty-questions {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--text-3);
      gap: 12px;
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
    }

    .empty-questions p { font-size: 13px; }

    .q-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 14px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }

    .drag-handle { color: var(--text-3); flex-shrink: 0; cursor: grab; }

    .q-num { font-size: 11.5px; color: var(--text-3); width: 18px; text-align: center; flex-shrink: 0; }

    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .type-mcq { background: var(--accent-subtle); color: var(--accent); }
    .type-text { background: var(--info-subtle); color: var(--info); }
    .type-code_submission { background: rgba(168,85,247,0.13); color: #a855f7; }
    .type-group { background: rgba(20,184,166,0.13); color: #14b8a6; }
    .sub-q-hint { font-size: 11px; color: var(--text-3); white-space: nowrap; }

    .q-title {
      flex: 1;
      font-size: 13.5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-1);
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      color: var(--text-3);
      transition: color 120ms, background 120ms;
      flex-shrink: 0;
    }

    .icon-btn.danger:hover { color: var(--danger); background: var(--danger-subtle); }

    /* Bank panel */
    .bank-panel {
      width: 320px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex-shrink: 0;
      max-height: 560px;
    }

    .bank-header {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .bank-title { font-size: 13.5px; font-weight: 600; color: var(--text-1); display: block; margin-bottom: 10px; }

    .bank-filters { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }

    .filter-chip {
      padding: 3px 10px;
      background: transparent;
      color: var(--text-3);
      border: 1px solid var(--border);
      border-radius: 999px;
      font-size: 11.5px;
      cursor: pointer;
      font-family: var(--font);
      transition: all 100ms;
    }

    .filter-chip.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); }

    .bank-search {
      width: 100%;
      padding: 6px 10px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-1);
      font-size: 12.5px;
      outline: none;
    }

    .bank-search:focus { border-color: var(--accent); }
    .bank-search::placeholder { color: var(--text-3); }

    .bank-list { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; }

    .bank-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }

    .bank-item-body { flex: 1; }

    .bank-item-badges { display: flex; gap: 5px; margin-bottom: 5px; }

    .bank-item-title { font-size: 12.5px; color: var(--text-1); line-height: 1.4; }

    .bank-item-tag { font-size: 11px; color: var(--text-3); margin-top: 3px; display: block; }

    .add-btn {
      padding: 4px 10px;
      background: var(--accent-subtle);
      color: var(--accent);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-family: var(--font);
      font-weight: 500;
      flex-shrink: 0;
      transition: all 120ms;
      white-space: nowrap;
    }

    .add-btn.added { background: var(--success-subtle); color: var(--success); cursor: default; }
    .add-btn:disabled { opacity: 0.7; }

    .bank-empty { font-size: 13px; color: var(--text-3); text-align: center; padding: 20px; }

    /* Step 3 */
    .settings-step { display: flex; flex-direction: column; gap: 16px; }

    .settings-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
    }

    .settings-section-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-3);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 14px;
    }

    .settings-desc { font-size: 13px; color: var(--text-2); margin-bottom: 14px; }

    .toggle-group { display: flex; flex-direction: column; gap: 14px; }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      font-size: 13.5px;
      color: var(--text-1);
    }

    .toggle {
      width: 36px;
      height: 20px;
      border-radius: 10px;
      background: var(--border);
      position: relative;
      transition: background 200ms;
      flex-shrink: 0;
    }

    .toggle.on { background: var(--accent); }

    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      transition: left 200ms;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    .toggle.on .toggle-thumb { left: 19px; }
  `],
})
export class AssessmentBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assessmentService = inject(AssessmentService);
  private readonly questionService = inject(QuestionService);
  private readonly fb = inject(FormBuilder);

  readonly step = signal<1 | 2 | 3>(1);
  readonly assessment = signal<AssessmentDetail | null>(null);
  readonly allQuestions = signal<Question[]>([]);
  readonly bankOpen = signal(false);
  readonly bankType = signal('');
  readonly bankSearch = signal('');
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly passingScore = signal(70);
  readonly accessType = signal<'invite' | 'password' | 'open'>('invite');
  readonly accessPassword = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly notifyOnSubmit = signal(true);
  readonly tabMonitor = signal(true);
  readonly aiDetect = signal(false);
  readonly clipMonitor = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    timeLimitMinutes: [60, [Validators.required, Validators.min(0)]],
  });

  readonly isNew = computed(
    () => !this.route.snapshot.paramMap.get('id'),
  );

  readonly filteredBank = computed(() => {
    const type = this.bankType();
    const search = this.bankSearch().toLowerCase();
    return this.allQuestions().filter(q => {
      if (type && q.type !== type) return false;
      if (search && !q.title.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  readonly steps = [
    { n: 1 as const, label: 'Basic Info' },
    { n: 2 as const, label: 'Questions' },
    { n: 3 as const, label: 'Settings' },
  ];

  readonly bankFilters = [
    { value: '', label: 'All' },
    { value: 'MCQ', label: 'MCQ' },
    { value: 'TEXT', label: 'Text' },
    { value: 'CODE_SUBMISSION', label: 'Code' },
    { value: 'GROUP', label: 'Group' },
  ];

  readonly typeLabelMap: Record<string, string> = {
    MCQ: 'MCQ',
    TEXT: 'Text',
    CODE_SUBMISSION: 'Code',
    GROUP: 'Group',
  };

  readonly accessOptions = [
    { value: 'invite' as const, label: 'Invite Only', sub: 'Candidates receive a direct link via email' },
    { value: 'password' as const, label: 'Password Protected', sub: 'Candidates need a password to access' },
    { value: 'open' as const, label: 'Open Access', sub: 'Anyone with the link can take this assessment' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const isEditPath = this.route.snapshot.url.some(s => s.path === 'edit');

    this.questionService.listQuestions().subscribe(qs => this.allQuestions.set(qs));

    if (id) {
      this.assessmentService.getAssessment(id).subscribe({
        next: a => {
          this.assessment.set(a);
          this.form.patchValue({
            title: a.title,
            description: a.description ?? '',
            timeLimitMinutes: a.timeLimitMinutes,
          });
          if (a.passwordProtected) {
            this.accessType.set('password');
          }
          if (!isEditPath) {
            this.step.set(2);
          }
        },
        error: () => this.error.set('Failed to load assessment.'),
      });
    }
  }

  isAdded(questionId: string): boolean {
    return this.assessment()?.questions.some(q => q.questionId === questionId) ?? false;
  }

  goToStep(n: 1 | 2 | 3) {
    if (n <= this.step() || (n === 2 && this.assessment())) {
      this.step.set(n);
    }
  }

  nextStep() {
    if (this.step() === 1) {
      this.saveBasicInfo();
    } else if (this.step() === 2) {
      this.step.set(3);
    }
  }

  prevStep() {
    const current = this.step();
    if (current > 1) this.step.set((current - 1) as 1 | 2 | 3);
  }

  finish() {
    this.router.navigate(['/assessments']);
  }

  private saveBasicInfo() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    const { title, description, timeLimitMinutes } = this.form.getRawValue();
    const accessPassword = this.accessType() === 'password' ? (this.accessPassword() || null) : null;
    const req = { title, description: description || null, timeLimitMinutes, accessPassword };
    const existing = this.assessment();

    const op = existing
      ? this.assessmentService.updateAssessment(existing.id, req)
      : this.assessmentService.createAssessment(req);

    op.subscribe({
      next: a => {
        this.assessment.set(a);
        this.saving.set(false);
        this.step.set(2);
        if (!existing) {
          this.router.navigate(['/assessments', a.id], { replaceUrl: true });
        }
      },
      error: () => {
        this.error.set('Failed to save assessment. Please try again.');
        this.saving.set(false);
      },
    });
  }

  addQuestion(questionId: string) {
    const assessmentId = this.assessment()?.id;
    if (!assessmentId) return;
    const order = (this.assessment()?.questions.length ?? 0) + 1;
    this.assessmentService.addQuestion(assessmentId, { questionId, displayOrder: order }).subscribe({
      next: a => this.assessment.set(a),
      error: () => this.error.set('Failed to add question.'),
    });
  }

  removeQuestion(questionId: string) {
    const assessmentId = this.assessment()?.id;
    if (!assessmentId) return;
    this.assessmentService.removeQuestion(assessmentId, questionId).subscribe({
      next: () =>
        this.assessment.update(a =>
          a ? { ...a, questions: a.questions.filter(q => q.questionId !== questionId) } : a,
        ),
      error: () => this.error.set('Failed to remove question.'),
    });
  }
}
