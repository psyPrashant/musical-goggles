## Why

The Musical Goggles platform has a working Spring Boot + Angular codebase but lacks the operational scaffolding required to develop, test, and ship reliably. Without containerised environments, automated pipelines, schema versioning, and environment separation, every developer works against a different setup and every deployment is a manual risk.

## What Changes

- **Docker + docker-compose** (MG-41, already merged via PR #2): Spring Boot app and PostgreSQL containerised for one-command local dev startup.
- **CI/CD pipelines** (MG-42): GitHub Actions workflows that build, test, and validate the backend and frontend on every push and pull request to `main`.
- **DB migrations via Flyway** (MG-43): Flyway integrated into Spring Boot so all schema changes are versioned SQL scripts that run automatically on startup.
- **Environment profiles** (MG-44): Separate Spring Boot `application-{env}.yaml` profiles for `dev`, `staging`, and `prod`, with secrets injected via environment variables rather than committed config.

## Capabilities

### New Capabilities

- `docker-dev-setup`: Containerised local development stack — Spring Boot app + PostgreSQL via docker-compose, with hot-reload support for the backend and proxied Angular dev server.
- `ci-cd-pipeline`: GitHub Actions workflows for automated build, test, and optionally deploy on push/PR. Covers both `recruitment-be` (Maven) and `recruitment-fe` (npm/Vitest).
- `db-migrations`: Flyway-based schema versioning integrated into the Spring Boot app. Migration scripts live in `src/main/resources/db/migration/` and run on application startup.
- `environment-config`: Multi-environment Spring Boot profile system (`dev`, `staging`, `prod`) separating database credentials, mail config, JWT secrets, and feature flags from committed code.

### Modified Capabilities

*(none — this is greenfield infrastructure)*

## Impact

- `recruitment-be/`: `pom.xml` gains Flyway dependency; `application.yaml` gains profile-specific config files; `Dockerfile` exists (PR #2).
- `recruitment-fe/`: `Dockerfile` added; CI workflow covers `npm test` (Vitest) and `npm run build`.
- Repository root: `docker-compose.yml` (PR #2), `.github/workflows/` directory (new).
- No breaking changes to existing API contracts.
