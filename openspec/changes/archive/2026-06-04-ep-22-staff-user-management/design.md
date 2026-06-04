## Context

The `users` table stores all platform principals — Admins, Recruiters, and Candidates — but has no name fields. Staff are created today only via `DevDataSeeder` (dev profile) or direct SQL. There is no UI or API for user administration. The frontend sidebar has no admin-specific navigation section and no role-based rendering of nav items.

This change adds name fields to `users`, introduces a staff management REST API (Admin-only), and delivers an Angular screen so Admins can self-serve staff onboarding and edits.

## Goals / Non-Goals

**Goals:**
- Add `first_name` / `last_name` to `users` with a safe, backfilled migration
- Expose `GET /api/staff`, `POST /api/staff`, `PUT /api/staff/{id}` restricted to `ADMIN`
- Angular `/staff` route with list, search, and inline add/edit dialog
- Sidebar "Staff" link visible only to Admins

**Non-Goals:**
- User deactivation or deletion (v1 only)
- User-initiated password reset or email invitation flow
- Audit log of who created/edited which staff member
- Pagination (staff count is expected to remain small)

## Decisions

### D1 — Extend `users` table rather than create a separate `staff` table
**Decision:** Add `first_name` / `last_name` columns to the existing `users` table.

**Rationale:** All platform principals are already users. A separate `staff` table would require joins in every query and duplicate identity data. The `users` table already has `role` to distinguish staff from candidates.

**Alternative considered:** A `staff_profiles` table joined to `users`. Rejected — unnecessary complexity for two name fields.

### D2 — V17 migration backfills names before adding NOT NULL
**Decision:** The migration adds columns as nullable, runs `UPDATE` statements to backfill existing rows, then alters to `NOT NULL`.

**Rationale:** The existing seed admin row (inserted by V11 or `DevDataSeeder`) has no name. Adding `NOT NULL` without backfill would fail on any database that has already run V1–V16.

**Backfill values:**
- `role = 'ADMIN'` → `first_name = 'Admin'`, `last_name = 'User'`
- `role = 'RECRUITER'` → `first_name = 'Recruiter'`, `last_name = 'User'`
- `role = 'CANDIDATE'` → `first_name = 'Candidate'`, `last_name = 'User'` (safety net; candidates have their own name fields in the `candidates` table)

`DevDataSeeder` is updated to supply names so the idempotent check path also satisfies the constraint.

### D3 — Staff API lives in a new `staff/` package, reusing `UserRepository`
**Decision:** New `com.psybergate.recruitment.staff` package with `StaffController`, `StaffService`, `StaffServiceImpl`, and `dto/` sub-package. No new repository — inject the existing `UserRepository`.

**Rationale:** `UserRepository extends JpaRepository<User, UUID>` already provides all necessary CRUD. Adding `findByRoleIn(List<Role>)` is sufficient. Creating a separate repository for the same entity would be redundant.

### D4 — Password handling: admin-set on create, optional on update
**Decision:** `StaffRequest` includes a `password` field. On create it is required (validated `@NotBlank`). On update, a blank value means "keep existing hash" — the service skips re-encoding if the field is blank.

**Rationale:** No email flow exists anywhere on the platform. An admin-set password is the simplest path consistent with the existing `AuthService` login flow. The update leniency avoids forcing admins to re-enter passwords when editing names or roles.

**Alternative considered:** Separate `POST /api/staff/{id}/reset-password` endpoint. Deferred to a future epic.

### D5 — Frontend uses inline dialog pattern (matching Candidates screen)
**Decision:** The Staff component manages all state via Angular signals. The add/edit dialog is rendered inline with `@if (showDialog())` — no separate dialog component file.

**Rationale:** Consistent with the existing `CandidatesComponent` pattern. Standalone components with signal-based state is the established FE pattern on this project.

### D6 — Nav link guarded by `auth.role() === 'ADMIN'` signal
**Decision:** The "Staff" sidebar link is wrapped in `@if (auth.role() === 'ADMIN')` in `shell.component.ts`. No route guard is added.

**Rationale:** The API itself enforces the ADMIN-only constraint (HTTP 403 for others). The nav guard is a UX affordance, not a security boundary. A dedicated `AdminGuard` would add complexity without meaningful security gain since the API is already protected.

## Risks / Trade-offs

- **Backfill produces generic names for existing staff** → Admins should edit their own name after the migration runs. Acceptable for a dev/staging environment; no production data exists yet.
- **Plain-text password in request body** → Mitigated by HTTPS in all non-local environments. Consistent with the existing login endpoint which also accepts a plain-text password.
- **No pagination** → Acceptable while the team is small. The `findByRoleIn` query returns all staff; if staff count grows significantly, a follow-up can add paging.

## Migration Plan

1. Apply `V17__add_name_to_users.sql` (nullable add → backfill → NOT NULL alter)
2. Deploy updated backend (new `staff/` package, updated `User` entity, updated `DevDataSeeder`)
3. Deploy updated frontend (new route, component, nav link)
4. Admins can immediately log in and update their own display names via the Staff screen

**Rollback:** Revert BE/FE deployment; run `ALTER TABLE users DROP COLUMN first_name, DROP COLUMN last_name` (data loss of names only — no other tables reference these columns).
