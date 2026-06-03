import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { QuestionService } from '../../core/question/question.service';
import { AssessmentDetail, AssessmentQuestion } from '../../core/assessment/assessment.model';
import { Difficulty, Question, QuestionType } from '../../core/question/question.model';

@Component({
  selector: 'app-assessment-detail',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">
      @if (assessment()) {
        <div class="page-header">
          <div>
            <h2>
              {{ assessment()!.title }}
              <span class="status-badge status-{{ assessment()!.status.toLowerCase() }}">
                {{ assessment()!.status }}
              </span>
            </h2>
            @if (assessment()!.description) {
              <p class="desc">{{ assessment()!.description }}</p>
            }
            <p class="meta">{{ assessment()!.timeLimitMinutes }} min</p>
          </div>
          <div class="header-actions">
            <a [routerLink]="['/assessments', assessment()!.id, 'preview']" class="btn-sm preview">Preview</a>
            <a [routerLink]="['/assessments', assessment()!.id, 'edit']" class="btn-sm">Edit</a>
            <a routerLink="/assessments" class="btn-link">← Assessments</a>
          </div>
        </div>

        <!-- Questions in assessment -->
        <section>
          <h3>Questions ({{ assessment()!.questions.length }})</h3>
          @if (assessment()!.questions.length === 0) {
            <p class="status">No questions yet. Add some from the bank below.</p>
          } @else {
            <table class="q-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of assessment()!.questions; track item.questionId) {
                  <tr>
                    <td>{{ item.displayOrder }}</td>
                    <td>{{ item.title }}</td>
                    <td>
                      <span class="type-badge type-{{ item.type.toLowerCase() }}">{{ typeLabel(item.type) }}</span>
                    </td>
                    <td>
                      @if (item.difficulty) {
                        <span class="diff-badge diff-{{ item.difficulty.toLowerCase() }}">{{ diffLabel(item.difficulty) }}</span>
                      }
                    </td>
                    <td>
                      <button class="btn-sm danger" (click)="removeQuestion(item)">Remove</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </section>

        <!-- Add question panel -->
        <section class="add-section">
          <h3>Add Question from Bank</h3>
          <div class="add-controls">
            <input type="text" [(ngModel)]="searchTerm" (input)="filterQuestions()"
                   placeholder="Search questions…" class="search-input" />
            <select [(ngModel)]="filterType" (ngModelChange)="filterQuestions()">
              <option value="">All types</option>
              <option value="MCQ">MCQ</option>
              <option value="TEXT">Text</option>
              <option value="CODE_SUBMISSION">Code Submission</option>
            </select>
            <select [(ngModel)]="filterDifficulty" (ngModelChange)="filterQuestions()">
              <option value="">All difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          @if (filteredAvailable().length > 0) {
            <div class="available-list">
              @for (q of filteredAvailable(); track q.id) {
                <div class="available-item">
                  <span class="type-badge type-{{ q.type.toLowerCase() }} small">{{ typeLabel(q.type) }}</span>
                  @if (q.difficulty) {
                    <span class="diff-badge diff-{{ q.difficulty.toLowerCase() }} small">{{ diffLabel(q.difficulty) }}</span>
                  }
                  <span class="avail-title">{{ q.title }}</span>
                  <input type="number" class="order-input" [(ngModel)]="newOrder[q.id]"
                         placeholder="Order" min="1" />
                  <button class="btn-sm" (click)="addQuestion(q)">Add</button>
                </div>
              }
            </div>
          } @else {
            <p class="status">No available questions match the filter.</p>
          }
        </section>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
      } @else if (loading()) {
        <p class="status">Loading…</p>
      }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    h2 { margin: 0; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .desc { color: #6b7280; margin: 0.25rem 0 0; font-size: 0.9rem; }
    .meta { color: #6b7280; font-size: 0.85rem; margin: 0.2rem 0 0; }
    .header-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
    .btn-link { color: #2563eb; text-decoration: none; white-space: nowrap; }
    .status-badge { font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 10px; font-weight: 600; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-published { background: #d1fae5; color: #065f46; }
    section { margin-bottom: 2rem; }
    h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .q-table { width: 100%; border-collapse: collapse; }
    .q-table th, .q-table td { text-align: left; padding: 0.65rem; border-bottom: 1px solid #e5e7eb; }
    .q-table th { font-weight: 600; background: #f9fafb; font-size: 0.85rem; }
    .type-badge { font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 10px; font-weight: 600; }
    .type-mcq { background: #dbeafe; color: #1e40af; }
    .type-text { background: #d1fae5; color: #065f46; }
    .type-code_submission { background: #fef3c7; color: #92400e; }
    .btn-sm { padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem; border: none; cursor: pointer; background: #e5e7eb; text-decoration: none; color: inherit; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; }
    .btn-sm.preview { background: #ede9fe; color: #6d28d9; }
    .btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }
    .add-section { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; }
    .add-controls { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; padding: 0.45rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; }
    select { padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; }
    .available-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 320px; overflow-y: auto; }
    .available-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; }
    .diff-badge { font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 10px; font-weight: 600; }
    .diff-badge.small { font-size: 0.68rem; }
    .diff-easy { background: #d1fae5; color: #065f46; }
    .diff-medium { background: #fef3c7; color: #92400e; }
    .diff-hard { background: #fee2e2; color: #b91c1c; }
    .avail-title { flex: 1; font-size: 0.9rem; }
    .order-input { width: 70px; padding: 0.3rem; border: 1px solid #d1d5db; border-radius: 4px; text-align: center; }
    .type-badge.small { font-size: 0.68rem; }
    .limit-warning { color: #92400e; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; margin-bottom: 0.75rem; }
    .status { color: #6b7280; padding: 1rem 0; }
    .error { color: #b91c1c; margin-top: 0.5rem; }
  `],
})
export class AssessmentDetailComponent implements OnInit {
  private readonly svc = inject(AssessmentService);
  private readonly questionSvc = inject(QuestionService);
  private readonly route = inject(ActivatedRoute);

  readonly assessment = signal<AssessmentDetail | null>(null);
  readonly allQuestions = signal<Question[]>([]);
  readonly filteredAvailable = signal<Question[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  searchTerm = '';
  filterType = '';
  filterDifficulty: Difficulty | '' = '';
  newOrder: Record<string, number | null> = {};

  private assessmentId = '';

  ngOnInit() {
    this.assessmentId = this.route.snapshot.paramMap.get('id')!;
    this.loadAssessment();
    this.questionSvc.listQuestions().subscribe({
      next: qs => { this.allQuestions.set(qs); this.filterQuestions(); },
    });
  }

  loadAssessment() {
    this.loading.set(true);
    this.svc.getAssessment(this.assessmentId).subscribe({
      next: a => {
        this.assessment.set(a);
        this.loading.set(false);
        this.filterQuestions();
      },
      error: () => { this.error.set('Failed to load assessment.'); this.loading.set(false); },
    });
  }

  filterQuestions() {
    const memberIds = new Set((this.assessment()?.questions ?? []).map(q => q.questionId));
    const term = this.searchTerm.toLowerCase();
    this.filteredAvailable.set(
      this.allQuestions().filter(q =>
        !memberIds.has(q.id) &&
        (!term || q.title.toLowerCase().includes(term)) &&
        (!this.filterType || q.type === this.filterType) &&
        (!this.filterDifficulty || q.difficulty === this.filterDifficulty)
      )
    );
  }

  diffLabel(difficulty: Difficulty | null): string {
    if (!difficulty) return '';
    return { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' }[difficulty] ?? '';
  }

  addQuestion(q: Question) {
    this.error.set(null);
    const order = this.newOrder[q.id];
    if (!order || order < 1) {
      this.error.set('Enter a display order (positive number) before adding.');
      return;
    }
    this.svc.addQuestion(this.assessmentId, { questionId: q.id, displayOrder: order }).subscribe({
      next: updated => {
        this.assessment.set(updated);
        this.filterQuestions();
        delete this.newOrder[q.id];
      },
      error: err => this.error.set(err?.error?.detail ?? 'Failed to add question.'),
    });
  }

  removeQuestion(item: AssessmentQuestion) {
    if (!confirm(`Remove "${item.title}" from this assessment?`)) return;
    this.svc.removeQuestion(this.assessmentId, item.questionId).subscribe({
      next: () => this.loadAssessment(),
      error: () => this.error.set('Failed to remove question.'),
    });
  }

  typeLabel(type: QuestionType): string {
    return ({ MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code', GROUP: 'Group' } as Record<string, string>)[type] ?? type;
  }

}
