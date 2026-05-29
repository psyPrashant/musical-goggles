import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../core/question/question.service';
import { GroupQuestion, Question, QuestionGroup } from '../../core/question/question.model';

@Component({
  selector: 'app-question-group-detail',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">
      @if (group()) {
        <div class="page-header">
          <div>
            <h2>
              {{ group()!.name }}
              @if (group()!.structured) {
                <span class="badge structured">Structured</span>
              }
            </h2>
            @if (group()!.description) {
              <p class="desc">{{ group()!.description }}</p>
            }
          </div>
          <a routerLink="/question-groups" class="btn-link">← Groups</a>
        </div>

        <!-- Questions in group -->
        <section>
          <h3>Questions ({{ group()!.questions.length }})</h3>
          @if (group()!.questions.length === 0) {
            <p class="status">No questions in this group yet.</p>
          } @else {
            <table class="q-table">
              <thead>
                <tr>
                  @if (group()!.structured) { <th>Order</th> }
                  <th>Title</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of group()!.questions; track item.questionId) {
                  <tr>
                    @if (group()!.structured) {
                      <td>
                        <input type="number" class="order-input"
                               [value]="item.displayOrder"
                               (change)="updateOrder(item, $event)" />
                      </td>
                    }
                    <td>{{ item.title }}</td>
                    <td><span class="type-badge type-{{ item.type.toLowerCase() }}">{{ item.type }}</span></td>
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
          <h3>Add Question</h3>
          <div class="add-row">
            <input type="text" [(ngModel)]="searchTerm" (input)="filterQuestions()"
                   placeholder="Search available questions…" class="search-input" />
          </div>
          @if (group()!.structured) {
            <div class="add-row">
              <label>Display order</label>
              <input type="number" [(ngModel)]="newDisplayOrder" class="order-input" min="1" />
            </div>
          }
          @if (filteredAvailable().length > 0) {
            <div class="available-list">
              @for (q of filteredAvailable(); track q.id) {
                <div class="available-item">
                  <span class="type-badge type-{{ q.type.toLowerCase() }} small">{{ q.type }}</span>
                  <span class="avail-title">{{ q.title }}</span>
                  <button class="btn-sm" (click)="addQuestion(q)">Add</button>
                </div>
              }
            </div>
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
    .page { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    h2 { margin: 0; display: flex; align-items: center; gap: 0.75rem; }
    .desc { color: #6b7280; margin: 0.25rem 0 0; font-size: 0.9rem; }
    .btn-link { color: #2563eb; text-decoration: none; white-space: nowrap; padding-top: 0.25rem; }
    .badge { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 10px; font-weight: 600; }
    .structured { background: #ede9fe; color: #6d28d9; }
    section { margin-bottom: 2rem; }
    h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .q-table { width: 100%; border-collapse: collapse; }
    .q-table th, .q-table td { text-align: left; padding: 0.65rem; border-bottom: 1px solid #e5e7eb; }
    .q-table th { font-weight: 600; background: #f9fafb; font-size: 0.85rem; }
    .order-input { width: 70px; padding: 0.3rem; border: 1px solid #d1d5db; border-radius: 4px; text-align: center; }
    .type-badge { font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 10px; font-weight: 600; }
    .type-mcq { background: #dbeafe; color: #1e40af; }
    .type-text { background: #d1fae5; color: #065f46; }
    .type-code_submission { background: #fef3c7; color: #92400e; }
    .btn-sm { padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem; border: none; cursor: pointer; background: #e5e7eb; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; }
    .add-section { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; }
    .add-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .add-row label { font-weight: 600; font-size: 0.85rem; white-space: nowrap; }
    .search-input { flex: 1; padding: 0.45rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
    .available-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 280px; overflow-y: auto; }
    .available-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; }
    .avail-title { flex: 1; font-size: 0.9rem; }
    .type-badge.small { font-size: 0.68rem; }
    .status { color: #6b7280; padding: 1rem 0; }
    .error { color: #b91c1c; margin-top: 0.5rem; }
  `],
})
export class QuestionGroupDetailComponent implements OnInit {
  private readonly svc = inject(QuestionService);
  private readonly route = inject(ActivatedRoute);

  readonly group = signal<QuestionGroup | null>(null);
  readonly allQuestions = signal<Question[]>([]);
  readonly filteredAvailable = signal<Question[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  searchTerm = '';
  newDisplayOrder: number | null = null;

  private groupId = '';

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id')!;
    this.loadGroup();
    this.svc.listQuestions().subscribe({ next: qs => { this.allQuestions.set(qs); this.filterQuestions(); } });
  }

  loadGroup() {
    this.loading.set(true);
    this.svc.getGroup(this.groupId).subscribe({
      next: g => { this.group.set(g); this.loading.set(false); this.filterQuestions(); },
      error: () => { this.error.set('Failed to load group.'); this.loading.set(false); },
    });
  }

  filterQuestions() {
    const memberIds = new Set((this.group()?.questions ?? []).map(q => q.questionId));
    const term = this.searchTerm.toLowerCase();
    this.filteredAvailable.set(
      this.allQuestions().filter(q => !memberIds.has(q.id) && (!term || q.title.toLowerCase().includes(term)))
    );
  }

  addQuestion(q: Question) {
    this.error.set(null);
    const displayOrder = this.group()?.structured ? this.newDisplayOrder ?? undefined : undefined;
    if (this.group()?.structured && displayOrder == null) {
      this.error.set('Enter a display order before adding to a structured group.');
      return;
    }
    this.svc.addQuestionToGroup(this.groupId, q.id, displayOrder ?? undefined).subscribe({
      next: updated => { this.group.set(updated); this.filterQuestions(); },
      error: err => this.error.set(err?.error?.detail ?? 'Failed to add question.'),
    });
  }

  removeQuestion(item: GroupQuestion) {
    if (!confirm(`Remove "${item.title}" from this group?`)) return;
    this.svc.removeQuestionFromGroup(this.groupId, item.questionId).subscribe({
      next: () => this.loadGroup(),
      error: () => this.error.set('Failed to remove question.'),
    });
  }

  updateOrder(item: GroupQuestion, event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (isNaN(val)) return;
    this.svc.addQuestionToGroup(this.groupId, item.questionId, val).subscribe({
      next: updated => { this.group.set(updated); this.filterQuestions(); },
      error: () => this.error.set('Failed to update order.'),
    });
  }
}
