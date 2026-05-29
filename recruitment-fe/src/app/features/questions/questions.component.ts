import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuestionService } from '../../core/question/question.service';
import { Question, QuestionType } from '../../core/question/question.model';

@Component({
  selector: 'app-questions',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Question Bank</h1>
          <span class="page-sub">{{ questions().length }} questions</span>
        </div>
        <a routerLink="/questions/new" class="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Add Question
        </a>
      </div>

      <div class="content">
        <div class="filter-row">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input class="search-input" [value]="search()" (input)="search.set($any($event.target).value)" placeholder="Search questions…"/>
          </div>
          <div class="type-filters">
            @for (f of typeFilters; track f.value) {
              <button class="filter-chip" [class.active]="selectedType() === f.value" (click)="setType(f.value)">{{ f.label }}</button>
            }
          </div>
        </div>

        @if (availableTags().length > 0) {
          <div class="tag-row">
            @for (tag of availableTags(); track tag) {
              <button class="cat-chip" [class.active]="selectedTag() === tag" (click)="toggleTag(tag)">{{ tag }}</button>
            }
          </div>
        }

        @if (loading()) {
          <div class="empty-state">Loading…</div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">No questions match your filters.</div>
        } @else {
          <div class="card-grid">
            @for (q of filtered(); track q.id) {
              <div class="q-card">
                <div class="q-card-top">
                  <span class="type-badge type-{{ q.type.toLowerCase() }}">{{ typeLabel(q.type) }}</span>
                  <span class="diff-badge diff-{{ diffLabel(q).toLowerCase() }}">{{ diffLabel(q) }}</span>
                </div>
                <p class="q-title">{{ q.title }}</p>
                <div class="q-card-footer">
                  @if (q.tags[0]) {
                    <span class="tag-pill">{{ q.tags[0] }}</span>
                  }
                  <span class="pts-label">10 pts</span>
                </div>
                <div class="q-actions">
                  <a [routerLink]="['/questions', q.id, 'edit']" class="action-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </a>
                  <button class="action-btn danger" (click)="confirmDelete(q)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
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

    .page-title { font-size: 15px; font-weight: 600; color: var(--text-1); letter-spacing: -0.01em; }
    .page-sub { font-size: 12px; color: var(--text-3); }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500; cursor: pointer;
      border: 1px solid transparent; transition: all 120ms;
      text-decoration: none; white-space: nowrap;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-hover); }

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .filter-row {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 14px;
    }

    .search-wrap {
      position: relative; display: flex; align-items: center;
    }

    .search-icon {
      position: absolute; left: 10px; color: var(--text-3); pointer-events: none;
    }

    .search-input {
      padding: 7px 10px 7px 32px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13px; outline: none; width: 240px; transition: border-color 150ms;
    }

    .search-input:focus { border-color: var(--accent); }
    .search-input::placeholder { color: var(--text-3); }

    .type-filters { display: flex; gap: 5px; }

    .filter-chip {
      padding: 5px 12px; border-radius: 999px; cursor: pointer;
      font-family: var(--font); font-size: 12.5px; font-weight: 400;
      background: transparent; color: var(--text-2); border: 1px solid var(--border);
      transition: all 120ms; display: flex; align-items: center; gap: 5px;
    }

    .filter-chip:hover { background: var(--bg-hover); color: var(--text-1); }
    .filter-chip.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); font-weight: 600; }

    .tag-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 18px; }

    .cat-chip {
      padding: 3px 11px; border-radius: 999px; cursor: pointer;
      font-family: var(--font); font-size: 12px;
      background: transparent; color: var(--text-3); border: 1px solid var(--border);
      transition: all 100ms;
    }

    .cat-chip:hover { background: var(--bg-hover); color: var(--text-1); }
    .cat-chip.active { background: var(--bg-elevated); color: var(--text-1); border-color: var(--border-hover); }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
    }

    .q-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 16px;
      display: flex; flex-direction: column; gap: 10px;
      transition: border-color 150ms;
    }

    .q-card:hover { border-color: var(--border-hover); }

    .q-card-top { display: flex; gap: 6px; }

    .type-badge {
      display: inline-flex; align-items: center; padding: 2px 8px;
      border-radius: 999px; font-size: 11.5px; font-weight: 500; white-space: nowrap;
    }

    .type-mcq { background: var(--accent-subtle); color: var(--accent); }
    .type-text { background: var(--info-subtle); color: var(--info); }
    .type-code_submission { background: rgba(168,85,247,0.13); color: #a855f7; }

    .diff-badge {
      display: inline-flex; padding: 2px 8px; border-radius: 999px;
      font-size: 11.5px; font-weight: 500;
    }

    .diff-easy { background: var(--success-subtle); color: var(--success); }
    .diff-medium { background: var(--warning-subtle); color: var(--warning); }
    .diff-hard { background: var(--danger-subtle); color: var(--danger); }

    .q-title { font-size: 13.5px; color: var(--text-1); line-height: 1.5; font-weight: 500; flex: 1; }

    .q-card-footer {
      display: flex; justify-content: space-between; align-items: center;
    }

    .tag-pill {
      padding: 2px 8px; background: var(--bg); border: 1px solid var(--border);
      border-radius: 999px; font-size: 11px; color: var(--text-3); white-space: nowrap;
    }

    .pts-label { font-size: 11.5px; color: var(--text-3); }

    .q-actions {
      display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid var(--border);
    }

    .action-btn {
      display: inline-flex; align-items: center; gap: 5px; flex: 1; justify-content: center;
      padding: 5px 10px; background: transparent; color: var(--text-2);
      border: none; border-radius: var(--radius-sm); cursor: pointer;
      font-size: 12px; font-family: var(--font); transition: background 120ms, color 120ms;
      text-decoration: none;
    }

    .action-btn:hover { background: var(--bg-hover); color: var(--text-1); }
    .action-btn.danger { flex: 0; }
    .action-btn.danger:hover { color: var(--danger); background: var(--danger-subtle); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }

    .error-banner {
      margin-top: 16px; padding: 10px 14px;
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,.25);
      border-radius: var(--radius-sm); color: var(--danger); font-size: 13px;
    }
  `],
})
export class QuestionsComponent implements OnInit {
  private readonly svc = inject(QuestionService);

  readonly questions = signal<Question[]>([]);
  readonly availableTags = signal<string[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly selectedType = signal('');
  readonly selectedTag = signal('');

  readonly typeFilters = [
    { value: '', label: 'All Types' },
    { value: 'MCQ', label: 'MCQ' },
    { value: 'TEXT', label: 'Text' },
    { value: 'CODE_SUBMISSION', label: 'Code' },
  ];

  readonly filtered = computed(() => {
    const s = this.search().toLowerCase();
    return this.questions().filter(q => !s || q.title.toLowerCase().includes(s));
  });

  ngOnInit() {
    this.loadTags();
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .listQuestions(this.selectedType() || undefined, this.selectedTag() || undefined)
      .subscribe({
        next: qs => { this.questions.set(qs); this.loading.set(false); },
        error: () => { this.error.set('Failed to load questions.'); this.loading.set(false); },
      });
  }

  loadTags() {
    this.svc.listTags().subscribe({ next: tags => this.availableTags.set(tags) });
  }

  setType(type: string) {
    this.selectedType.set(type);
    this.load();
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

  diffLabel(q: Question): string {
    const n = q.tags.length;
    if (n >= 3) return 'Hard';
    if (n === 2) return 'Medium';
    return 'Easy';
  }
}
