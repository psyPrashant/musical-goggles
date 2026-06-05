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
    httpMock.expectOne('/api/auth/login').flush({ token: 'tok123', role: 'RECRUITER', firstName: 'Jane', lastName: 'Smith' });

    expect(sessionStorage.getItem('token')).toBe('tok123');
    expect(sessionStorage.getItem('role')).toBe('RECRUITER');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('RECRUITER');
  });

  it('login() stores and exposes firstName and lastName', () => {
    service.login('user@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'tok123', role: 'RECRUITER', firstName: 'Jane', lastName: 'Smith' });

    expect(sessionStorage.getItem('firstName')).toBe('Jane');
    expect(sessionStorage.getItem('lastName')).toBe('Smith');
    expect(service.firstName()).toBe('Jane');
    expect(service.lastName()).toBe('Smith');
  });

  it('displayName() returns full name after login', () => {
    service.login('user@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'tok123', role: 'RECRUITER', firstName: 'Jane', lastName: 'Smith' });

    expect(service.displayName()).toBe('Jane Smith');
  });

  it('displayName() is null before login', () => {
    expect(service.displayName()).toBeNull();
  });

  it('logout() clears token; isAuthenticated() becomes false', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    service.login('user@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'tok123', role: 'ADMIN', firstName: 'Admin', lastName: 'User' });

    service.logout();

    expect(sessionStorage.getItem('token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
  });

  it('logout() clears firstName and lastName', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    service.login('user@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'tok123', role: 'RECRUITER', firstName: 'Jane', lastName: 'Smith' });

    service.logout();

    expect(sessionStorage.getItem('firstName')).toBeNull();
    expect(sessionStorage.getItem('lastName')).toBeNull();
    expect(service.firstName()).toBeNull();
    expect(service.lastName()).toBeNull();
    expect(service.displayName()).toBeNull();
  });
});
