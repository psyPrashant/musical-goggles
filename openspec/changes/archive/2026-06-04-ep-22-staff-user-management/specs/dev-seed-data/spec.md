## MODIFIED Requirements

### Requirement: Admin user FK constraint is satisfied before seeder runs
The migration SHALL insert the admin user row with a deterministic UUID before any question or assessment rows, so that `created_by` FK constraints are met even though `DevDataSeeder` runs after Flyway. The seed admin row SHALL include `first_name = 'Admin'` and `last_name = 'User'` to satisfy the NOT NULL constraint added in V17.

#### Scenario: Admin user row exists when questions are inserted
- **WHEN** V11 runs on a fresh database
- **THEN** the users table contains a row with email `admin@recruitment.dev` before any question inserts
- **AND** `DevDataSeeder` finds the row by email and skips re-creation (no unique violation)

#### Scenario: DevDataSeeder sets name fields when creating the admin user
- **WHEN** `DevDataSeeder` runs and the admin user does not yet exist
- **THEN** it creates the user with `firstName = 'Admin'` and `lastName = 'User'`
- **AND** the created row satisfies the V17 NOT NULL constraint on `first_name` and `last_name`
