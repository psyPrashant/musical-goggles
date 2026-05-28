## 1. Docker Dev Setup (MG-41 — already merged, validate & close)

- [x] 1.1 Verify `docker-compose up` starts backend + PostgreSQL cleanly from a clean clone
- [x] 1.2 Confirm `.env.example` exists at repo root with all required variable names documented
- [x] 1.3 Confirm backend Spring Boot connects to `db` service by hostname (not localhost)
- [x] 1.4 Confirm PostgreSQL data volume persists across `docker-compose down` / `up` cycles
- [x] 1.5 Transition MG-41 to Done in Jira

## 2. Environment Config — Spring Boot Profiles (MG-44)

- [x] 2.1 Create `recruitment-be/src/main/resources/application-dev.yaml` with docker-compose datasource defaults
- [x] 2.2 Create `recruitment-be/src/main/resources/application-staging.yaml` with `${...}` placeholders for all secrets
- [x] 2.3 Create `recruitment-be/src/main/resources/application-prod.yaml` with `${...}` placeholders, `show-sql=false`, and restricted error responses
- [x] 2.4 Strip environment-specific values from `application.yaml` — leave only app name and common non-secret config
- [x] 2.5 Update `docker-compose.yml` to pass `SPRING_PROFILES_ACTIVE=dev` to the backend service
- [x] 2.6 Add `application-staging.yaml` and `application-prod.yaml` to `.gitignore` review (confirm secrets-bearing files are not committed)
- [x] 2.7 Smoke-test: start the app locally with `SPRING_PROFILES_ACTIVE=dev` and confirm it connects to the database

## 3. DB Migrations — Flyway (MG-43)

- [x] 3.1 Add `flyway-core` dependency to `recruitment-be/pom.xml`
- [x] 3.2 Configure Flyway in `application.yaml`: set `spring.flyway.locations=classpath:db/migration`
- [x] 3.3 Create directory `recruitment-be/src/main/resources/db/migration/`
- [x] 3.4 Write `V1__baseline.sql` creating all Sprint 1 tables (users, roles, questions, question_groups, question_group_items, question_tags)
- [ ] 3.5 Start the app against a fresh database and confirm Flyway applies V1 without errors
- [ ] 3.6 Verify `flyway_schema_history` table is created and contains one record for V1
- [ ] 3.7 Add a second test migration `V2__test_migration.sql`, start the app, confirm it applies; then delete V2 (it was a validation-only step)

## 4. CI/CD Pipeline — GitHub Actions (MG-42)

- [x] 4.1 Create `.github/workflows/ci.yml` at the repository root
- [x] 4.2 Configure workflow triggers: `push` to `main` and `pull_request` targeting `main`
- [x] 4.3 Add backend job: `actions/checkout`, `actions/setup-java@v4` (Java 17, Temurin), `actions/cache` for `~/.m2`, `./mvnw clean package`, `./mvnw test` — working directory `recruitment-be/`
- [x] 4.4 Add frontend job: `actions/checkout`, `actions/setup-node@v4` (Node version from `package.json`), `actions/cache` for `node_modules` keyed on `package-lock.json`, `npm ci`, `npx tsc --noEmit`, `npm test -- --run` — working directory `recruitment-fe/`
- [x] 4.5 Confirm both jobs are defined at the same level in the workflow (parallel, not sequential)
- [ ] 4.6 Push the workflow file on a feature branch and verify both jobs appear and pass in GitHub Actions
- [ ] 4.7 Open a PR to `main` and confirm the CI status check appears and is required before merge
