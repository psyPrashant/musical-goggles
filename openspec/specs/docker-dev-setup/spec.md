## ADDED Requirements

### Requirement: Developer can start the full stack with a single command
The system SHALL provide a `docker-compose.yml` at the repository root that starts the Spring Boot backend, Angular frontend (or dev proxy), and PostgreSQL database together. A developer with Docker installed SHALL be able to run `docker-compose up` and reach a working local environment without additional manual steps.

#### Scenario: Full stack starts successfully
- **WHEN** a developer runs `docker-compose up` from the repository root on a clean machine
- **THEN** PostgreSQL starts and becomes healthy, the Spring Boot backend starts and connects to the database, and the application is reachable at `http://localhost:8080`

#### Scenario: Backend hot-reload in development
- **WHEN** a developer modifies a Java source file while the backend container is running
- **THEN** the application reloads without requiring a full container rebuild (Spring Boot DevTools or volume-mounted build)

### Requirement: Services are isolated by named networks and volumes
The compose setup SHALL use named Docker volumes for PostgreSQL data persistence and a named network so services communicate by service name (e.g., `db`) rather than IP address.

#### Scenario: Data persists across container restarts
- **WHEN** a developer stops and restarts `docker-compose up`
- **THEN** previously created database records are still present

#### Scenario: Services communicate by hostname
- **WHEN** the Spring Boot app connects to the database
- **THEN** it uses the service name `db` as the hostname (not `localhost` or a hardcoded IP)

### Requirement: Environment variables configure sensitive values at startup
The compose file SHALL NOT contain hardcoded passwords or secrets. It SHALL read values from a `.env` file (gitignored) or shell environment variables, with a `.env.example` committed to the repository as the reference template.

#### Scenario: Missing .env file produces a clear error
- **WHEN** a developer runs `docker-compose up` without a `.env` file present
- **THEN** Docker Compose produces an error or uses documented defaults, not silently broken behaviour

#### Scenario: .env.example is the source of truth for required vars
- **WHEN** a developer clones the repository
- **THEN** copying `.env.example` to `.env` and filling in values is sufficient to start the stack
