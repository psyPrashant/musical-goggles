## ADDED Requirements

### Requirement: Admin and Recruiter can log in with email and password
The system SHALL expose a `POST /api/auth/login` endpoint that accepts `{ email, password }` and, on success, returns a signed JWT. The endpoint SHALL be publicly accessible (no prior authentication required).

#### Scenario: Successful login returns JWT
- **WHEN** a valid Admin or Recruiter submits correct credentials to `POST /api/auth/login`
- **THEN** the response is HTTP 200 with a JSON body containing a `token` field (JWT string) and a `role` field

#### Scenario: Wrong password returns 401
- **WHEN** a user submits a correct email but incorrect password
- **THEN** the response is HTTP 401 with no token issued

#### Scenario: Unknown email returns 401
- **WHEN** a user submits an email that does not exist in the system
- **THEN** the response is HTTP 401 (same response as wrong password — no enumeration of valid emails)

### Requirement: Issued JWT contains role and subject claims
The JWT issued on login SHALL include the user's `sub` (user ID or email), `role` (one of `ADMIN`, `RECRUITER`), and `exp` (expiry: 1 hour from issuance). It SHALL be signed with HMAC-SHA256 using a server-side secret.

#### Scenario: JWT contains expected claims
- **WHEN** a valid JWT is decoded (without verification) at the client
- **THEN** the payload contains `sub`, `role`, and `exp` fields

#### Scenario: Expired token is rejected
- **WHEN** a request is made with a JWT whose `exp` is in the past
- **THEN** the backend returns HTTP 401

### Requirement: Spring Security filter validates JWT on protected routes
Every API request to a protected endpoint SHALL pass through a `JwtAuthenticationFilter` that extracts and validates the `Authorization: Bearer <token>` header. If the token is absent, malformed, or expired, the filter SHALL return HTTP 401 before the request reaches the controller.

#### Scenario: Valid token grants access
- **WHEN** a request to a protected endpoint includes a valid `Authorization: Bearer <token>` header
- **THEN** the request proceeds to the controller and returns the expected response

#### Scenario: Missing token is rejected
- **WHEN** a request to a protected endpoint has no `Authorization` header
- **THEN** Spring Security returns HTTP 401 before the controller is invoked

### Requirement: Angular AuthService stores and retrieves the JWT
The Angular `AuthService` SHALL handle login (call `POST /api/auth/login`, store token in `sessionStorage`), logout (clear token), and expose an observable for authentication state. The `AuthInterceptor` SHALL attach the token to every outgoing HTTP request as a `Bearer` header.

#### Scenario: Token attached to API requests after login
- **WHEN** a user logs in successfully and the Angular app makes any subsequent API request
- **THEN** the request includes an `Authorization: Bearer <token>` header

#### Scenario: Logout clears the stored token
- **WHEN** the user calls logout
- **THEN** the token is removed from `sessionStorage` and subsequent API requests have no `Authorization` header
