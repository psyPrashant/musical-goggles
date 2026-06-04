## Why

Platform staff (Admins and Recruiters) can currently only be created by manually editing seed data or the database — there is no UI for user administration. Admins need a self-service screen to onboard new staff and maintain existing accounts without developer involvement.

## What Changes

- `first_name` and `last_name` columns added to the `users` table via a new Flyway migration (V17)
- `User` entity updated with the two new fields; `DevDataSeeder` updated to supply them on seed
- New `staff` package with `StaffController`, `StaffService`, `StaffServiceImpl`, `StaffRequest`, `StaffResponse`
- New REST API — `GET /api/staff`, `POST /api/staff`, `PUT /api/staff/{id}` — restricted to `ADMIN` role only
- Admin sets the initial password for a new user; a blank password on update keeps the existing hash
- `CANDIDATE` role is excluded from all staff endpoints (staff = ADMIN + RECRUITER only)
- New Angular `StaffComponent` at route `/staff` with list table, search, and inline add/edit dialog
- "Staff" nav link in the sidebar visible only when the logged-in user has the `ADMIN` role

## Capabilities

### New Capabilities
- `staff-management`: Admin-only screen and API to list, create, and edit staff users (Admins and Recruiters). Covers the V17 migration, BE endpoints, and FE component.

### Modified Capabilities
- `dev-seed-data`: The seed admin user row must now include `first_name` and `last_name` (required by V17 NOT NULL constraint).
- `role-based-access-control`: New admin-only API endpoints (`/api/staff/**`) must be covered by the access-control spec.

## Impact

- **Database:** `users` table gains `first_name VARCHAR(100) NOT NULL` and `last_name VARCHAR(100) NOT NULL` (V17 migration with backfill)
- **Backend:** new `staff/` package; `UserRepository` gains `findByRoleIn`; `DevDataSeeder` updated
- **Frontend:** new `core/staff/` service + model; new `features/staff/` component; `app.routes.ts` and `shell.component.ts` updated
- **Auth:** no changes to token structure or login flow; `@PreAuthorize("hasRole('ADMIN')")` on all new endpoints
