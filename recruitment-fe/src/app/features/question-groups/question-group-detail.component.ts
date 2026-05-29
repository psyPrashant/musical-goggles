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
      <div class="page-header">
        <div class="header-left">
          @if (group()) {
            <h1 class="page-title">
              {{ group()!.name }}
              @if (group()!.structured) {
                <span class="structured-badge">Structured</span>
              }
            </h1>
            @if (group()!.description) {
              <span class="page-sub">{{ group()!.description }}</span>
            }
          }
        </div>
        <a routerLink="/question-groups" class="btn btn-ghost btn-sm">← Groups</a>
      </div>

      <div class="content">
        @if (loading()) {
          <div class="empty-state">Loading…</div>
        } @else if (group()) {
          <div class="layout">
            <div class="main-panel">
              <div class="section-header">
                <span class="section-title">Questions in Group</span>
                <span class="section-count">{{ group()!.questions.length }}</span>
              </div>

              @if (group()!.questions.length === 0) {
                <div class="empty-panel">No questions yet. Add from the bank on the right.</div>
              } @else {
                <div class="question-list">
                  @for (item of group()!.questions; track item.questionId) {
                    <div class="question-row">
                      <div class="drag-handle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01"/>
                        </svg>
                      </div>
                      @if (group()!.structured) {
                        <input type="number" class="order-input"
                               [value]="item.displayOrder"
                               (change)="updateOrder(item, $event)" />
                      }
                      <div class="question-info">
                        <span class="type-badge type-{{ item.type.toLowerCase() }}">{{ typeLabel(item.type) }}</span>
                        <span class="question-title">{{ item.title }}</span>
                      </div>
                      <button class="remove-btn" (click)="removeQuestion(item)" title="Remove">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="bank-panel">
              <div class="section-header">
                <span class="section-title">Question Bank</span>
              </div>
              <div class="bank-search-wrap">
                <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" [(ngModel)]="searchTerm" (input)="filterQuestions()"
                       placeholder="Search questions…" class="bank-search" />
              </div>

              @if (group()!.structured) {
                <div class="order-row">
                  <label class="order-label">Display order</label>
                  <input type="number" [(ngModel)]="newDisplayOrder" class="order-input" min="1" placeholder="#" />
                </div>
              }

              @if (filteredAvailable().length === 0) {
                <div class="empty-bank">No questions available to add.</div>
              } @else {
                <div class="bank-list">
                  @for (q of filteredAvailable(); track q.id) {
                    <div class="bank-item">
                      <div class="bank-item-info">
                        <span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabel(q.type) }}</span>
                        <span class="bank-title">{{ q.title }}</span>
                      </div>
                      <button class="add-btn" (click)="addQuestion(q)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          @if (error()) {
            <div class="error-banner">{{ error() }}</div>
          }
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

    .page-title {
      font-size: 15px; font-weight: 600; color: var(--text-1); letter-spacing: -0.01em;
      display: flex; align-items: center; gap: 8px; margin: 0;
    }

    .page-sub { font-size: 12px; color: var(--text-3); }

    .structured-badge {
      font-size: 11px; padding: 2px 7px; border-radius: 999px;
      background: var(--accent-subtle); color: var(--accent); font-weight: 500;
    }

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

    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }

    .section-header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 12px;
    }

    .section-title { font-size: 13px; font-weight: 600; color: var(--text-2); }

    .section-count {
      font-size: 11px; padding: 1px 7px; border-radius: 999px;
      background: var(--bg-elevated); color: var(--text-3);
    }

    .question-list { display: flex; flex-direction: column; gap: 6px; }

    .question-row {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 10px 12px;
      transition: border-color 150ms;
    }
    .question-row:hover { border-color: var(--border-hover); }

    .drag-handle { color: var(--text-3); cursor: grab; flex-shrink: 0; }

    .order-input {
      width: 54px; padding: 5px 8px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 12px; text-align: center; outline: none;
    }
    .order-input:focus { border-color: var(--accent); }

    .question-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }

    .question-title {
      font-size: 13px; color: var(--text-1); white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }

    .type-badge {
      display: inline-flex; align-items: center; padding: 2px 7px;
      border-radius: 999px; font-size: 11px; font-weight: 500; white-space: nowrap; flex-shrink: 0;
    }
    .type-mcq { background: var(--accent-subtle); color: var(--accent); }
    .type-text { background: var(--info-subtle); color: var(--info); }
    .type-code_submission { background: rgba(168,85,247,0.13); color: #a855f7; }

    .remove-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      border-radius: 4px; display: flex; align-items: center; color: var(--text-3);
      transition: color 120ms, background 120ms; flex-shrink: 0;
    }
    .remove-btn:hover { color: var(--danger); background: var(--danger-subtle); }

    .bank-panel {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px;
      position: sticky; top: 0;
    }

    .bank-search-wrap {
      position: relative; display: flex; align-items: center; margin-bottom: 10px;
    }

    .search-icon { position: absolute; left: 10px; color: var(--text-3); pointer-events: none; }

    .bank-search {
      width: 100%; padding: 7px 10px 7px 30px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 12.5px; outline: none; transition: border-color 150ms;
    }
    .bank-search:focus { border-color: var(--accent); }
    .bank-search::placeholder { color: var(--text-3); }

    .order-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    }
    .order-label { font-size: 12px; font-weight: 500; color: var(--text-2); white-space: nowrap; }

    .bank-list {
      display: flex; flex-direction: column; gap: 5px;
      max-height: 420px; overflow-y: auto;
    }

    .bank-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); transition: border-color 150ms;
    }
    .bank-item:hover { border-color: var(--border-hover); }

    .bank-item-info { display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0; }

    .bank-title {
      font-size: 12.5px; color: var(--text-1); white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }

    .add-btn {
      background: var(--accent-subtle); border: none; cursor: pointer; padding: 5px;
      border-radius: 4px; display: flex; align-items: center; color: var(--accent);
      transition: background 120ms; flex-shrink: 0;
    }
    .add-btn:hover { background: var(--accent); color: #fff; }

    .empty-panel {
      padding: 24px 0; text-align: center; color: var(--text-3); font-size: 12.5px;
    }

    .empty-bank { padding: 16px 0; text-align: center; color: var(--text-3); font-size: 12.5px; }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }

    .error-banner {
      margin-top: 16px; padding: 10px 14px;
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,.25);
      border-radius: var(--radius-sm); color: var(--danger); font-size: 13px;
    }
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

  typeLabel(type: string): string {
    return { MCQ: 'MCQ', TEXT: 'Text', CODE_SUBMISSION: 'Code' }[type] ?? type;
  }
}
