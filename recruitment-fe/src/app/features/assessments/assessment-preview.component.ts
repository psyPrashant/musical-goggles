import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { AssessmentPreview, PreviewQuestion } from '../../core/assessment/assessment.model';

@Component({
  selector: 'app-assessment-preview',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="header-left">
          <span class="preview-label">Candidate Preview</span>
          @if (preview()) {
            <h1 class="page-title">{{ preview()!.title }}</h1>
          }
        </div>
        @if (preview()) {
          <a [routerLink]="['/assessments', preview()!.id]" class="btn btn-ghost btn-sm">← Builder</a>
        }
      </div>

      <div class="content">
        @if (loading()) {
          <div class="empty-state">Loading preview…</div>
        } @else if (preview()) {
          <div class="preview-wrap">
            <div class="assessment-info-card">
              @if (preview()!.description) {
                <p class="assessment-desc">{{ preview()!.description }}</p>
              }
              <div class="assessment-meta">
                <div class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  {{ preview()!.timeLimitMinutes }} minutes
                </div>
                <div class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  {{ preview()!.questions.length }} questions
                </div>
              </div>
            </div>

            @if (preview()!.questions.length === 0) {
              <div class="empty-state">No questions have been added to this assessment yet.</div>
            } @else {
              <div class="questions-list">
                @for (q of preview()!.questions; track q.id; let i = $index) {
                  <div class="question-card">
                    <div class="question-header">
                      <div class="q-number">{{ i + 1 }}</div>
                      <span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabel(q) }}</span>
                    </div>
                    <p class="question-body">{{ q.body }}</p>

                    @if (q.type === 'MCQ' && q.options) {
                      <div class="options-list">
                        @for (opt of q.options; track opt.id; let j = $index) {
                          <div class="option-item">
                            <div class="option-radio"></div>
                            <span class="option-letter">{{ optionLetter(j) }}</span>
                            <span class="option-text">{{ opt.text }}</span>
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
                        <textarea rows="6" disabled placeholder="Candidate submits code here…" class="code-textarea"></textarea>
                      </div>
                    }

                    @if (q.type === 'GROUP' && q.subQuestions) {
                      <div class="sub-questions">
                        @for (sub of q.subQuestions; track sub.id; let j = $index) {
                          <div class="sub-q-card">
                            <div class="sub-q-header">
                              <span class="sub-q-num">{{ j + 1 }}</span>
                              <span class="type-badge type-{{ sub.type.toLowerCase() }}">{{ typeLabel(sub) }}</span>
                            </div>
                            <p class="sub-q-body">{{ sub.body }}</p>
                            @if (sub.type === 'MCQ' && sub.options) {
                              <div class="sub-q-option-list">
                                @for (opt of sub.options; track opt.id; let k = $index) {
                                  <div class="sub-q-option-item">
                                    <span class="option-letter">{{ optionLetter(k) }}.</span>
                                    <span class="option-text">{{ opt.text }}</span>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        @if (error()) {
          <div class="error-banner">{{ error() }}</div>
        }
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

    .header-left { display: flex; flex-direction: column; gap: 1px; }

    .preview-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--accent); background: var(--accent-subtle);
      padding: 2px 7px; border-radius: 999px; align-self: flex-start;
    }

    .page-title { font-size: 15px; font-weight: 600; color: var(--text-1); letter-spacing: -0.01em; margin: 0; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500; cursor: pointer;
      border: 1px solid transparent; transition: all 120ms;
      text-decoration: none; white-space: nowrap;
    }
    .btn-sm { padding: 5px 11px; font-size: 12px; }
    .btn-ghost { background: transparent; color: var(--text-2); }
    .btn-ghost:hover { background: var(--bg-hover); color: var(--text-1); }

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .preview-wrap { max-width: 720px; }

    .assessment-info-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px 20px;
      margin-bottom: 20px;
    }

    .assessment-desc { font-size: 13.5px; color: var(--text-2); line-height: 1.6; margin: 0 0 12px; }

    .assessment-meta { display: flex; gap: 20px; }

    .meta-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 12.5px; color: var(--text-3);
    }

    .questions-list { display: flex; flex-direction: column; gap: 14px; }

    .question-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
    }

    .question-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }

    .q-number {
      background: var(--accent); color: #fff;
      font-weight: 700; font-size: 12px;
      width: 24px; height: 24px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .type-badge {
      display: inline-flex; align-items: center; padding: 2px 8px;
      border-radius: 999px; font-size: 11.5px; font-weight: 500;
    }
    .type-mcq { background: var(--accent-subtle); color: var(--accent); }
    .type-text { background: var(--info-subtle); color: var(--info); }
    .type-code_submission { background: rgba(168,85,247,0.13); color: #a855f7; }

    .question-body { font-size: 13.5px; color: var(--text-1); line-height: 1.65; margin: 0 0 14px; }

    .options-list { display: flex; flex-direction: column; gap: 7px; }

    .option-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); cursor: default;
    }

    .option-radio {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid var(--border); flex-shrink: 0;
    }

    .option-letter { font-size: 12px; font-weight: 600; color: var(--text-3); width: 16px; }

    .option-text { font-size: 13px; color: var(--text-1); }

    .answer-area, .code-area { display: flex; flex-direction: column; gap: 8px; }

    textarea {
      width: 100%; padding: 10px 12px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-3);
      font-size: 13px; resize: vertical; box-sizing: border-box;
      font-family: var(--font); line-height: 1.6;
    }

    .code-textarea { font-family: var(--font-mono); font-size: 12.5px; }

    .lang-badge {
      font-size: 11.5px; background: rgba(168,85,247,0.13); color: #a855f7;
      padding: 2px 8px; border-radius: 999px; font-weight: 500; align-self: flex-start;
    }

    .sub-questions { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border); padding-top: 12px; }

    .sub-q-card { background: var(--bg-elevated); border-radius: var(--radius-sm); padding: 12px 14px; }

    .sub-q-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

    .sub-q-num { font-size: 11px; color: var(--text-3); font-weight: 600; }

    .sub-q-body { font-size: 13px; color: var(--text-1); line-height: 1.6; margin: 0 0 8px; }

    .sub-q-option-list { display: flex; flex-direction: column; gap: 5px; }

    .sub-q-option-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--text-1); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }

    .error-banner {
      margin-top: 16px; padding: 10px 14px;
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,.25);
      border-radius: var(--radius-sm); color: var(--danger); font-size: 13px;
    }
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
    return ({ MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code', GROUP: 'Group' } as Record<string, string>)[q.type] ?? q.type;
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
