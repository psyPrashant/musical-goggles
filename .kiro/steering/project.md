# Recruitment Platform — Project Steering

## Overview

A full-stack recruitment assessment platform for creating, distributing, and evaluating candidate assessments.

- **Backend** (`recruitment-be/`) — Spring Boot 4.0.6, Java 17, Maven
- **Frontend** (`recruitment-fe/`) — Angular 21.2, TypeScript, Vitest

---

## Tech Stack

### Backend
- Spring Boot 4.0.6 on Java 17
- Spring Security + JWT authentication
- Spring Session JDBC (session persistence in PostgreSQL)
- Spring Data JPA + Flyway migrations
- Spring Mail for notifications
- Spring Web MVC (REST) + Spring Web Services (SOAP)
- PostgreSQL as the primary database
- Piston (self-hosted) for sandboxed Java code execution
- TestContainers for integration tests
- PIT for mutation testing
- Lombok for boilerplate reduction

### Frontend
- Angular 21.2 with standalone components (no NgModules)
- Angular Router with lazy-loaded routes
- Angular HTTP client with an auth interceptor
- Monaco Editor for in-browser code editing
- Vitest for unit testing
- Prettier for formatting
- TypeScript strict mode enabled

---

## Project Structure

```
recruitment-project/
├── recruitment-be/src/main/java/com/psybergate/recruitment/
│   ├── assessment/       # Assessment CRUD + question assembly
│   ├── auth/             # Login / candidate token generation
│   ├── candidate/        # Candidate management
│   ├── common/           # Global exception handling
│   ├── config/           # App-level Spring config beans
│   ├── dashboard/        # Dashboard statistics
│   ├── domain/           # Shared JPA entities (used by 2+ features)
│   ├── email/            # Email templates and sending
│   ├── execution/        # Code execution via Piston
│   ├── flag/             # Submission flagging workflow
│   ├── invitation/       # Candidate invitations
│   ├── marking/          # Manual scoring of submissions
│   ├── question/         # Question bank management
│   ├── reminder/         # Scheduled reminder emails
│   ├── repository/       # Shared repositories (used by 2+ features)
│   ├── security/         # JWT filter + security config
│   ├── staff/            # Staff management
│   ├── tag/              # Question tagging
│   └── take/             # Candidate assessment-taking flow
├── recruitment-fe/src/app/
│   ├── core/             # Services, models, interceptors (per domain)
│   ├── features/         # Page-level components (lazy-loaded)
│   ├── shared/           # Reusable components (code editor, runner)
│   ├── guards/           # Route guards
│   ├── layout/           # Shell layout components
│   ├── app.routes.ts     # Route configuration
│   └── app.config.ts     # App-level providers
├── db/init.sql           # Spring Session JDBC schema
└── docker-compose.yml    # Local Docker stack
```

---

## Backend Conventions

### Package structure
- **Package-by-feature**: each feature owns its controller, `XxxService` interface + `XxxServiceImpl`, `dto/` subpackage, and optionally its own `domain/` and `repository/` subpackages.
- Entities and repositories shared across 2+ features go in the top-level `domain/` and `repository/` packages.

### Dependency injection
- Always inject the **service interface**, never the implementation, from controllers and other services.
- Use **constructor injection** via Lombok `@RequiredArgsConstructor` with `private final` fields — no field-level `@Autowired`.

### Database
- Schema is managed exclusively by **Flyway** migrations in `src/main/resources/db/migration/`.
- Never rely on Hibernate `ddl-auto` to create or alter schema — always add a migration script.
- `ddl-auto` is `none`/`validate` in all non-dev environments.

### Exception handling
- Unmapped exceptions are caught by `common/GlobalExceptionHandler` (`@RestControllerAdvice`), which returns `ProblemDetail` responses.
- Throw `ResponseStatusException` or extend it with a custom `@ResponseStatus`-annotated class for new failure modes — do **not** add ad hoc `try/catch` blocks.

### Configuration
- All externalized config (DB, JWT, mail, Piston URL) lives in `application.yaml` and profile-specific `application-{dev,staging,prod}.yaml`.
- Use environment variables with dev-only local defaults.

### Code execution
- `CODE_SUBMISSION` questions compile and run candidate Java code through the self-hosted **Piston** engine at `http://localhost:2000/api/v2` (default, overridable via `PISTON_BASE_URL`).
- The public emkc.org Piston API is whitelist-only and cannot be used.

---

## Frontend Conventions

### Component style
- Use **standalone components** — no NgModules.
- All routes are **lazy-loaded** via `app.routes.ts`.
- App-level providers are registered in `app.config.ts`.

### Services
- Domain services live under `core/{domain}/` and are the single source of truth for API calls within that domain.
- Components call services; services call the Angular `HttpClient`.

### TypeScript
- Strict mode is enabled — no `any`, no implicit overrides, strict templates and injection parameters.
- Run `npx tsc --noEmit` to type-check without a build.

### Testing
- Tests use **Vitest** (not Karma/Jasmine).
- Format code with **Prettier** before committing.

---

## Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Staff login — returns JWT |
| POST | `/api/auth/candidate-token` | Candidate access token |
| `*` | `/api/candidate/**` | Candidate-facing routes |
| `*` | `/api/take/**` | Assessment-taking routes |
| `*` | `/api/submissions/**` | Staff-only submission routes |

SpringDoc OpenAPI UI is at `/swagger-ui.html` when the backend is running.

---

## Running the Project

### Full stack (Docker Compose)
```bash
docker compose up --build
```

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:4200 | Angular via nginx |
| Backend | http://localhost:8080 | Spring Boot API |
| PostgreSQL | localhost:5433 | App + session DB |
| MailHog UI | http://localhost:8025 | Captured emails |
| Piston | http://localhost:2000 | Java sandbox |

### Local development
```bash
# Infrastructure only
docker compose up db mailhog piston

# Backend
cd recruitment-be && ./mvnw spring-boot:run

# Frontend
cd recruitment-fe && npm install && npm start
```

---

## Testing

### Backend
```bash
cd recruitment-be
./mvnw test                                          # all tests
./mvnw test -Dtest=MyTestClass                       # single class
./mvnw test-compile org.pitest:pitest-maven:mutationCoverage  # mutation
```
- Integration tests require Docker Desktop (TestContainers).
- On Docker Engine 29+: add `api.version=1.44` to `~/.docker-java.properties` if tests fail.

### Frontend
```bash
cd recruitment-fe
npm test           # Vitest (watch mode)
npx tsc --noEmit   # type-check only
```

---

## Domain Model Summary

| Domain | Key Entities / Concepts |
|--------|------------------------|
| `question` | `Question` (MCQ, TEXT, CODE_SUBMISSION), `Tag`, options |
| `assessment` | `Assessment`, `AssessmentQuestion` (ordered questions) |
| `invitation` | `Invitation` — links candidate to assessment with password |
| `take` | `Submission`, `Answer`, snapshots — candidate's in-progress session |
| `marking` | `Mark` — recruiter scores for text/code answers |
| `flag` | `SubmissionFlag` — dispute/audit records on submissions |
| `candidate` | `Candidate`, history of past assessments |
| `reminder` | Scheduled email reminders for pending invitations |
| `auth` | JWT for staff, short-lived token for candidates |
| `staff` | `Staff` user accounts with roles |
| `dashboard` | Aggregated statistics across the pipeline |

---

## Feature Development Workflow

This project uses a spec-driven development approach. When adding a new feature:

1. Create or update the spec before writing code.
2. Write tests (unit + integration) alongside the implementation.
3. Add a Flyway migration for any schema changes.
4. Keep backend and frontend changes in separate commits when practical.
5. Ensure `./mvnw test` and `npm test` pass before opening a PR.
6. CI runs on every push/PR to `main` — it must stay green.
