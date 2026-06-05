## Context

The login flow issues a JWT and returns `{ token, role }` to the frontend. The Angular `AuthService` stores these in `sessionStorage` and exposes them as signals. The `ShellComponent` sidebar currently hardcodes the user identity display — it never reads from `AuthService` for the user's name.

The fix is a small, additive change: extend the login response to include the user's name, and wire the frontend to display it dynamically.

## Goals / Non-Goals

**Goals:**
- Login response carries `firstName` and `lastName` so the client can display the user's real name.
- `AuthService` persists name fields in `sessionStorage` (same lifecycle as `token`/`role`) and exposes them as reactive signals.
- `ShellComponent` sidebar shows the user's actual name and initials from the auth service.

**Non-Goals:**
- Embedding name in the JWT — the JWT payload is not changing.
- A separate `/api/me` endpoint — unnecessary; login already has the `User` object.
- Editing the user's name from the sidebar.

## Decisions

**Extend `LoginResponse` rather than add a `/me` endpoint**
The login handler already holds a `User` entity. Adding `firstName`/`lastName` to the response is zero extra DB queries and keeps the client simpler (one request to bootstrap auth state).

**Store name in `sessionStorage` (not derived from JWT)**
The JWT already stores `sub` and `role` but not name. Decoding the JWT client-side would require a decode library and is fragile. Storing name in `sessionStorage` mirrors the existing `token`/`role` pattern and clears automatically on tab close.

**Expose `displayName` computed signal on `AuthService`**
Avoids template-level string concatenation scattered across components. Any component that needs the user's full name can consume `auth.displayName()`.

## Risks / Trade-offs

- **Stale sessionStorage on name change**: If a user's name is changed server-side, the sidebar won't update until next login. Acceptable — name changes are rare and logout/re-login is the expected refresh path.
- **Seed data names**: Default seeded users ("Admin User", "Recruiter User") will now show correctly since the name comes from the DB. The old hardcoded "Admin User" string is removed.
