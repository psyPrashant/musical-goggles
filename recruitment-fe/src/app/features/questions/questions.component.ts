import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../core/question/question.service';
import { Question, QuestionType } from '../../core/question/question.model';

@Component({
  selector: 'app-questions',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Question Bank</h2>
        <a routerLink="/questions/new" class="btn-primary">+ New Question</a>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="selectedType" (ngModelChange)="load()">
          <option value="">All types</option>
          <option value="MCQ">MCQ</option>
          <option value="TEXT">Text</option>
          <option value="CODE_SUBMISSION">Code Submission</option>
        </select>

        <div class="tag-filters">
          @for (tag of availableTags(); track tag) {
            <button
              class="tag-chip"
              [class.active]="selectedTag() === tag"
              (click)="toggleTag(tag)">
              {{ tag }}
            </button>
          }
        </div>
      </div>

      <!-- List -->
      @if (loading()) {
        <p class="status">Loading…</p>
      } @else if (questions().length === 0) {
        <p class="status">No questions found.</p>
      } @else {
        <table class="q-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (q of questions(); track q.id) {
              <tr>
                <td><span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabel(q.type) }}</span></td>
                <td>{{ q.title }}</td>
                <td>
                  @for (tag of q.tags; track tag) {
                    <span class="tag-chip small">{{ tag }}</span>
                  }
                </td>
                <td class="actions">
                  <a [routerLink]="['/questions', q.id, 'edit']" class="btn-sm">Edit</a>
                  <button class="btn-sm danger" (click)="confirmDelete(q)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-primary { background: #2563eb; color: #fff; padding: 0.5rem 1.25rem; border-radius: 6px; text-decoration: none; font-size: 0.9rem; }
    .filters { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
    select { padding: 0.4rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; }
    .tag-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .tag-chip { background: #e5e7eb; border: 1px solid #d1d5db; border-radius: 12px; padding: 0.2rem 0.75rem; font-size: 0.8rem; cursor: pointer; }
    .tag-chip.active { background: #2563eb; color: #fff; border-color: #2563eb; }
    .tag-chip.small { font-size: 0.75rem; padding: 0.15rem 0.5rem; cursor: default; }
    .q-table { width: 100%; border-collapse: collapse; }
    .q-table th, .q-table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
    .q-table th { font-weight: 600; background: #f9fafb; }
    .type-badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 10px; font-weight: 600; }
    .type-mcq { background: #dbeafe; color: #1e40af; }
    .type-text { background: #d1fae5; color: #065f46; }
    .type-code_submission { background: #fef3c7; color: #92400e; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem; border: none; cursor: pointer; background: #e5e7eb; text-decoration: none; color: inherit; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; }
    .status { color: #6b7280; text-align: center; padding: 2rem; }
    .error { color: #b91c1c; margin-top: 1rem; }
  `],
})
export class QuestionsComponent implements OnInit {
  private readonly svc = inject(QuestionService);
  private readonly router = inject(Router);

  readonly questions = signal<Question[]>([]);
  readonly availableTags = signal<string[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  selectedType = '';
  readonly selectedTag = signal('');

  ngOnInit() {
    this.loadTags();
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.listQuestions(this.selectedType || undefined, this.selectedTag() || undefined).subscribe({
      next: qs => { this.questions.set(qs); this.loading.set(false); },
      error: () => { this.error.set('Failed to load questions.'); this.loading.set(false); },
    });
  }

  loadTags() {
    this.svc.listTags().subscribe({ next: tags => this.availableTags.set(tags) });
  }

  toggleTag(tag: string) {
    this.selectedTag.set(this.selectedTag() === tag ? '' : tag);
    this.load();
  }

  confirmDelete(q: Question) {
    if (!confirm(`Delete "${q.title}"?`)) return;
    this.svc.deleteQuestion(q.id).subscribe({
      next: () => { this.load(); this.loadTags(); },
      error: () => this.error.set('Failed to delete question.'),
    });
  }

  typeLabel(type: QuestionType): string {
    return { MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code' }[type];
  }
}
