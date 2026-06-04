## ADDED Requirements

### Requirement: Staff management endpoints are restricted to ADMIN role
The `/api/staff/**` endpoints SHALL be protected by `@PreAuthorize("hasRole('ADMIN')")` at the controller class level. No Recruiter or Candidate SHALL be able to list, create, or edit staff users.

#### Scenario: Recruiter is denied access to staff endpoints
- **WHEN** a Recruiter sends any request to `/api/staff` or `/api/staff/{id}` with a valid JWT
- **THEN** Spring Security returns HTTP 403 Forbidden before the controller method executes

#### Scenario: Admin can access all staff endpoints
- **WHEN** an Admin sends a valid request to any `/api/staff/**` endpoint
- **THEN** the request is processed and the appropriate response is returned
