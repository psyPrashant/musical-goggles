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
        <h2>{{ editId() ? 'Edit Question' : 'New Question' }}</h2>
        <a routerLink="/questions" class="btn-link">← Back</a>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="q-form">

        <!-- Type -->
        <div class="field">
          <label>Type</label>
          <select formControlName="type" (change)="onTypeChange()">
            <option value="MCQ">MCQ</option>
            <option value="TEXT">Text</option>
            <option value="CODE_SUBMISSION">Code Submission</option>
          </select>
        </div>

        <!-- Title -->
        <div class="field">
          <label>Title</label>
          <input type="text" formControlName="title" placeholder="Question title" />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <span class="err">Title is required</span>
          }
        </div>

        <!-- Body -->
        <div class="field">
          <label>Body</label>
          <textarea formControlName="body" rows="4" placeholder="Question details…"></textarea>
          @if (form.get('body')?.invalid && form.get('body')?.touched) {
            <span class="err">Body is required</span>
          }
        </div>

        <!-- Tags -->
        <div class="field">
          <label>Tags <span class="hint">(comma-separated)</span></label>
          <input type="text" formControlName="tagsRaw" placeholder="e.g. java, oop, sql" />
        </div>

        <!-- CODE_SUBMISSION: language hint -->
        @if (form.get('type')?.value === 'CODE_SUBMISSION') {
          <div class="field">
            <label>Language hint</label>
            <input type="text" formControlName="languageHint" placeholder="e.g. java, python" />
          </div>
        }

        <!-- MCQ options -->
        @if (form.get('type')?.value === 'MCQ') {
          <div class="field">
            <label>Options <span class="hint">(mark exactly one correct)</span></label>
            <div formArrayName="options" class="options-list">
              @for (opt of options.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="option-row">
                  <input type="radio" name="correctOption" [value]="i"
                         [checked]="opt.get('correct')?.value"
                         (change)="markCorrect(i)"
                         title="Mark as correct" />
                  <input type="text" formControlName="text" placeholder="Option text" class="opt-text" />
                  <button type="button" class="btn-icon" (click)="removeOption(i)" [disabled]="options.length <= 2">✕</button>
                </div>
              }
            </div>
            <button type="button" class="btn-add" (click)="addOption()">+ Add option</button>
            @if (mcqError()) {
              <span class="err">{{ mcqError() }}</span>
            }
          </div>
        }

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <div class="form-actions">
          <a routerLink="/questions" class="btn-secondary">Cancel</a>
          <button type="submit" class="btn-primary" [disabled]="saving()">
            {{ saving() ? 'Saving…' : (editId() ? 'Save Changes' : 'Create Question') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 700px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-link { color: #2563eb; text-decoration: none; }
    .q-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-weight: 600; font-size: 0.9rem; }
    .hint { font-weight: 400; color: #6b7280; font-size: 0.8rem; }
    input[type=text], textarea, select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; width: 100%; box-sizing: border-box; }
    textarea { resize: vertical; }
    .options-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }
    .option-row { display: flex; align-items: center; gap: 0.5rem; }
    .opt-text { flex: 1; }
    .btn-icon { background: none; border: none; cursor: pointer; color: #6b7280; font-size: 1rem; padding: 0.25rem; }
    .btn-icon:disabled { opacity: 0.3; }
    .btn-add { background: none; border: 1px dashed #d1d5db; border-radius: 6px; padding: 0.4rem 1rem; cursor: pointer; color: #2563eb; font-size: 0.85rem; align-self: flex-start; }
    .err { color: #b91c1c; font-size: 0.8rem; }
    .error { color: #b91c1c; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 0.5rem; }
    .btn-primary { background: #2563eb; color: #fff; padding: 0.6rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95rem; }
    .btn-primary:disabled { opacity: 0.6; }
    .btn-secondary { background: #e5e7eb; color: #374151; padding: 0.6rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; font-size: 0.95rem; }
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
    options: this.fb.array([
      this.makeOption('', true),
      this.makeOption('', false),
    ]),
  });

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

  onTypeChange() {
    this.mcqError.set(null);
    if (this.form.get('type')?.value === 'MCQ') {
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

  addOption() {
    this.options.push(this.makeOption('', false));
  }

  removeOption(i: number) {
    this.options.removeAt(i);
  }

  markCorrect(index: number) {
    this.options.controls.forEach((ctrl, i) => ctrl.patchValue({ correct: i === index }));
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
      if (opts.some(o => !o.text.trim())) {
        this.mcqError.set('All option texts are required.');
        return;
      }
      if (correctCount !== 1) {
        this.mcqError.set('Exactly one option must be marked correct.');
        return;
      }
      this.mcqError.set(null);
    }

    const payload = {
      type,
      title: this.form.get('title')!.value!,
      body: this.form.get('body')!.value!,
      tags,
      ...(type === 'MCQ' && { options: this.options.value }),
      ...(type === 'CODE_SUBMISSION' && { languageHint: this.form.get('languageHint')!.value ?? undefined }),
    };

    this.saving.set(true);
    this.error.set(null);

    const op = this.editId()
      ? this.svc.updateQuestion(this.editId()!, payload)
      : this.svc.createQuestion(payload);

    op.subscribe({
      next: () => this.router.navigate(['/questions']),
      error: (err) => {
        this.error.set(err?.error?.detail ?? 'Failed to save question.');
        this.saving.set(false);
      },
    });
  }
}
