import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionService } from '../../core/question/question.service';
import { Question, QuestionType } from '../../core/question/question.model';
import { TestCaseFormComponent } from './test-case-form.component';

type StarterCodeLang = 'java' | 'csharp' | 'python';

@Component({
  selector: 'app-question-form',
  imports: [ReactiveFormsModule, RouterLink, TestCaseFormComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ editId() ? 'Edit Question' : 'Add Question' }}</h1>
        </div>
        <a routerLink="/questions" class="btn btn-ghost btn-sm">← Back to Bank</a>
      </div>

      <div class="content">
        <div class="form-card">

          <!-- Edit guard for GROUP questions -->
          @if (groupEditBlocked()) {
            <div class="info-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Group questions cannot be edited via this form. To change the sub-questions, delete this question and recreate it.
            </div>
            <div class="form-actions" style="border-top: none; padding-top: 0; margin-top: 0;">
              <a routerLink="/questions" class="btn btn-secondary">← Back to Bank</a>
            </div>
          } @else {

          <form [formGroup]="form" (ngSubmit)="submit()">

            <div class="field">
              <label class="field-label">Question Type</label>
              <div class="type-selector">
                @for (t of typeOptions; track t.value) {
                  <button type="button" class="type-btn" [class.active]="form.get('type')?.value === t.value"
                    (click)="setType(t.value)">{{ t.label }}</button>
                }
              </div>
            </div>

            <div class="field">
              <label class="field-label">Question Title <span class="required">*</span></label>
              <input formControlName="title" class="field-input"
                [placeholder]="form.get('type')?.value === 'GROUP'
                  ? 'e.g. Database scenario — query optimisation'
                  : 'e.g. What is the time complexity of binary search?'"/>
              @if (form.get('title')?.invalid && form.get('title')?.touched) {
                <span class="field-err">Title is required</span>
              }
            </div>

            <div class="field">
              <label class="field-label">
                {{ form.get('type')?.value === 'GROUP' ? 'Scenario Preamble' : 'Question Body' }}
                <span class="required">*</span>
              </label>
              <textarea formControlName="body" class="field-textarea" rows="4"
                [placeholder]="form.get('type')?.value === 'GROUP'
                  ? 'Describe the scenario or context that candidates will read before answering the sub-questions…'
                  : 'Detailed question description…'"></textarea>
              @if (form.get('body')?.invalid && form.get('body')?.touched) {
                <span class="field-err">{{ form.get('type')?.value === 'GROUP' ? 'Preamble' : 'Body' }} is required</span>
              }
            </div>

            <div class="field">
              <label class="field-label">Tags <span class="field-hint-inline">(comma-separated)</span></label>
              <input formControlName="tagsRaw" class="field-input" placeholder="e.g. algorithms, java, sql"/>
            </div>

            <!-- CODE_SUBMISSION: language hint, per-language starter code, test cases -->
            @if (form.get('type')?.value === 'CODE_SUBMISSION') {
              <div class="field">
                <label class="field-label">Language Hint <span class="field-hint-inline">(informational only)</span></label>
                <input formControlName="languageHint" class="field-input" placeholder="e.g. java, python, javascript"/>
              </div>

              <div class="field">
                <label class="field-label">Starter Code Templates <span class="field-hint-inline">(optional — pre-fills the editor per language)</span></label>
                <div class="starter-tabs">
                  @for (lang of starterCodeLangs; track lang.value) {
                    <button type="button" class="starter-tab" [class.active]="activeStarterLang() === lang.value"
                            (click)="activeStarterLang.set(lang.value)">{{ lang.label }}</button>
                  }
                </div>
                @if (activeStarterLang() === 'java') {
                  <textarea formControlName="starterCodeJava" class="field-textarea code-textarea" rows="8"
                            placeholder="public class Solution {&#10;    public static void main(String[] args) {&#10;        // Write your solution here&#10;    }&#10;}"></textarea>
                } @else if (activeStarterLang() === 'csharp') {
                  <textarea formControlName="starterCodeCsharp" class="field-textarea code-textarea" rows="8"
                            placeholder="using System;&#10;class Solution {&#10;    static void Main(string[] args) {&#10;        // Write your solution here&#10;    }&#10;}"></textarea>
                } @else if (activeStarterLang() === 'python') {
                  <textarea formControlName="starterCodePython" class="field-textarea code-textarea" rows="8"
                            placeholder="# Write your solution here&#10;"></textarea>
                }
              </div>

              <div class="field">
                <app-test-case-form [formArray]="testCases" />
              </div>
            }

            <!-- MCQ: answer options -->
            @if (form.get('type')?.value === 'MCQ') {
              <div class="field">
                <label class="field-label">Answer Options <span class="field-hint-inline">(select the correct one)</span></label>
                <div formArrayName="options" class="options-list">
                  @for (opt of options.controls; track opt; let i = $index) {
                    <div [formGroupName]="i" class="option-row">
                      <div class="radio-wrap" (click)="markCorrect(i)">
                        <div class="radio-circle" [class.selected]="opt.get('correct')?.value">
                          @if (opt.get('correct')?.value) {
                            <div class="radio-dot"></div>
                          }
                        </div>
                        <span class="option-letter">{{ optionLetter(i) }}</span>
                      </div>
                      <input type="text" formControlName="text" class="field-input opt-input" [placeholder]="'Option ' + optionLetter(i)"/>
                      <button type="button" class="icon-btn" (click)="removeOption(i)" [disabled]="options.length <= 2" title="Remove option">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
                <button type="button" class="add-option-btn" (click)="addOption()">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add option
                </button>
                @if (mcqError()) {
                  <span class="field-err">{{ mcqError() }}</span>
                }
              </div>
            }

            <!-- GROUP: member question picker -->
            @if (form.get('type')?.value === 'GROUP') {
              <div class="field">
                <label class="field-label">
                  Sub-questions
                  <span class="field-hint-inline">(add 2 or more from the question bank)</span>
                </label>

                <!-- Selected members list -->
                @if (memberQuestions().length > 0) {
                  <div class="members-list">
                    @for (m of memberQuestions(); track m.id; let i = $index) {
                      <div class="member-row">
                        <span class="member-num">{{ i + 1 }}</span>
                        <span class="type-badge type-{{ m.type.toLowerCase() }}">{{ typeLabel(m.type) }}</span>
                        <span class="member-title">{{ m.title }}</span>
                        <button type="button" class="icon-btn" (click)="removeMember(m.id)" title="Remove">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }

                @if (memberError()) {
                  <span class="field-err">{{ memberError() }}</span>
                }

                <!-- Bank picker -->
                <div class="bank-picker">
                  <div class="bank-search-wrap">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input class="bank-search-input"
                      [value]="bankSearch()"
                      (input)="bankSearch.set($any($event.target).value)"
                      placeholder="Search question bank…" />
                  </div>

                  @if (bankLoading()) {
                    <div class="bank-state-msg">Loading question bank…</div>
                  } @else if (bankError()) {
                    <div class="bank-state-msg bank-state-err">{{ bankError() }}</div>
                  } @else if (filteredBank().length === 0) {
                    <div class="bank-state-msg">
                      {{ allQuestions().length === 0 ? 'No questions in the bank yet.' : 'No matching questions available.' }}
                    </div>
                  } @else {
                    <div class="bank-results">
                      @for (q of filteredBank(); track q.id) {
                        <div class="bank-row">
                          <span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabel(q.type) }}</span>
                          <span class="bank-row-title">{{ q.title }}</span>
                          <button type="button" class="add-btn" (click)="addMember(q)">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            Add
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            @if (error()) {
              <div class="error-banner">{{ error() }}</div>
            }

            <div class="form-actions">
              <a routerLink="/questions" class="btn btn-secondary">Cancel</a>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                {{ saving() ? 'Saving…' : (editId() ? 'Save Changes' : 'Create Question') }}
              </button>
            </div>
          </form>

          } <!-- end @else groupEditBlocked -->
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

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500; cursor: pointer;
      border: 1px solid transparent; transition: all 120ms;
      text-decoration: none; white-space: nowrap;
    }
    .btn-sm { padding: 5px 11px; font-size: 12px; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: var(--bg-elevated); color: var(--text-1); border-color: var(--border); }
    .btn-secondary:hover { background: var(--bg-hover); }
    .btn-ghost { background: transparent; color: var(--text-2); }
    .btn-ghost:hover { background: var(--bg-hover); color: var(--text-1); }

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .form-card {
      max-width: 640px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px;
    }

    .field { margin-bottom: 18px; }

    .field-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-2); margin-bottom: 6px; }

    .field-hint-inline { font-weight: 400; color: var(--text-3); font-size: 11.5px; }

    .required { color: var(--danger); }

    .field-input {
      width: 100%; padding: 8px 12px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13.5px; outline: none; transition: border-color 150ms;
    }
    .field-input:focus { border-color: var(--accent); }
    .field-input::placeholder { color: var(--text-3); }

    .field-textarea {
      width: 100%; padding: 8px 12px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13.5px; outline: none; resize: vertical; line-height: 1.6; transition: border-color 150ms;
    }
    .field-textarea:focus { border-color: var(--accent); }
    .field-textarea::placeholder { color: var(--text-3); }
    .code-textarea { font-family: var(--font-mono); font-size: 12.5px; }

    .field-err { font-size: 11.5px; color: var(--danger); margin-top: 4px; display: block; }

    .type-selector { display: flex; gap: 6px; flex-wrap: wrap; }

    .type-btn {
      flex: 1; padding: 7px; min-width: 90px;
      background: var(--bg-elevated); color: var(--text-2);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      cursor: pointer; font-family: var(--font); font-size: 13px; font-weight: 400;
      transition: all 120ms;
    }
    .type-btn:hover { background: var(--bg-hover); color: var(--text-1); }
    .type-btn.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); font-weight: 600; }

    .options-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }

    .option-row { display: flex; align-items: center; gap: 8px; }

    .radio-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }

    .radio-circle {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid var(--border);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: border-color 120ms;
    }
    .radio-circle.selected { border-color: var(--accent); }
    .radio-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
    .option-letter { font-size: 12px; font-weight: 600; color: var(--text-3); width: 18px; }
    .opt-input { flex: 1; }

    .icon-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      border-radius: 4px; display: flex; align-items: center; color: var(--text-3);
      transition: color 120ms, background 120ms; flex-shrink: 0;
    }
    .icon-btn:hover { color: var(--danger); background: var(--danger-subtle); }
    .icon-btn:disabled { opacity: 0.3; cursor: default; }

    .add-option-btn {
      display: flex; align-items: center; gap: 6px;
      background: none; border: 1px dashed var(--border);
      border-radius: var(--radius-sm); padding: 6px 14px;
      cursor: pointer; color: var(--accent); font-size: 12.5px;
      font-family: var(--font); transition: all 120ms;
    }
    .add-option-btn:hover { background: var(--accent-subtle); border-color: var(--accent); }

    /* GROUP: selected members */
    .members-list {
      display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px;
    }

    .member-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }

    .member-num {
      font-size: 11px; font-weight: 700; color: var(--text-3);
      width: 18px; flex-shrink: 0; text-align: center;
    }

    .member-title { font-size: 13px; color: var(--text-1); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* GROUP: bank picker */
    .bank-picker {
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .bank-search-wrap {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-bottom: 1px solid var(--border);
      background: var(--bg-elevated); color: var(--text-3);
    }

    .bank-search-input {
      flex: 1; background: transparent; border: none; outline: none;
      color: var(--text-1); font-size: 13px; font-family: var(--font);
    }
    .bank-search-input::placeholder { color: var(--text-3); }

    .bank-results { max-height: 220px; overflow-y: auto; }

    .bank-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-bottom: 1px solid var(--border);
      transition: background 100ms;
    }
    .bank-row:last-child { border-bottom: none; }
    .bank-row:hover { background: var(--bg-hover); }

    .bank-row-title { flex: 1; font-size: 13px; color: var(--text-1); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .add-btn {
      display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
      padding: 4px 10px; border-radius: var(--radius-sm);
      background: var(--accent-subtle); color: var(--accent);
      border: 1px solid transparent; font-size: 12px; font-weight: 500;
      cursor: pointer; font-family: var(--font); transition: all 120ms;
    }
    .add-btn:hover { background: var(--accent); color: #fff; }

    .bank-state-msg {
      padding: 16px 12px; font-size: 12.5px; color: var(--text-3); text-align: center;
    }
    .bank-state-err { color: var(--danger); }

    /* type badges (reused from assessment builder) */
    .type-badge {
      display: inline-flex; padding: 2px 7px; border-radius: 999px;
      font-size: 11px; font-weight: 500; flex-shrink: 0;
    }
    .type-mcq { background: var(--accent-subtle); color: var(--accent); }
    .type-text { background: var(--info-subtle); color: var(--info); }
    .type-code_submission { background: rgba(168,85,247,0.13); color: #a855f7; }
    .type-group { background: rgba(20,184,166,0.13); color: #14b8a6; }

    /* Starter code language tabs */
    .starter-tabs {
      display: flex; gap: 0; margin-bottom: 8px;
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      overflow: hidden; width: fit-content;
    }
    .starter-tab {
      padding: 5px 16px; background: var(--bg-elevated); border: none;
      color: var(--text-2); font-size: 12.5px; font-weight: 500; cursor: pointer;
      font-family: var(--font); transition: all 100ms;
      border-right: 1px solid var(--border);
    }
    .starter-tab:last-child { border-right: none; }
    .starter-tab:hover { background: var(--bg-hover); color: var(--text-1); }
    .starter-tab.active { background: var(--accent-subtle); color: var(--accent); font-weight: 700; }

    /* info / edit-blocked banner */
    .info-banner {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 12px 14px; margin-bottom: 20px;
      background: var(--info-subtle); border: 1px solid rgba(59,130,246,.2);
      border-radius: var(--radius-sm); color: var(--info); font-size: 13px;
      line-height: 1.5;
    }
    .info-banner svg { flex-shrink: 0; margin-top: 1px; }

    .error-banner {
      padding: 10px 14px; background: var(--danger-subtle);
      border: 1px solid rgba(239,68,68,.25); border-radius: var(--radius-sm);
      color: var(--danger); font-size: 13px; margin-bottom: 16px;
    }

    .form-actions {
      display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;
      padding-top: 16px; border-top: 1px solid var(--border);
    }
  `],
})
export class QuestionFormComponent implements OnInit {
  private readonly svc = inject(QuestionService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly editId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly mcqError = signal<string | null>(null);
  readonly activeStarterLang = signal<StarterCodeLang>('java');

  readonly starterCodeLangs = [
    { value: 'java' as StarterCodeLang,   label: 'Java'   },
    { value: 'csharp' as StarterCodeLang, label: 'C#'     },
    { value: 'python' as StarterCodeLang, label: 'Python' },
  ];

  // ── GROUP-specific state ────────────────────────────────────────────────
  readonly allQuestions = signal<Question[]>([]);
  readonly memberQuestions = signal<Question[]>([]);
  readonly bankSearch = signal('');
  readonly bankLoading = signal(false);
  readonly bankError = signal<string | null>(null);
  readonly memberError = signal<string | null>(null);
  readonly groupEditBlocked = signal(false);

  readonly filteredBank = computed(() => {
    const search = this.bankSearch().toLowerCase();
    const memberIds = new Set(this.memberQuestions().map(q => q.id));
    return this.allQuestions()
      .filter(q => q.type !== 'GROUP')           // no nested groups
      .filter(q => !memberIds.has(q.id))          // not already added
      .filter(q => !search || q.title.toLowerCase().includes(search));
  });

  readonly form = this.fb.group({
    type: ['MCQ' as QuestionType, Validators.required],
    title: ['', Validators.required],
    body: ['', Validators.required],
    tagsRaw: [''],
    languageHint: [''],
    starterCode: [''],           // legacy — kept for backward compat but not shown in UI
    starterCodeJava: [''],
    starterCodeCsharp: [''],
    starterCodePython: [''],
    options: this.fb.array([this.makeOption('', true), this.makeOption('', false)]),
    testCases: this.fb.array([]),
  });

  readonly typeOptions = [
    { value: 'MCQ', label: 'Multiple Choice' },
    { value: 'TEXT', label: 'Text Response' },
    { value: 'CODE_SUBMISSION', label: 'Code Submission' },
    { value: 'GROUP', label: 'Group / Scenario' },
  ];

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  get testCases(): FormArray {
    return this.form.get('testCases') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.svc.getQuestion(id).subscribe({
        next: q => {
          // GROUP questions cannot be edited — show read-only notice
          if (q.type === 'GROUP') {
            this.groupEditBlocked.set(true);
            this.form.patchValue({ type: q.type, title: q.title, body: q.body });
            return;
          }
          // FIX: clear default placeholder MCQ options for all question types.
          // The form initialises with type='MCQ' and two options that have Validators.required.
          // If we leave them for non-MCQ questions the form stays invalid and submit() returns
          // silently even though the user sees no error.
          this.options.clear();

          // For CODE_SUBMISSION: fall back to the legacy starterCode value when per-language
          // templates haven't been set yet (questions created before this feature existed).
          const legacyJava = q.starterCodeJava ?? (q.type === 'CODE_SUBMISSION' ? (q.starterCode ?? '') : '');

          this.form.patchValue({
            type: q.type,
            title: q.title,
            body: q.body,
            tagsRaw: q.tags.join(', '),
            languageHint: q.languageHint ?? '',
            starterCode: q.starterCode ?? '',
            starterCodeJava:   legacyJava,
            starterCodeCsharp: q.starterCodeCsharp ?? '',
            starterCodePython: q.starterCodePython ?? '',
          });
          if (q.type === 'MCQ' && q.options) {
            q.options.forEach(o => this.options.push(this.makeOption(o.text, o.correct)));
          }
          if (q.type === 'CODE_SUBMISSION' && q.testCases) {
            this.testCases.clear();
            q.testCases.forEach(tc => this.testCases.push(
              this.fb.group({
                description: [tc.description ?? ''],
                stdin: [tc.stdin ?? ''],
                expectedOutput: [tc.expectedOutput, Validators.required],
                visible: [tc.visible],
                runOnlyOnSubmit: [tc.runOnlyOnSubmit ?? false],
              }),
            ));
          }
        },
        error: () => this.error.set('Failed to load question.'),
      });
    }
  }

  setType(type: string) {
    this.form.patchValue({ type: type as QuestionType });
    this.mcqError.set(null);
    this.memberError.set(null);

    if (type === 'MCQ') {
      if (this.options.length < 2) {
        this.options.clear();
        this.options.push(this.makeOption('', true));
        this.options.push(this.makeOption('', false));
      }
    } else {
      this.options.clear();
    }

    if (type !== 'CODE_SUBMISSION') {
      this.testCases.clear();
      this.form.patchValue({ starterCode: '', starterCodeJava: '', starterCodeCsharp: '', starterCodePython: '' });
      this.activeStarterLang.set('java');
    }

    if (type === 'GROUP') {
      this.memberQuestions.set([]);
      this.bankSearch.set('');
      this.bankError.set(null);
      this.bankLoading.set(true);
      this.svc.listQuestions().subscribe({
        next: qs => { this.allQuestions.set(qs); this.bankLoading.set(false); },
        error: () => {
          this.bankError.set('Failed to load question bank. Please try again.');
          this.bankLoading.set(false);
        },
      });
    }
  }

  // ── GROUP member management ─────────────────────────────────────────────

  addMember(q: Question) {
    this.memberQuestions.update(ms => [...ms, q]);
    this.memberError.set(null);
  }

  removeMember(id: string) {
    this.memberQuestions.update(ms => ms.filter(m => m.id !== id));
  }

  typeLabel(type: string): string {
    return ({ MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code', GROUP: 'Group' } as Record<string, string>)[type] ?? type;
  }

  // ── MCQ helpers ─────────────────────────────────────────────────────────

  makeOption(text: string, correct: boolean) {
    return this.fb.group({ text: [text, Validators.required], correct: [correct] });
  }

  addOption() { this.options.push(this.makeOption('', false)); }

  removeOption(i: number) { this.options.removeAt(i); }

  markCorrect(index: number) {
    this.options.controls.forEach((ctrl, i) => ctrl.patchValue({ correct: i === index }));
  }

  optionLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const type = this.form.get('type')!.value as QuestionType;
    const tags = (this.form.get('tagsRaw')!.value ?? '')
      .split(',').map((t: string) => t.trim()).filter(Boolean);

    if (type === 'MCQ') {
      const opts = this.options.value as { text: string; correct: boolean }[];
      const correctCount = opts.filter(o => o.correct).length;
      if (opts.some(o => !o.text.trim())) { this.mcqError.set('All option texts are required.'); return; }
      if (correctCount !== 1) { this.mcqError.set('Exactly one option must be marked correct.'); return; }
      this.mcqError.set(null);
    }

    if (type === 'GROUP') {
      if (this.memberQuestions().length < 2) {
        this.memberError.set('A group question must have at least 2 sub-questions.');
        return;
      }
      this.memberError.set(null);
    }

    const payload = {
      type,
      title: this.form.get('title')!.value!,
      body: this.form.get('body')!.value!,
      tags,
      ...(type === 'MCQ' && { options: this.options.value }),
      ...(type === 'CODE_SUBMISSION' && {
        languageHint: this.form.get('languageHint')!.value ?? undefined,
        starterCode: this.form.get('starterCode')!.value ?? undefined,
        starterCodeJava: this.form.get('starterCodeJava')!.value || undefined,
        starterCodeCsharp: this.form.get('starterCodeCsharp')!.value || undefined,
        starterCodePython: this.form.get('starterCodePython')!.value || undefined,
        testCases: this.testCases.controls.map((ctrl, i) => {
          const g = ctrl as FormGroup;
          return {
            description: g.get('description')!.value || undefined,
            stdin: g.get('stdin')!.value || undefined,
            expectedOutput: g.get('expectedOutput')!.value,
            visible: g.get('visible')!.value,
            displayOrder: i,
            runOnlyOnSubmit: g.get('runOnlyOnSubmit')!.value ?? false,
          };
        }),
      }),
      ...(type === 'GROUP' && {
        memberQuestionIds: this.memberQuestions().map(q => q.id),
      }),
    };

    this.saving.set(true);
    this.error.set(null);

    const op = this.editId()
      ? this.svc.updateQuestion(this.editId()!, payload)
      : this.svc.createQuestion(payload);

    op.subscribe({
      next: () => this.router.navigate(['/questions']),
      error: err => {
        this.error.set(err?.error?.detail ?? 'Failed to save question.');
        this.saving.set(false);
      },
    });
  }
}
