## Why

When a recruiter (or any non-admin user) logs in, the sidebar displays the hardcoded text "Admin User" and initials "AU" instead of the actual logged-in user's name. This is because the backend login response omits the user's name, and the frontend shell component never wires up dynamic name display.

## What Changes

- The `POST /api/auth/login` response will include `firstName` and `lastName` alongside the existing `token` and `role` fields.
- The Angular `AuthService` will store and expose the user's first name, last name, and a computed `displayName` signal, persisted in `sessionStorage`.
- The sidebar `ShellComponent` will replace all hardcoded user identity strings ("Admin User", "AU", "Administrator") with dynamic bindings from `AuthService`.
- The `auth.service.spec.ts` tests will be updated to cover the new name fields.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `admin-recruiter-login`: Login response now returns `firstName` and `lastName` in addition to `token` and `role`; `AuthService` persists and exposes user name signals.

## Impact

- **Backend**: `LoginResponse.java` (add fields), `AuthServiceImpl.java` (populate fields)
- **Frontend**: `auth.service.ts` (new signals + displayName), `shell.component.ts` (template bindings), `auth.service.spec.ts` (test updates)
- **No breaking changes** to the JWT itself or auth flow — only the login response body is extended
