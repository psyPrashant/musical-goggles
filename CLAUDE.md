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

### Stack & Architecture

- **Spring Boot 4.0.6**, Java 17, Maven
- **Spring Security** + **Spring Session JDBC** — session-based auth persisted in PostgreSQL
- **Spring Web MVC** for REST; **Spring Web Services** for SOAP endpoints
- **Spring Mail** for email notifications
- **PostgreSQL** as the database (configure via `application.yaml`)
- **Lombok** for reducing boilerplate

Base package: `com.psybergate.recruitment`

`application.yaml` currently only sets the app name — database, mail, and security config will need to be added as the project grows.

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
