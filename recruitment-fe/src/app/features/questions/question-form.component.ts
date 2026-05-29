import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionService } from '../../core/question/question.service';
import { QuestionType } from '../../core/question/question.model';

@Component({
  selector: 'app-question-form',
  imports: [ReactiveFormsModule, RouterLink],
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
              <input formControlName="title" class="field-input" placeholder="e.g. What is the time complexity of binary search?"/>
              @if (form.get('title')?.invalid && form.get('title')?.touched) {
                <span class="field-err">Title is required</span>
              }
            </div>

            <div class="field">
              <label class="field-label">Question Body <span class="required">*</span></label>
              <textarea formControlName="body" class="field-textarea" rows="4" placeholder="Detailed question description…"></textarea>
              @if (form.get('body')?.invalid && form.get('body')?.touched) {
                <span class="field-err">Body is required</span>
              }
            </div>

            <div class="field">
              <label class="field-label">Tags <span class="field-hint-inline">(comma-separated)</span></label>
              <input formControlName="tagsRaw" class="field-input" placeholder="e.g. algorithms, java, sql"/>
            </div>

            @if (form.get('type')?.value === 'CODE_SUBMISSION') {
              <div class="field">
                <label class="field-label">Language Hint</label>
                <input formControlName="languageHint" class="field-input" placeholder="e.g. java, python, javascript"/>
              </div>
            }

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

    .field-err { font-size: 11.5px; color: var(--danger); margin-top: 4px; display: block; }

    .type-selector { display: flex; gap: 6px; }

    .type-btn {
      flex: 1; padding: 7px;
      background: var(--bg-elevated); color: var(--text-2);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      cursor: pointer; font-family: var(--font); font-size: 13px; font-weight: 400;
      transition: all 120ms;
    }
    .type-btn:hover { background: var(--bg-hover); color: var(--text-1); }
    .type-btn.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); font-weight: 600; }

    .options-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }

    .option-row { display: flex; align-items: center; gap: 8px; }

    .radio-wrap {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
    }

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

  readonly form = this.fb.group({
    type: ['MCQ' as QuestionType, Validators.required],
    title: ['', Validators.required],
    body: ['', Validators.required],
    tagsRaw: [''],
    languageHint: [''],
    options: this.fb.array([this.makeOption('', true), this.makeOption('', false)]),
  });

  readonly typeOptions = [
    { value: 'MCQ', label: 'Multiple Choice' },
    { value: 'TEXT', label: 'Text Response' },
    { value: 'CODE_SUBMISSION', label: 'Code Submission' },
  ];

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.svc.getQuestion(id).subscribe({
        next: q => {
          this.form.patchValue({
            type: q.type,
            title: q.title,
            body: q.body,
            tagsRaw: q.tags.join(', '),
            languageHint: q.languageHint ?? '',
          });
          if (q.type === 'MCQ' && q.options) {
            this.options.clear();
            q.options.forEach(o => this.options.push(this.makeOption(o.text, o.correct)));
          }
        },
        error: () => this.error.set('Failed to load question.'),
      });
    }
  }

  setType(type: string) {
    this.form.patchValue({ type: type as QuestionType });
    this.mcqError.set(null);
    if (type === 'MCQ') {
      if (this.options.length < 2) {
        this.options.clear();
        this.options.push(this.makeOption('', true));
        this.options.push(this.makeOption('', false));
      }
    } else {
      this.options.clear();
    }
  }

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

    const payload = {
      type,
      title: this.form.get('title')!.value!,
      body: this.form.get('body')!.value!,
      tags,
      ...(type === 'MCQ' && { options: this.options.value }),
      ...(type === 'CODE_SUBMISSION' && {
        languageHint: this.form.get('languageHint')!.value ?? undefined,
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
