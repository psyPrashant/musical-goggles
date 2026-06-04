# staff-management Specification

## Purpose
TBD - created by archiving change ep-22-staff-user-management. Update Purpose after archive.
## Requirements
### Requirement: User entity stores first and last name
The `users` table SHALL have `first_name VARCHAR(100) NOT NULL` and `last_name VARCHAR(100) NOT NULL` columns. A Flyway migration (V17) SHALL add these columns with a backfill for existing rows before enforcing NOT NULL.

#### Scenario: Migration applies cleanly on a database with existing users
- **WHEN** V17 runs on a database that already contains user rows from V1–V16
- **THEN** the migration completes without error
- **AND** every existing user row has non-null `first_name` and `last_name` values

#### Scenario: New user rows require first and last name
- **WHEN** an attempt is made to insert a user row with a null `first_name` or `last_name`
- **THEN** the database rejects the insert with a NOT NULL constraint violation

### Requirement: Admin can list all staff users
The system SHALL expose `GET /api/staff` returning all users with role `ADMIN` or `RECRUITER`. The endpoint SHALL be restricted to authenticated users with the `ADMIN` role. `CANDIDATE` users SHALL never appear in the response.

#### Scenario: Admin retrieves staff list
- **WHEN** an Admin sends `GET /api/staff` with a valid JWT
- **THEN** the response is HTTP 200 with a JSON array of staff objects
- **AND** each object contains `id`, `firstName`, `lastName`, `email`, `role`, and `createdAt`
- **AND** no `passwordHash` or password field is present in any response object

#### Scenario: Recruiter is denied access to staff list
- **WHEN** a Recruiter sends `GET /api/staff` with a valid JWT
- **THEN** the response is HTTP 403

#### Scenario: Unauthenticated request is denied
- **WHEN** a request to `GET /api/staff` is made without an Authorization header
- **THEN** the response is HTTP 401

### Requirement: Admin can create a new staff user
The system SHALL expose `POST /api/staff` allowing an Admin to create a new user with role `ADMIN` or `RECRUITER`. The request SHALL include `firstName`, `lastName`, `email`, `password`, and `role`. The password SHALL be stored as a BCrypt hash. The `CANDIDATE` role SHALL be rejected with HTTP 400.

#### Scenario: Admin creates a new Recruiter
- **WHEN** an Admin sends `POST /api/staff` with valid `firstName`, `lastName`, `email`, `password`, and `role: RECRUITER`
- **THEN** the response is HTTP 201 with the new user's `id`, `firstName`, `lastName`, `email`, `role`, and `createdAt`
- **AND** the new user can log in via `POST /api/auth/login` using the supplied password

#### Scenario: Duplicate email is rejected
- **WHEN** an Admin sends `POST /api/staff` with an email that already exists in the system
- **THEN** the response is HTTP 409

#### Scenario: CANDIDATE role is rejected
- **WHEN** an Admin sends `POST /api/staff` with `role: CANDIDATE`
- **THEN** the response is HTTP 400

#### Scenario: Missing required fields are rejected
- **WHEN** an Admin sends `POST /api/staff` with a blank `firstName`, `lastName`, `email`, or `password`
- **THEN** the response is HTTP 400

### Requirement: Admin can edit an existing staff user
The system SHALL expose `PUT /api/staff/{id}` allowing an Admin to update a staff user's `firstName`, `lastName`, `email`, and `role`. If the `password` field in the request is blank, the existing password hash SHALL be retained unchanged. If non-blank, the new password SHALL be BCrypt-hashed and stored.

#### Scenario: Admin updates a staff member's name and role
- **WHEN** an Admin sends `PUT /api/staff/{id}` with updated `firstName`, `lastName`, and `role`
- **THEN** the response is HTTP 200 with the updated user object
- **AND** the changes are persisted in the database

#### Scenario: Blank password on update retains existing credentials
- **WHEN** an Admin sends `PUT /api/staff/{id}` with an empty `password` field
- **THEN** the existing password hash is unchanged
- **AND** the user can still log in with their previous password

#### Scenario: Non-blank password on update changes credentials
- **WHEN** an Admin sends `PUT /api/staff/{id}` with a non-blank `password` field
- **THEN** the password is re-hashed and stored
- **AND** the user can log in with the new password
- **AND** the old password no longer works

#### Scenario: Email change conflicts with existing user
- **WHEN** an Admin sends `PUT /api/staff/{id}` with an email already used by a different user
- **THEN** the response is HTTP 409

#### Scenario: Non-existent user returns 404
- **WHEN** an Admin sends `PUT /api/staff/{id}` where `id` does not exist
- **THEN** the response is HTTP 404

### Requirement: Staff management screen is accessible to Admins only
The Angular application SHALL include a `/staff` route rendering a staff management screen. A "Staff" navigation link SHALL appear in the sidebar only when the authenticated user has the `ADMIN` role.

#### Scenario: Admin sees Staff link in sidebar
- **WHEN** a user with role `ADMIN` is logged in
- **THEN** the sidebar displays a "Staff" navigation link

#### Scenario: Recruiter does not see Staff link in sidebar
- **WHEN** a user with role `RECRUITER` is logged in
- **THEN** the sidebar does not display a "Staff" navigation link

### Requirement: Staff list screen displays all staff with search
The staff management screen SHALL display a table of all staff users showing name, email, role badge, and date added. A search input SHALL filter the list reactively by name or email.

#### Scenario: Staff list loads on navigation
- **WHEN** an Admin navigates to `/staff`
- **THEN** the screen displays a table with all ADMIN and RECRUITER users

#### Scenario: Search filters by name
- **WHEN** an Admin types a partial name into the search input
- **THEN** the table is filtered to show only rows where the full name contains the search string (case-insensitive)

#### Scenario: Search filters by email
- **WHEN** an Admin types a partial email into the search input
- **THEN** the table is filtered to show only rows where the email contains the search string

### Requirement: Admin can add and edit staff via inline dialog
The staff management screen SHALL provide an "Add Staff" button that opens an inline dialog for creating a new user. Each table row SHALL have an edit action that opens the same dialog pre-populated with the user's current details. The dialog SHALL validate required fields before submission.

#### Scenario: Add Staff dialog opens with empty fields
- **WHEN** an Admin clicks "Add Staff"
- **THEN** an inline dialog appears with empty fields for First Name, Last Name, Email, Password, and a Role selector defaulting to Recruiter

#### Scenario: Edit dialog opens pre-populated
- **WHEN** an Admin clicks the edit action on a staff row
- **THEN** the dialog opens with the user's current First Name, Last Name, Email, and Role pre-filled
- **AND** the Password field is empty

#### Scenario: Submit with blank required field is prevented
- **WHEN** an Admin attempts to submit the dialog with a blank First Name, Last Name, or Email
- **THEN** the form submission is blocked and an inline error is shown

#### Scenario: Successful create closes dialog and updates list
- **WHEN** an Admin submits valid data in create mode
- **THEN** the dialog closes and the new staff member appears in the table without a full page reload

#### Scenario: Successful edit closes dialog and updates list
- **WHEN** an Admin submits valid data in edit mode
- **THEN** the dialog closes and the updated details are reflected in the table row

