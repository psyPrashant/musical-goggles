# dev-seed-data Specification

## Purpose

An idempotent Flyway migration that populates the dev database with a ready-to-use question bank and sample assessments on first startup, requiring no manual data-entry from developers.
## Requirements
### Requirement: Dev database is seeded with questions on startup
The system SHALL include a Flyway migration `V11__seed_dev_data.sql` that inserts 19 questions across all supported types (MCQ, TEXT, CODE_SUBMISSION, GROUP), 6 tags, and question-tag associations. All inserts SHALL use deterministic UUIDs with `ON CONFLICT (id) DO NOTHING`.

#### Scenario: Fresh database is seeded on first startup
- **WHEN** the backend starts against a fresh database (V1–V10 applied, no prior data)
- **THEN** V11 runs without error
- **AND** the question bank contains 8 MCQ, 5 TEXT, 4 CODE_SUBMISSION, and 2 GROUP questions
- **AND** each MCQ question has exactly 4 options with exactly 1 marked correct

#### Scenario: Migration is idempotent on restart
- **WHEN** the backend restarts without clearing the database
- **THEN** V11 completes without any duplicate-key or constraint violation errors
- **AND** the question count remains 19

### Requirement: Dev database is seeded with sample assessments on startup
The system SHALL insert 3 sample assessments with linked questions. Each assessment SHALL have at most one top-level CODE_SUBMISSION question.

#### Scenario: Assessments are available after startup
- **WHEN** V11 has run on a fresh database
- **THEN** the assessments list contains "Junior Backend Developer" (PUBLISHED, 60 min), "Senior Full Stack Engineer" (PUBLISHED, 90 min), and "SQL & Database Foundations" (DRAFT, 45 min)

#### Scenario: Junior Backend Developer assessment composition
- **WHEN** a recruiter opens "Junior Backend Developer"
- **THEN** it contains 5 MCQ + 2 TEXT + 1 CODE_SUBMISSION questions

#### Scenario: Senior Full Stack Engineer assessment composition
- **WHEN** a recruiter opens "Senior Full Stack Engineer"
- **THEN** it contains 4 MCQ + 3 TEXT + 1 CODE_SUBMISSION + 1 GROUP question

#### Scenario: SQL Foundations assessment composition
- **WHEN** a recruiter opens "SQL & Database Foundations"
- **THEN** it contains 5 MCQ + 2 TEXT + 1 CODE_SUBMISSION questions and status is DRAFT

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

