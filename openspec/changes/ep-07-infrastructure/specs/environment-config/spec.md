## ADDED Requirements

### Requirement: Configuration is split into base and environment-specific profile files
The Spring Boot application SHALL use a base `application.yaml` for values common to all environments, and separate `application-dev.yaml`, `application-staging.yaml`, and `application-prod.yaml` files for environment-specific overrides. The active profile SHALL be selected by the `SPRING_PROFILES_ACTIVE` environment variable.

#### Scenario: Dev profile activates correctly
- **WHEN** the application starts with `SPRING_PROFILES_ACTIVE=dev`
- **THEN** values in `application-dev.yaml` override the base `application.yaml` values

#### Scenario: Unknown profile falls back to base config
- **WHEN** no `SPRING_PROFILES_ACTIVE` variable is set
- **THEN** only `application.yaml` is loaded and the application starts with default (non-environment-specific) config

### Requirement: Secrets are never committed to version control
Database passwords, JWT signing secrets, mail credentials, and any other sensitive values SHALL NOT appear in any committed configuration file. These values SHALL be represented as `${ENV_VAR_NAME}` placeholders in profile YAML files and injected at runtime.

#### Scenario: Committed config files contain no secret values
- **WHEN** any `application*.yaml` file is inspected in the repository
- **THEN** no passwords, tokens, or private keys appear — only `${PLACEHOLDER}` references

#### Scenario: Missing environment variable produces a clear startup error
- **WHEN** a required environment variable (e.g., `DB_PASSWORD`) is not set
- **THEN** the Spring Boot application fails to start with a message identifying the missing property

### Requirement: Dev profile uses docker-compose defaults for local development
The `application-dev.yaml` file SHALL default to the datasource URL, username, and password values matching the docker-compose service configuration, so that `docker-compose up` and the Spring Boot dev profile work together without additional developer configuration.

#### Scenario: Backend connects to Docker PostgreSQL with dev profile
- **WHEN** the application starts with `SPRING_PROFILES_ACTIVE=dev` inside the docker-compose network
- **THEN** it successfully connects to the `db` service using the configured defaults

### Requirement: Prod profile enforces stricter security settings
The `application-prod.yaml` file SHALL disable Spring Boot's default error detail endpoint responses, disable Actuator endpoints that expose sensitive information (if Actuator is used), and set `spring.jpa.show-sql=false`.

#### Scenario: SQL logging is disabled in production
- **WHEN** the application runs with `SPRING_PROFILES_ACTIVE=prod`
- **THEN** no SQL statements are logged to stdout
