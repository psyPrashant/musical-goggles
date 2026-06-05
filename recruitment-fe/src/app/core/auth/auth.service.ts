import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

interface LoginResponse {
  token: string;
  role: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(sessionStorage.getItem('token'));
  private readonly _role = signal<string | null>(sessionStorage.getItem('role'));
  private readonly _firstName = signal<string | null>(sessionStorage.getItem('firstName'));
  private readonly _lastName = signal<string | null>(sessionStorage.getItem('lastName'));

  readonly isAuthenticated = computed(() => !!this._token());
  readonly role = computed(() => this._role());
  readonly firstName = computed(() => this._firstName());
  readonly lastName = computed(() => this._lastName());
  readonly displayName = computed(() =>
    [this._firstName(), this._lastName()].filter(Boolean).join(' ') || null,
  );

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.role);
        sessionStorage.setItem('firstName', res.firstName);
        sessionStorage.setItem('lastName', res.lastName);
        this._token.set(res.token);
        this._role.set(res.role);
        this._firstName.set(res.firstName);
        this._lastName.set(res.lastName);
      }),
    );
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');
    this._token.set(null);
    this._role.set(null);
    this._firstName.set(null);
    this._lastName.set(null);
    this.router.navigate(['/login']);
  }

  validateCandidateToken(invitationToken: string) {
    return this.http.post<{ token: string }>('/api/auth/candidate/validate-token', { invitationToken });
  }

  getToken(): string | null {
    return this._token();
  }
}
