import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { AssessmentPreview, PreviewQuestion } from '../../core/assessment/assessment.model';

@Component({
  selector: 'app-assessment-preview',
  imports: [RouterLink],
  template: `
    <div class="page">
      @if (preview()) {
        <div class="preview-header">
          <div>
            <span class="preview-label">Candidate Preview</span>
            <h2>{{ preview()!.title }}</h2>
            @if (preview()!.description) {
              <p class="desc">{{ preview()!.description }}</p>
            }
            <p class="meta">Time limit: {{ preview()!.timeLimitMinutes }} minutes</p>
          </div>
          <a [routerLink]="['/assessments', preview()!.id]" class="btn-link">← Builder</a>
        </div>

        <div class="questions-list">
          @for (q of preview()!.questions; track q.id; let i = $index) {
            <div class="question-card">
              <div class="question-header">
                <span class="q-number">{{ i + 1 }}</span>
                <span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabel(q) }}</span>
              </div>
              <p class="question-body">{{ q.body }}</p>

              @if (q.type === 'MCQ' && q.options) {
                <div class="options-list">
                  @for (opt of q.options; track opt.id; let j = $index) {
                    <div class="option-item">
                      <span class="option-letter">{{ optionLetter(j) }}</span>
                      <span>{{ opt.text }}</span>
                    </div>
                  }
                </div>
              }

              @if (q.type === 'TEXT') {
                <div class="answer-area">
                  <textarea rows="4" disabled placeholder="Candidate types their answer here…"></textarea>
                </div>
              }

              @if (q.type === 'CODE_SUBMISSION') {
                <div class="code-area">
                  @if (q.languageHint) {
                    <span class="lang-badge">{{ q.languageHint }}</span>
                  }
                  <textarea rows="6" disabled placeholder="Candidate submits code here…"></textarea>
                </div>
              }
            </div>
          }

          @if (preview()!.questions.length === 0) {
            <p class="status">No questions have been added to this assessment yet.</p>
          }
        </div>
      } @else if (loading()) {
        <p class="status">Loading preview…</p>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 800px; margin: 0 auto; }
    .preview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; }
    .preview-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #6d28d9; background: #ede9fe; padding: 0.2rem 0.6rem; border-radius: 4px; }
    h2 { margin: 0.5rem 0 0; }
    .desc { color: #6b7280; margin: 0.25rem 0 0; }
    .meta { color: #374151; font-weight: 600; margin: 0.5rem 0 0; }
    .btn-link { color: #2563eb; text-decoration: none; white-space: nowrap; padding-top: 0.25rem; }
    .questions-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .question-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; }
    .question-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .q-number { background: #2563eb; color: #fff; font-weight: 700; font-size: 0.85rem; width: 1.75rem; height: 1.75rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .type-badge { font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 10px; font-weight: 600; }
    .type-mcq { background: #dbeafe; color: #1e40af; }
    .type-text { background: #d1fae5; color: #065f46; }
    .type-code_submission { background: #fef3c7; color: #92400e; }
    .question-body { margin: 0 0 1rem; line-height: 1.6; }
    .options-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .option-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; }
    .option-letter { font-weight: 700; color: #374151; min-width: 1.25rem; }
    .answer-area, .code-area { margin-top: 0.5rem; }
    .code-area { display: flex; flex-direction: column; gap: 0.5rem; }
    .lang-badge { font-size: 0.75rem; background: #fef3c7; color: #92400e; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 600; align-self: flex-start; }
    textarea { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 0.9rem; resize: vertical; box-sizing: border-box; background: #f9fafb; color: #6b7280; }
    .status { color: #6b7280; text-align: center; padding: 2rem; }
    .error { color: #b91c1c; margin-top: 1rem; }
  `],
})
export class AssessmentPreviewComponent implements OnInit {
  private readonly svc = inject(AssessmentService);
  private readonly route = inject(ActivatedRoute);

  readonly preview = signal<AssessmentPreview | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.svc.getPreview(id).subscribe({
      next: p => { this.preview.set(p); this.loading.set(false); },
      error: () => { this.error.set('Failed to load preview.'); this.loading.set(false); },
    });
  }

  typeLabel(q: PreviewQuestion): string {
    return { MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code' }[q.type];
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
