import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

interface LoginResponse {
  token: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(sessionStorage.getItem('token'));
  private readonly _role = signal<string | null>(sessionStorage.getItem('role'));

  readonly isAuthenticated = computed(() => !!this._token());
  readonly role = computed(() => this._role());

  login(email: string, password: string) {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.role);
        this._token.set(res.token);
        this._role.set(res.role);
      }),
    );
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    this._token.set(null);
    this._role.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
