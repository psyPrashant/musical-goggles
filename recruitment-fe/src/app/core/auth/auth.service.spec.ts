import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('isAuthenticated() is false when no token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login() stores token and role; isAuthenticated() becomes true', () => {
    service.login('user@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'tok123', role: 'RECRUITER' });

    expect(sessionStorage.getItem('token')).toBe('tok123');
    expect(sessionStorage.getItem('role')).toBe('RECRUITER');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('RECRUITER');
  });

  it('logout() clears token; isAuthenticated() becomes false', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    service.login('user@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'tok123', role: 'ADMIN' });

    service.logout();

    expect(sessionStorage.getItem('token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
  });
});
