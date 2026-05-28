## 1. Backend — Dependencies & Domain Model (MG-17)

- [ ] 1.1 Add `spring-boot-starter-security`, `jjwt-api`, `jjwt-impl`, `jjwt-jackson` to `recruitment-be/pom.xml`
- [ ] 1.2 Create `Role` enum: `ADMIN`, `RECRUITER`, `CANDIDATE`
- [ ] 1.3 Create `User` entity with fields: `id`, `email`, `passwordHash`, `role`, `createdAt`
- [ ] 1.4 Create `UserRepository` (Spring Data JPA)
- [ ] 1.5 Write Flyway migration `V2__create_users_table.sql` (coordinates with MG-43 V1 baseline)
- [ ] 1.6 Seed a dev Admin user via `application-dev.yaml` `spring.sql.init` or a `V3__seed_dev_admin.sql` (dev profile only, password BCrypt-hashed)

## 2. Backend — JWT Service (MG-16)

- [ ] 2.1 Create `JwtService` bean: `generateToken(userId, role, ttl)`, `validateToken(token)`, `extractClaims(token)`
- [ ] 2.2 Inject `JWT_SECRET` and `JWT_EXPIRY_HOURS` from environment via `@Value`
- [ ] 2.3 Write unit tests for `JwtService`: valid token round-trip, expired token rejection, tampered signature rejection

## 3. Backend — Login Endpoint (MG-16)

- [ ] 3.1 Create `AuthController` with `POST /api/auth/login` accepting `{ email, password }`
- [ ] 3.2 Implement `AuthService.login()`: load user by email, BCrypt password check, call `JwtService.generateToken()`
- [ ] 3.3 Return `{ token, role }` on success; `401` on failure
- [ ] 3.4 Write integration test for login endpoint: success, wrong password, unknown email

## 4. Backend — Security Filter Chain & JWT Filter (MG-16, MG-17)

- [ ] 4.1 Create `JwtAuthenticationFilter` extending `OncePerRequestFilter`: extract `Bearer` token, validate, set `SecurityContextHolder`
- [ ] 4.2 Configure `SecurityFilterChain` bean: whitelist `POST /api/auth/**`; require authentication on all other routes; add `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`
- [ ] 4.3 Enable method security (`@EnableMethodSecurity`) in the security config class
- [ ] 4.4 Write integration test: protected endpoint returns 401 without token, 200 with valid token

## 5. Backend — Candidate Token Auth (MG-18)

- [ ] 5.1 Create `POST /api/auth/candidate/validate-token` endpoint accepting `{ invitationToken }`
- [ ] 5.2 Implement validation: parse invitation JWT, check expiry and signature, extract `candidateId` and `assessmentId`
- [ ] 5.3 Issue a candidate session JWT with `role=CANDIDATE`, `candidateId`, `assessmentId`, 2-hour TTL
- [ ] 5.4 Write integration tests: valid invitation token → session JWT; expired token → 401; tampered token → 401

## 6. Frontend — Auth Service & Interceptor (MG-16)

- [ ] 6.1 Generate `AuthService` in `recruitment-fe/src/app/core/auth/`
- [ ] 6.2 Implement `login(email, password)`: POST to `/api/auth/login`, store token + role in `sessionStorage`
- [ ] 6.3 Implement `logout()`: clear `sessionStorage`, redirect to login page
- [ ] 6.4 Implement `isAuthenticated()` and `getRole()` observables
- [ ] 6.5 Create `AuthInterceptor` (functional HTTP interceptor): attach `Authorization: Bearer <token>` to every outgoing request
- [ ] 6.6 Register the interceptor in `app.config.ts`
- [ ] 6.7 Write Vitest unit tests for `AuthService`: login success stores token; logout clears token; `isAuthenticated()` reflects state

## 7. Frontend — Login Page & Route Guards

- [ ] 7.1 Create `LoginComponent` (standalone) at `/login` with email/password form
- [ ] 7.2 On successful login, redirect Admin/Recruiter to dashboard (`/dashboard`)
- [ ] 7.3 Create `authGuard` (functional route guard): redirect unauthenticated users to `/login`
- [ ] 7.4 Apply `authGuard` to all protected routes in `app.routes.ts`
- [ ] 7.5 Add `candidateGuard` for candidate-only routes (validates presence of `CANDIDATE` role in session)
- [ ] 7.6 Write Vitest tests for guards: authenticated → passes; unauthenticated → redirects
