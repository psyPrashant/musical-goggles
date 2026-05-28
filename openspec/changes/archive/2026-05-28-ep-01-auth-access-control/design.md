## Context

The platform has three distinct user personas: Admins (manage the platform), Recruiters (create assessments, invite candidates), and Candidates (take assessments). Admins and Recruiters need standard credential-based login; Candidates must never need to create an account — they access assessments exclusively through secure invitation links. Spring Security is the natural choice for the Spring Boot backend. The frontend is Angular 21.2 with standalone components.

## Goals / Non-Goals

**Goals:**
- Secure JWT-based login for Admin and Recruiter users
- Role model enforced at the API layer for all protected endpoints
- Invitation-token-based candidate authentication (stateless, time-limited)
- Angular auth integration: token storage, HTTP interceptor, route guards

**Non-Goals:**
- OAuth2 / SSO — out of scope for Sprint 1
- Password reset / forgot-password flow — deferred to a later epic
- Refresh tokens — access tokens expiring after 1 hour is sufficient for this phase
- Admin UI for user management — Admins are seeded; Recruiter creation is out of scope for Sprint 1

## Decisions

### 1 — Stateless JWT over Spring Session JDBC
Although `application.yaml` references Spring Session JDBC, the platform's three-role model with token-based candidate access maps cleanly to stateless JWTs. Spring Session introduces server-side state that complicates horizontal scaling and doesn't work for the invitation-token flow.

Candidate tokens are a distinct concern from Admin/Recruiter JWTs — they are single-use or time-limited and scoped to a specific assessment. Both can be implemented as JWTs with different claims and expiry windows.

Alternative considered: Session-based auth for Admins/Recruiters only, token for Candidates — rejected because it means two parallel auth systems.

### 2 — `jjwt` (io.jsonwebtoken) as the JWT library
`jjwt` is the most widely used JWT library in the Spring Boot ecosystem, well-maintained, and has clear Spring integration docs. It handles signing, parsing, and validation.

### 3 — Token stored in Angular `sessionStorage` (not `localStorage`)
`sessionStorage` is cleared when the browser tab closes, which is appropriate for a recruitment portal where candidates should not remain authenticated across sessions. Admins and Recruiters follow the same policy for consistency.

`localStorage` was considered but rejected: tokens that persist across browser sessions are a larger attack surface for XSS.

### 4 — Role enforcement via Spring Security method security (`@PreAuthorize`)
Rather than relying solely on URL-pattern security configuration (which is brittle and hard to audit), each controller method is annotated with `@PreAuthorize("hasRole('ADMIN')")` etc. URL-pattern rules remain as a defence-in-depth layer.

### 5 — Candidate invitation tokens as short-lived JWTs with assessment claim
The invitation token is a JWT signed with a server secret, containing the `candidateId` and `assessmentId`. It expires after 7 days (configurable). When validated, the backend issues a shorter-lived (2-hour) assessment-session JWT for the duration of the attempt. This avoids storing one-time-use tokens in the database for Sprint 1.

Alternative considered: Random UUID token stored in the database — simpler but requires DB lookup on every candidate request and complicates the "no-account" candidate flow.

## Risks / Trade-offs

- **JWT secret rotation**: If the signing secret leaks, all issued tokens are compromised. Mitigation: store the secret as an environment variable (`JWT_SECRET`) injected at runtime; rotate by restarting the service.
- **No token revocation**: Stateless JWTs cannot be individually invalidated before expiry. Mitigation: short expiry (1 hour for Admin/Recruiter, 2 hours for candidate session) limits the blast radius.
- **XSS and token theft**: Storing tokens in `sessionStorage` is vulnerable to XSS. Mitigation: Angular's built-in template escaping, strict CSP headers (future), and the short token TTL.
- **Seeded Admin user**: Sprint 1 has no user-creation UI — at least one Admin must be seeded via a Flyway migration or `data.sql`. Hardcoded credentials in migration scripts are a risk. Mitigation: seed a well-known dev admin; prod admin credentials injected via env vars at first startup.

## Migration Plan

1. Add Spring Security + `jjwt` dependencies to `pom.xml`.
2. Create `User`, `Role`, `UserRole` entities and Flyway migration (coordinates with MG-43).
3. Implement `JwtService` (sign, validate, extract claims).
4. Implement `SecurityFilterChain`: public routes (`/api/auth/**`), protected routes require valid JWT.
5. Implement `/api/auth/login` endpoint.
6. Implement `/api/auth/candidate/validate-token` endpoint.
7. Annotate all existing controllers with `@PreAuthorize` as they are created.
8. Implement Angular `AuthService`, `AuthInterceptor`, and route guards.
9. Seed a dev Admin user via Flyway `afterMigrate.sql` or `data.sql` (dev profile only).
