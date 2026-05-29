import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../core/question/question.service';
import { QuestionGroup, QuestionGroupRequest } from '../../core/question/question.model';

@Component({
  selector: 'app-question-groups',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Question Groups</h1>
          <span class="page-sub">{{ groups().length }} groups</span>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New Group
        </button>
      </div>

      <div class="content">
        @if (showForm()) {
          <div class="form-card">
            <h2 class="form-title">{{ editingGroup() ? 'Edit Group' : 'New Group' }}</h2>

            <div class="field">
              <label class="field-label">Name <span class="required">*</span></label>
              <input type="text" [(ngModel)]="formName" class="field-input" placeholder="Group name" />
            </div>
            <div class="field">
              <label class="field-label">Description</label>
              <input type="text" [(ngModel)]="formDesc" class="field-input" placeholder="Optional description" />
            </div>
            <div class="field checkbox-field">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formStructured" class="checkbox-input" />
                <span class="checkbox-box"></span>
                Structured (ordered questions)
              </label>
            </div>

            @if (formError()) {
              <div class="error-banner">{{ formError() }}</div>
            }

            <div class="form-actions">
              <button class="btn btn-secondary" (click)="cancelForm()">Cancel</button>
              <button class="btn btn-primary" (click)="saveGroup()" [disabled]="saving()">
                {{ saving() ? 'Saving…' : 'Save Group' }}
              </button>
            </div>
          </div>
        }

        @if (loading()) {
          <div class="empty-state">Loading…</div>
        } @else if (groups().length === 0) {
          <div class="empty-state">No groups yet. Create one to organize your questions.</div>
        } @else {
          <div class="group-list">
            @for (g of groups(); track g.id) {
              <div class="group-card">
                <div class="group-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div class="group-info">
                  <div class="group-name-row">
                    <a [routerLink]="['/question-groups', g.id]" class="group-name">{{ g.name }}</a>
                    @if (g.structured) {
                      <span class="structured-badge">Structured</span>
                    }
                  </div>
                  <div class="group-meta">
                    <span>{{ g.questions.length }} question{{ g.questions.length !== 1 ? 's' : '' }}</span>
                    @if (g.description) {
                      <span class="meta-sep">·</span>
                      <span>{{ g.description }}</span>
                    }
                  </div>
                </div>
                <div class="group-actions">
                  <button class="action-btn" (click)="openEdit(g)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button class="action-btn danger" (click)="confirmDelete(g)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        @if (pageError()) {
          <div class="error-banner">{{ pageError() }}</div>
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
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: var(--bg-elevated); color: var(--text-1); border-color: var(--border); }
    .btn-secondary:hover { background: var(--bg-hover); }

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .form-card {
      max-width: 520px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px;
      margin-bottom: 20px;
    }

    .form-title { font-size: 14px; font-weight: 600; color: var(--text-1); margin: 0 0 16px; }

    .field { margin-bottom: 14px; }

    .field-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-2); margin-bottom: 6px; }

    .required { color: var(--danger); }

    .field-input {
      width: 100%; padding: 8px 12px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13.5px; outline: none; transition: border-color 150ms;
    }
    .field-input:focus { border-color: var(--accent); }
    .field-input::placeholder { color: var(--text-3); }

    .checkbox-field { margin-bottom: 16px; }
    .checkbox-label {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; font-size: 13px; color: var(--text-2);
    }
    .checkbox-input { display: none; }
    .checkbox-box {
      width: 16px; height: 16px; border-radius: 4px;
      border: 2px solid var(--border); flex-shrink: 0;
      transition: all 120ms; background: var(--bg-elevated);
    }
    .checkbox-input:checked + .checkbox-box {
      background: var(--accent); border-color: var(--accent);
    }

    .form-actions {
      display: flex; gap: 8px; justify-content: flex-end;
      padding-top: 14px; border-top: 1px solid var(--border);
    }

    .group-list { display: flex; flex-direction: column; gap: 10px; }

    .group-card {
      display: flex; align-items: center; gap: 14px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 18px;
      transition: border-color 150ms;
    }

    .group-card:hover { border-color: var(--border-hover); }

    .group-icon {
      width: 38px; height: 38px; border-radius: 9px;
      background: var(--accent-subtle); color: var(--accent);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .group-info { flex: 1; min-width: 0; }

    .group-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }

    .group-name {
      font-size: 14px; font-weight: 600; color: var(--text-1);
      text-decoration: none; transition: color 120ms;
    }
    .group-name:hover { color: var(--accent); }

    .structured-badge {
      font-size: 11px; padding: 2px 7px; border-radius: 999px;
      background: var(--accent-subtle); color: var(--accent); font-weight: 500;
    }

    .group-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-3); }

    .meta-sep { color: var(--text-3); }

    .group-actions { display: flex; gap: 6px; flex-shrink: 0; }

    .action-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 10px; background: transparent; color: var(--text-2);
      border: none; border-radius: var(--radius-sm); cursor: pointer;
      font-size: 12px; font-family: var(--font); transition: background 120ms, color 120ms;
    }
    .action-btn:hover { background: var(--bg-hover); color: var(--text-1); }
    .action-btn.danger:hover { color: var(--danger); background: var(--danger-subtle); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }

    .error-banner {
      padding: 10px 14px; background: var(--danger-subtle);
      border: 1px solid rgba(239,68,68,.25); border-radius: var(--radius-sm);
      color: var(--danger); font-size: 13px; margin-bottom: 16px;
    }
  `],
})
export class QuestionGroupsComponent implements OnInit {
  private readonly svc = inject(QuestionService);

  readonly groups = signal<QuestionGroup[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editingGroup = signal<QuestionGroup | null>(null);
  readonly formError = signal<string | null>(null);
  readonly pageError = signal<string | null>(null);

  formName = '';
  formDesc = '';
  formStructured = false;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.listGroups().subscribe({
      next: gs => { this.groups.set(gs); this.loading.set(false); },
      error: () => { this.pageError.set('Failed to load groups.'); this.loading.set(false); },
    });
  }

  openCreate() {
    this.editingGroup.set(null);
    this.formName = '';
    this.formDesc = '';
    this.formStructured = false;
    this.formError.set(null);
    this.showForm.set(true);
  }

  openEdit(g: QuestionGroup) {
    this.editingGroup.set(g);
    this.formName = g.name;
    this.formDesc = g.description ?? '';
    this.formStructured = g.structured;
    this.formError.set(null);
    this.showForm.set(true);
  }

  cancelForm() { this.showForm.set(false); }

  saveGroup() {
    if (!this.formName.trim()) { this.formError.set('Name is required.'); return; }
    const req: QuestionGroupRequest = {
      name: this.formName.trim(),
      description: this.formDesc.trim() || null,
      structured: this.formStructured,
    };
    this.saving.set(true);
    this.formError.set(null);
    const op = this.editingGroup()
      ? this.svc.updateGroup(this.editingGroup()!.id, req)
      : this.svc.createGroup(req);
    op.subscribe({
      next: () => { this.showForm.set(false); this.saving.set(false); this.load(); },
      error: err => {
        this.formError.set(err.status === 409 ? 'A group with that name already exists.' : 'Failed to save.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(g: QuestionGroup) {
    if (!confirm(`Delete group "${g.name}"?`)) return;
    this.svc.deleteGroup(g.id).subscribe({
      next: () => this.load(),
      error: () => this.pageError.set('Failed to delete group.'),
    });
  }
}
