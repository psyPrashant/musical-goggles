## Why

Every other feature on the platform requires knowing who is making a request and what they are allowed to do. Without authentication and role-based access control in place, no protected endpoint can be built safely — making this the first feature epic to implement.

## What Changes

- **JWT-based login for Admins and Recruiters** (MG-16): A `/api/auth/login` endpoint that validates credentials and returns a signed JWT; a Spring Security filter that validates that token on every subsequent request.
- **Role model** (MG-17): Three distinct roles — `ADMIN`, `RECRUITER`, and `CANDIDATE` — enforced at the API layer, with each endpoint explicitly permitting only the roles that should access it.
- **Candidate auth via invitation token** (MG-18): Candidates do not have passwords. Instead, they authenticate using a secure, time-limited token embedded in their invitation link. A separate endpoint validates the token and returns a scoped session or JWT for the candidate to take their assessment.

## Capabilities

### New Capabilities

- `admin-recruiter-login`: Credential-based JWT login for Admin and Recruiter users — login endpoint, token issuance, and Spring Security filter for protected routes.
- `role-based-access-control`: Role model (`ADMIN`, `RECRUITER`, `CANDIDATE`) and enforcement of role-specific access on all API endpoints.
- `candidate-token-auth`: Invitation-token-based authentication for Candidates — token validation endpoint that grants scoped access to the candidate's assigned assessment without requiring a password.

### Modified Capabilities

*(none — this is the initial auth implementation)*

## Impact

- `recruitment-be/`: Spring Security dependency added (or configured); `UserDetailsService` or custom auth filter implemented; `SecurityFilterChain` bean configured; `User`/`Role` entities and repositories created.
- `recruitment-fe/`: Angular `AuthService` stores JWT in memory or `sessionStorage`; `HttpInterceptor` attaches `Authorization: Bearer <token>` to API requests; route guards protect authenticated routes.
- All future API endpoints depend on the security filter being in place.
- No existing endpoints to break (greenfield).
