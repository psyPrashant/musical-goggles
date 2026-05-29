import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-mark">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M3 3h6a3 3 0 0 1 0 6H3V3z" fill="white" fill-opacity="0.92"/>
              <path d="M3 9h5l5 6H8L3 9z" fill="white" fill-opacity="0.55"/>
            </svg>
          </div>
          <div>
            <div class="brand-name">PSYBERGATE</div>
            <div class="brand-sub">Recruitment Portal</div>
          </div>
        </div>

        <h1 class="login-title">Welcome back</h1>
        <p class="login-subtitle">Sign in to your account to continue</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
          <div class="field">
            <label for="email" class="field-label">Email address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="you@company.com"
              class="field-input"
            />
          </div>

          <div class="field">
            <label for="password" class="field-label">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              placeholder="Enter your password"
              class="field-input"
            />
          </div>

          @if (error()) {
            <div class="error-box">{{ error() }}</div>
          }

          <button type="submit" class="submit-btn" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
    }

    .login-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 2rem;
    }

    .logo-mark {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--text-1);
    }

    .brand-sub {
      font-size: 10px;
      color: var(--text-3);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .login-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-1);
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }

    .login-subtitle {
      font-size: 13.5px;
      color: var(--text-2);
      margin-bottom: 1.75rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-2);
    }

    .field-input {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-1);
      font-size: 13.5px;
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
    }

    .field-input::placeholder {
      color: var(--text-3);
    }

    .field-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-subtle);
    }

    .error-box {
      padding: 10px 14px;
      background: var(--danger-subtle);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: var(--radius-sm);
      color: var(--danger);
      font-size: 13px;
    }

    .submit-btn {
      width: 100%;
      padding: 11px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms;
      margin-top: 4px;
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--accent-hover);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        const role = this.auth.role();
        this.router.navigate(role === 'CANDIDATE' ? ['/assessment'] : ['/dashboard']);
      },
      error: () => {
        this.error.set('Invalid email or password.');
        this.loading.set(false);
      },
    });
  }
}
