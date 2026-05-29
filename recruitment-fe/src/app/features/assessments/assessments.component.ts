import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { Assessment } from '../../core/assessment/assessment.model';

@Component({
  selector: 'app-assessments',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Assessments</h2>
        <a routerLink="/assessments/new" class="btn-primary">+ New Assessment</a>
      </div>

      @if (loading()) {
        <p class="status">Loading…</p>
      } @else if (assessments().length === 0) {
        <p class="status">No assessments yet.</p>
      } @else {
        <table class="a-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Time Limit</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (a of assessments(); track a.id) {
              <tr>
                <td>{{ a.title }}</td>
                <td>{{ a.timeLimitMinutes }} min</td>
                <td>{{ a.questionCount }}</td>
                <td>
                  <span class="status-badge status-{{ a.status.toLowerCase() }}">{{ a.status }}</span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/assessments', a.id]" class="btn-sm">Builder</a>
                  <a [routerLink]="['/assessments', a.id, 'edit']" class="btn-sm">Edit</a>
                  @if (a.status === 'DRAFT') {
                    <button class="btn-sm publish" (click)="publish(a)">Publish</button>
                  }
                  <button class="btn-sm danger" (click)="confirmDelete(a)">Delete</button>
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
    .page { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-primary { background: #2563eb; color: #fff; padding: 0.5rem 1.25rem; border-radius: 6px; text-decoration: none; font-size: 0.9rem; }
    .a-table { width: 100%; border-collapse: collapse; }
    .a-table th, .a-table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
    .a-table th { font-weight: 600; background: #f9fafb; }
    .status-badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 10px; font-weight: 600; }
    .status-draft { background: #fef3c7; color: #92400e; }
    .status-published { background: #d1fae5; color: #065f46; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-sm { padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem; border: none; cursor: pointer; background: #e5e7eb; text-decoration: none; color: inherit; }
    .btn-sm.danger { background: #fee2e2; color: #b91c1c; }
    .btn-sm.publish { background: #d1fae5; color: #065f46; }
    .status { color: #6b7280; text-align: center; padding: 2rem; }
    .error { color: #b91c1c; margin-top: 1rem; }
  `],
})
export class AssessmentsComponent implements OnInit {
  private readonly svc = inject(AssessmentService);
  private readonly router = inject(Router);

  readonly assessments = signal<Assessment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.listAssessments().subscribe({
      next: list => { this.assessments.set(list); this.loading.set(false); },
      error: () => { this.error.set('Failed to load assessments.'); this.loading.set(false); },
    });
  }

  publish(a: Assessment) {
    this.error.set(null);
    this.svc.publishAssessment(a.id).subscribe({
      next: () => this.load(),
      error: err => this.error.set(err?.error?.detail ?? 'Failed to publish assessment.'),
    });
  }

  confirmDelete(a: Assessment) {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.svc.deleteAssessment(a.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Failed to delete assessment.'),
    });
  }
}
