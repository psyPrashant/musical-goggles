import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="ring"></div>

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
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      pointer-events: none;
    }

    .orb-1 {
      width: 420px;
      height: 420px;
      background: radial-gradient(circle, rgba(255, 107, 44, 0.28), transparent 70%);
      top: -120px;
      right: 12%;
      animation: orb-float 11s ease-in-out infinite alternate;
    }

    .orb-2 {
      width: 380px;
      height: 380px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.24), transparent 70%);
      bottom: -110px;
      left: 10%;
      animation: orb-float 13s ease-in-out infinite alternate-reverse;
    }

    @keyframes orb-float {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(40px, 28px) scale(1.12); }
    }

    .ring {
      position: absolute;
      width: 560px;
      height: 560px;
      border-radius: 50%;
      pointer-events: none;
      background: conic-gradient(
        from 0deg,
        transparent 0%,
        rgba(255, 107, 44, 0.5) 12%,
        transparent 26%,
        transparent 50%,
        rgba(139, 92, 246, 0.4) 62%,
        transparent 76%
      );
      -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px));
      mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px));
      animation: ring-spin 16s linear infinite;
    }

    @keyframes ring-spin {
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .orb, .ring { animation: none; }
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      position: relative;
      z-index: 1;
    }

    /* gradient hairline border via mask compositing */
    .login-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(150deg,
        rgba(255, 107, 44, 0.55),
        rgba(255, 61, 129, 0.2) 35%,
        var(--border) 60%,
        rgba(139, 92, 246, 0.45));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      pointer-events: none;
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
      border-radius: 10px;
      background: var(--gradient-accent);
      box-shadow: var(--glow-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-1);
    }

    .brand-sub {
      font-size: 10px;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .login-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
      background: linear-gradient(120deg, var(--text-1) 55%, var(--accent) 130%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
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
      padding: 11px 13px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-1);
      font-size: 13.5px;
      outline: none;
      transition: border-color 160ms, box-shadow 160ms;
    }

    .field-input::placeholder {
      color: var(--text-3);
    }

    .field-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-subtle), 0 0 18px rgba(255, 107, 44, 0.12);
    }

    .error-box {
      padding: 10px 14px;
      background: var(--danger-subtle);
      border: 1px solid rgba(251, 94, 108, 0.3);
      border-radius: var(--radius-sm);
      color: var(--danger);
      font-size: 13px;
      animation: shake 320ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }

    @keyframes shake {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-3px); }
      40%, 60% { transform: translateX(3px); }
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      color: #fff;
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      margin-top: 4px;
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
