# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A recruitment platform with two sub-projects:
- `recruitment-be/` — Spring Boot 4.0.6 REST API (Java 17, PostgreSQL)
- `recruitment-fe/` — Angular 21.2 SPA (TypeScript, Vitest)

## Backend (`recruitment-be/`)

### Commands

```powershell
# Run (from recruitment-be/)
./mvnw spring-boot:run

# Build
./mvnw clean package

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=MyTestClass

# Run a single test method
./mvnw test -Dtest=MyTestClass#myMethod
```

Integration tests use TestContainers — Docker Desktop must be running. If tests fail with "Could not find a valid Docker environment" on Docker Engine 29+, ensure `%USERPROFILE%\.docker-java.properties` contains `api.version=1.44`.

### Code execution (Piston)

`CODE_SUBMISSION` questions run candidate Java via a self-hosted [Piston](https://github.com/engineer-man/piston) engine — the public emkc.org API is whitelist-only and unusable. `docker compose up` starts it (service `piston`, port 2000) and `piston-init` installs the Java runtime into its volume on first run. A locally run backend (`./mvnw spring-boot:run`) reaches it at the default `PISTON_BASE_URL` of `http://localhost:2000/api/v2`.

### Stack & Architecture

- **Spring Boot 4.0.6**, Java 17, Maven
- **Spring Security** with JWT auth + **Spring Session JDBC** — session-based auth persisted in PostgreSQL
- **Spring Web MVC** for REST; **Spring Web Services** for SOAP endpoints
- **Spring Mail** for email notifications
- **PostgreSQL** as the database, schema managed via **Flyway** (`src/main/resources/db/migration`)
- **Lombok** for reducing boilerplate

Base package: `com.psybergate.recruitment`

Config lives in `application.yaml` plus `application-{dev,staging,prod}.yaml` profiles — datasource, Flyway, JWT secret/expiry, mail, and the Piston sandbox are all externalized via environment variables with dev-only local defaults. `ddl-auto` is `none`/`validate` outside `dev`; never rely on Hibernate to manage schema — add a Flyway migration instead.

### Conventions

- **Package-by-feature**: each feature package (`assessment/`, `candidate/`, `flag/`, etc.) owns its controller, `XxxService` interface + `XxxServiceImpl`, and `dto/` subpackage. Entities/repositories used by a single feature live in that feature's `domain/`/`repository/` subpackage; anything used by 2+ features stays in the shared top-level `domain/`/`repository/` packages.
- **Always inject the service interface**, never the impl, from controllers and other services.
- **Constructor injection via Lombok `@RequiredArgsConstructor`** with `private final` fields — no field-level `@Autowired`.
- Unmapped/unexpected exceptions are caught by `common/GlobalExceptionHandler` (`@RestControllerAdvice`), which logs server-side and returns a `ProblemDetail` response. `ResponseStatusException` and `@ResponseStatus`-annotated custom exceptions keep their existing status/reason — extend that class rather than adding ad hoc `try/catch` for new failure modes.

## Frontend (`recruitment-fe/`)

### Commands

```powershell
# Dev server (http://localhost:4200)
cd recruitment-fe
npm start

# Build for production
npm run build

# Run tests (Vitest)
npm test

# Type-check without emitting
npx tsc --noEmit
```

### Stack & Architecture

- **Angular 21.2** with standalone components (no NgModules)
- **Vitest** (not Karma/Jasmine) as the test runner
- **Prettier** for formatting — config in `.prettierrc`
- TypeScript strict mode + `noImplicitOverride`, `strictTemplates`, `strictInjectionParameters`
- Router configured in `app.routes.ts`; app-level providers in `app.config.ts`

## OpenSpec Workflow

This project uses OpenSpec (`openspec/config.yaml`) with the `spec-driven` schema for AI-assisted feature development. Use `/openspec-new-change` or `/opsx:new` to start a structured change.
