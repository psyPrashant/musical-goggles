import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssessmentService } from '../../core/assessment/assessment.service';

@Component({
  selector: 'app-assessment-form',
  imports: [ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>{{ editId() ? 'Edit Assessment' : 'New Assessment' }}</h2>
        <a (click)="router.navigate(['/assessments'])" class="btn-link" style="cursor:pointer">← Assessments</a>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
        <div class="field">
          <label>Title <span class="req">*</span></label>
          <input formControlName="title" type="text" placeholder="Assessment title" />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <p class="field-error">Title is required.</p>
          }
        </div>

        <div class="field">
          <label>Description</label>
          <textarea formControlName="description" rows="3" placeholder="Optional description"></textarea>
        </div>

        <div class="field">
          <label>Time Limit (minutes) <span class="req">*</span></label>
          <input formControlName="timeLimitMinutes" type="number" min="1" placeholder="e.g. 60" />
          @if (form.get('timeLimitMinutes')?.invalid && form.get('timeLimitMinutes')?.touched) {
            <p class="field-error">Time limit must be a positive number.</p>
          }
        </div>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="saving()">
            {{ saving() ? 'Saving…' : (editId() ? 'Save Changes' : 'Create Assessment') }}
          </button>
          <button type="button" class="btn-secondary" (click)="router.navigate(['/assessments'])">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 600px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-link { color: var(--accent); text-decoration: none; }
    .form-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-weight: 600; font-size: 0.9rem; }
    .req { color: #b91c1c; }
    input, textarea { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; }
    .field-error { color: #b91c1c; font-size: 0.8rem; margin: 0; }
    .form-actions { display: flex; gap: 0.75rem; padding-top: 0.5rem; }
    .btn-primary { background: var(--accent); color: #fff; padding: 0.5rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: #e5e7eb; color: #374151; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    .error { color: #b91c1c; }
  `],
})
export class AssessmentFormComponent implements OnInit {
  private readonly svc = inject(AssessmentService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly editId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    timeLimitMinutes: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.svc.getAssessment(id).subscribe({
        next: a => this.form.patchValue({
          title: a.title,
          description: a.description ?? '',
          timeLimitMinutes: a.timeLimitMinutes,
        }),
        error: () => this.error.set('Failed to load assessment.'),
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    const req = {
      title: this.form.value.title!,
      description: this.form.value.description || null,
      timeLimitMinutes: this.form.value.timeLimitMinutes!,
      randomiseQuestions: false,
      randomisationQuotas: [],
    };

    const id = this.editId();
    const action = id ? this.svc.updateAssessment(id, req) : this.svc.createAssessment(req);

    action.subscribe({
      next: () => this.router.navigate(['/assessments']),
      error: err => { this.error.set(err?.error?.detail ?? 'Failed to save.'); this.saving.set(false); },
    });
  }
}
