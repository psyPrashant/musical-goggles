## ADDED Requirements

### Requirement: Flyway manages all database schema changes
The Spring Boot application SHALL use Flyway for all DDL operations. No schema changes SHALL be applied outside of versioned Flyway migration scripts. Manual `psql` DDL execution in any environment is prohibited as a practice.

#### Scenario: Schema is applied automatically on startup
- **WHEN** the Spring Boot application starts against a fresh PostgreSQL database
- **THEN** Flyway runs all pending migration scripts in version order before the application accepts requests

#### Scenario: Already-applied migrations are not re-run
- **WHEN** the application starts against a database that already has migrations applied
- **THEN** Flyway checks the `flyway_schema_history` table and skips scripts already recorded as applied

### Requirement: Migration scripts follow the Flyway versioned naming convention
All migration scripts SHALL be placed in `src/main/resources/db/migration/` and named `V{version}__{description}.sql` (e.g., `V1__create_users_table.sql`). Version numbers SHALL be monotonically increasing integers. Underscores in the description are acceptable; spaces are not.

#### Scenario: Correctly named script is picked up automatically
- **WHEN** a file named `V2__add_questions_table.sql` is added to `db/migration/`
- **THEN** Flyway detects and applies it on the next application startup after `V1` has already been applied

#### Scenario: Out-of-order script causes startup failure
- **WHEN** a script with a version number lower than the highest already-applied version is added
- **THEN** Flyway rejects the out-of-order migration and the application fails to start (unless `outOfOrder=true` is explicitly configured)

### Requirement: Flyway is configured via Spring Boot application properties
Flyway settings (locations, baseline-on-migrate, etc.) SHALL be configured in `application.yaml` (or the active profile's override file). The Flyway Spring Boot autoconfiguration SHALL be used — no manual `Flyway` bean construction.

#### Scenario: Flyway uses the same datasource as the application
- **WHEN** the application starts
- **THEN** Flyway connects using `spring.datasource.*` properties without a separate Flyway datasource configuration

### Requirement: The initial migration captures the baseline schema
The first migration script (`V1__baseline.sql`) SHALL create all tables required by the application at the time of Sprint 1 completion. This ensures any fresh environment can be brought to the current schema state by running Flyway from scratch.

#### Scenario: Fresh environment reaches correct schema from V1
- **WHEN** Flyway runs against an empty database
- **THEN** all Sprint 1 tables exist and the application starts successfully
