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
        <h2>Question Groups</h2>
        <button class="btn-primary" (click)="openCreate()">+ New Group</button>
      </div>

      <!-- Create / Edit inline form -->
      @if (showForm()) {
        <div class="form-card">
          <h3>{{ editingGroup() ? 'Edit Group' : 'New Group' }}</h3>
          <div class="field">
            <label>Name</label>
            <input type="text" [(ngModel)]="formName" placeholder="Group name" />
          </div>
          <div class="field">
            <label>Description</label>
            <input type="text" [(ngModel)]="formDesc" placeholder="Optional description" />
          </div>
          <div class="field row">
            <input type="checkbox" id="structured" [(ngModel)]="formStructured" />
            <label for="structured">Structured (ordered questions)</label>
          </div>
          @if (formError()) {
            <p class="error">{{ formError() }}</p>
          }
          <div class="form-actions">
            <button class="btn-secondary" (click)="cancelForm()">Cancel</button>
            <button class="btn-primary" (click)="saveGroup()" [disabled]="saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      }

      @if (loading()) {
        <p class="status">Loading…</p>
      } @else if (groups().length === 0) {
        <p class="status">No groups yet.</p>
      } @else {
        <div class="group-list">
          @for (g of groups(); track g.id) {
            <div class="group-card">
              <div class="group-info">
                <a [routerLink]="['/question-groups', g.id]" class="group-name">{{ g.name }}</a>
                @if (g.structured) {
                  <span class="badge structured">Structured</span>
                }
                <span class="count">{{ g.questions.length }} question{{ g.questions.length !== 1 ? 's' : '' }}</span>
                @if (g.description) {
                  <p class="desc">{{ g.description }}</p>
                }
              </div>
              <div class="group-actions">
                <button class="btn-sm" (click)="openEdit(g)">Edit</button>
                <button class="btn-sm danger" (click)="confirmDelete(g)">Delete</button>
              </div>
            </div>
          }
        </div>
      }

      @if (pageError()) {
        <p class="error">{{ pageError() }}</p>
      }
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-primary { background: #2563eb; color: #fff; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    .btn-primary:disabled { opacity: 0.6; }
    .btn-secondary { background: #e5e7eb; color: #374151; padding: 0.5rem 1.25rem; border: none; border-radius: 6px; cursor: pointer; }
    .form-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .form-card h3 { margin: 0 0 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.75rem; }
    .field.row { flex-direction: row; align-items: center; gap: 0.5rem; }
    label { font-weight: 600; font-size: 0.9rem; }
    input[type=text] { padding: 0.45rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
    .group-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .group-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; }
    .group-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .group-name { font-weight: 600; color: #2563eb; text-decoration: none; font-size: 1rem; }
    .group-name:hover { text-decoration: underline; }
    .badge { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 10px; font-weight: 600; align-self: flex-start; }
    .structured { background: #ede9fe; color: #6d28d9; }
    .count { color: #6b7280; font-size: 0.85rem; }
    .desc { color: #6b7280; font-size: 0.85rem; margin: 0; }
    .group-actions { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem; border: none; cursor: pointer; background: #e5e7eb; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; }
    .status { color: #6b7280; text-align: center; padding: 2rem; }
    .error { color: #b91c1c; margin-top: 0.5rem; }
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
