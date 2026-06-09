import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { ToastComponent } from '../core/toast/toast.component';
import { ThemeService } from '../core/theme/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <img
            class="logo-img"
            [src]="theme.isDark()
              ? 'https://psybergate.co.za/wp-content/uploads/2018/09/psybergate-wht-footer.png'
              : 'https://psybergate.co.za/wp-content/uploads/2018/09/psybergate-60.png'"
            alt="Psybergate"
          />
          <span class="logo-sub">Recruitment Portal</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/assessments" routerLinkActive="nav-active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            Assessments
          </a>
          <a routerLink="/questions" routerLinkActive="nav-active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <path d="M9 9h6M9 12h4"/>
            </svg>
            Question Bank
          </a>
          <a routerLink="/candidates" routerLinkActive="nav-active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Candidates
          </a>
          <a routerLink="/results" routerLinkActive="nav-active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            Results
          </a>
          <a routerLink="/completed-assessments" routerLinkActive="nav-active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Completed
          </a>
          <a routerLink="/flagged-submissions" routerLinkActive="nav-active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            Flagged
          </a>
          @if (auth.role() === 'ADMIN') {
            <a routerLink="/staff" routerLinkActive="nav-active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Staff
            </a>
          }
        </nav>

        <div class="sidebar-user">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info">
            <span class="user-name">{{ auth.displayName() }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
          <button class="theme-btn" (click)="theme.toggle()" [title]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
            @if (theme.isDark()) {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            }
          </button>
          <button class="logout-btn" (click)="logout()" title="Log out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      <main class="shell-main">
        <router-outlet/>
      </main>
    </div>
    <app-toast/>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
    }

    .sidebar-logo {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      padding: 0 18px;
      border-bottom: 1px solid var(--border);
      gap: 10px;
      flex-shrink: 0;
    }

    .logo-img {
      height: 28px;
      width: auto;
      flex-shrink: 0;
      object-fit: contain;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-brand {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
      color: var(--text-1);
    }

    .logo-sub {
      font-size: 9.5px;
      color: var(--accent);
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .sidebar-nav {
      flex: 1;
      padding: 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: var(--radius-sm);
      color: var(--text-2);
      font-size: 13.5px;
      font-weight: 400;
      transition: background 100ms, color 100ms;
      cursor: pointer;
      text-decoration: none;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-1);
    }

    .nav-item.nav-active {
      background: var(--accent-subtle);
      color: var(--accent);
      font-weight: 500;
      border-left-color: var(--accent);
    }

    .sidebar-user {
      padding: 10px 12px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--accent-subtle);
      border: 1.5px solid var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 10.5px;
      color: var(--text-3);
    }

    .logout-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-3);
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 4px;
      transition: color 120ms, background 120ms;
      flex-shrink: 0;
    }

    .logout-btn:hover {
      color: var(--danger);
      background: var(--danger-subtle);
    }

    .theme-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-3);
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 4px;
      transition: color 120ms, background 120ms;
      flex-shrink: 0;
    }

    .theme-btn:hover {
      color: var(--accent);
      background: var(--accent-subtle);
    }

    .shell-main {
      margin-left: var(--sidebar-width);
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      background: var(--bg);
      display: flex;
      flex-direction: column;
    }
  `],
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  get initials(): string {
    const f = this.auth.firstName()?.[0] ?? '';
    const l = this.auth.lastName()?.[0] ?? '';
    return (f + l).toUpperCase() || '?';
  }

  get roleLabel(): string {
    const role = this.auth.role();
    if (!role) return '';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  logout() {
    this.auth.logout();
  }
}
