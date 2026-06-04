# role-based-access-control Specification

## Purpose

Define and enforce role-based access control across the platform. Three distinct roles — ADMIN, RECRUITER, and CANDIDATE — are persisted per user and mapped to Spring Security authorities. All API endpoints must be explicitly permissioned via `@PreAuthorize` annotations.
## Requirements
### Requirement: Three distinct roles exist: ADMIN, RECRUITER, CANDIDATE
The system SHALL define exactly three roles. `ADMIN` has full platform access. `RECRUITER` can manage questions, assessments, and candidates but cannot manage other users. `CANDIDATE` can only access their own assigned assessment — no other platform features.

#### Scenario: Role is persisted with each user record
- **WHEN** a user is created in the system
- **THEN** exactly one role is assigned and stored in the database

#### Scenario: Each role maps to a Spring Security authority
- **WHEN** the JWT filter authenticates a request
- **THEN** the user's role from the JWT claim is set as a `GrantedAuthority` in the `SecurityContext`

### Requirement: API endpoints are protected by role at the method level
Every controller method that exposes sensitive functionality SHALL be annotated with `@PreAuthorize` specifying the permitted roles. A method with no `@PreAuthorize` annotation SHALL be considered a defect — all endpoints must be explicitly permissioned.

#### Scenario: Admin-only endpoint rejects Recruiter
- **WHEN** a Recruiter sends a request to an endpoint annotated `@PreAuthorize("hasRole('ADMIN')")`
- **THEN** Spring Security returns HTTP 403 Forbidden

#### Scenario: Recruiter can access Recruiter-permitted endpoints
- **WHEN** a Recruiter sends a request to an endpoint annotated `@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")`
- **THEN** the request proceeds normally

#### Scenario: Candidate cannot access Admin/Recruiter endpoints
- **WHEN** a Candidate sends a request to any endpoint not explicitly permitting the `CANDIDATE` role
- **THEN** the request returns HTTP 403

### Requirement: Public endpoints are explicitly whitelisted
Authentication and health-check endpoints (`/api/auth/**`, `/actuator/health`) SHALL be whitelisted in the `SecurityFilterChain` configuration as `permitAll()`. All other endpoints SHALL require authentication by default.

#### Scenario: Login endpoint is accessible without a token
- **WHEN** an unauthenticated request is made to `POST /api/auth/login`
- **THEN** the request is processed normally (no HTTP 401 from the security filter)

#### Scenario: Unknown endpoint requires authentication
- **WHEN** an unauthenticated request is made to any endpoint not in the whitelist
- **THEN** the security filter returns HTTP 401 before the request reaches the controller

### Requirement: Staff management endpoints are restricted to ADMIN role
The `/api/staff/**` endpoints SHALL be protected by `@PreAuthorize("hasRole('ADMIN')")` at the controller class level. No Recruiter or Candidate SHALL be able to list, create, or edit staff users.

#### Scenario: Recruiter is denied access to staff endpoints
- **WHEN** a Recruiter sends any request to `/api/staff` or `/api/staff/{id}` with a valid JWT
- **THEN** Spring Security returns HTTP 403 Forbidden before the controller method executes

#### Scenario: Admin can access all staff endpoints
- **WHEN** an Admin sends a valid request to any `/api/staff/**` endpoint
- **THEN** the request is processed and the appropriate response is returned

