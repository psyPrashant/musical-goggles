## Context

The Musical Goggles platform consists of two services (`recruitment-be` Spring Boot, `recruitment-fe` Angular) backed by PostgreSQL. Docker Compose is already in place (PR #2). The team needs: automated CI, version-controlled DB schema changes, and clean separation of environment configuration to unblock safe feature development and deployment.

## Goals / Non-Goals

**Goals:**
- One-command local dev startup via docker-compose (already done — validate and document)
- GitHub Actions CI that builds and tests both services on push/PR
- Flyway managing all DDL — no manual `psql` scripts, no schema surprises on startup
- Spring Boot profile-based config so `dev`, `staging`, and `prod` never share the same `application.yaml`

**Non-Goals:**
- Automated deployment (CD) — out of scope for Sprint 1; CI only
- Kubernetes or cloud-native orchestration — docker-compose is sufficient for this phase
- Secrets management tooling (Vault, AWS Secrets Manager) — env vars injected at runtime are sufficient
- Frontend E2E tests in CI — unit tests (Vitest) only for now

## Decisions

### 1 — GitHub Actions over other CI platforms
GitHub Actions is the obvious choice given the repo is on GitHub. No additional integration required; secrets live in repository settings; workflow YAML is co-located with code.

Alternative considered: None — the project spec explicitly names GitHub Actions.

### 2 — Flyway over Liquibase
Flyway uses plain SQL migration files with a naming convention (`V1__description.sql`). This keeps scripts readable, database-tool-agnostic, and free of XML/YAML boilerplate. Spring Boot's `spring.flyway.*` autoconfiguration handles the rest.

Liquibase was not seriously considered — Flyway is simpler for a greenfield project with a single relational database.

### 3 — Profile-per-environment via `application-{env}.yaml`
Spring Boot's built-in profile mechanism (`SPRING_PROFILES_ACTIVE=dev`) avoids third-party config libraries. Each environment file overrides only the keys that differ. Secrets (DB passwords, JWT secret, mail credentials) are **never** committed — they are injected as environment variables referenced with `${VAR_NAME}` placeholders.

Alternative considered: Single `application.yaml` with `---` profile sections — rejected because the file grows unwieldy and risks accidental secret commits.

### 4 — CI matrix: backend and frontend as separate jobs
The backend (Maven) and frontend (npm) have independent toolchains and test suites. Running them as parallel jobs in a single workflow cuts wall-clock time and isolates failures cleanly.

## Risks / Trade-offs

- **Flyway baseline on existing schema**: If the dev database already has tables created outside Flyway, the first migration will fail. Mitigation: run `flyway baseline` once on any existing database, or drop and recreate dev databases from the first migration.
- **Docker layer caching in CI**: Without explicit cache steps, Maven and npm dependency downloads repeat on every run. Mitigation: use `actions/cache` for `~/.m2` and `node_modules`.
- **Profile secrets leakage**: Developers may hardcode secrets in `application-dev.yaml` and accidentally commit them. Mitigation: add `application-*.yaml` patterns (except `application.yaml`) to `.gitignore` review; use `.env.example` as the reference.

## Migration Plan

1. Validate existing docker-compose works end-to-end (MG-41 acceptance).
2. Add Flyway dependency to `pom.xml`; create `V1__init_schema.sql` capturing the current empty schema baseline.
3. Add `application-dev.yaml`, `application-staging.yaml`, `application-prod.yaml`; update `application.yaml` to remove environment-specific values.
4. Add `.github/workflows/ci.yml` with backend and frontend jobs.
5. Verify CI passes on a test branch before merging.

Rollback: Flyway migrations are append-only; reverting schema requires a new `V{n}__rollback.sql`. CI workflow can be disabled by deleting the file.
