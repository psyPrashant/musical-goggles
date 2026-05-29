import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <div class="header">
        <h2>Dashboard</h2>
        <button class="btn-logout" (click)="auth.logout()">Logout</button>
      </div>
      <nav class="nav-cards">
        <a routerLink="/questions" class="nav-card">
          <span class="icon">❓</span>
          <span class="label">Question Bank</span>
          <span class="sub">Create and manage questions</span>
        </a>
        <a routerLink="/question-groups" class="nav-card">
          <span class="icon">📦</span>
          <span class="label">Question Groups</span>
          <span class="sub">Organise questions into groups</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h2 { margin: 0; }
    .btn-logout { background: none; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.4rem 1rem; cursor: pointer; color: #374151; }
    .nav-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
    .nav-card { display: flex; flex-direction: column; gap: 0.35rem; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 10px; text-decoration: none; color: inherit; transition: box-shadow 0.15s; }
    .nav-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .icon { font-size: 1.75rem; }
    .label { font-weight: 700; font-size: 1rem; }
    .sub { color: #6b7280; font-size: 0.85rem; }
  `],
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
