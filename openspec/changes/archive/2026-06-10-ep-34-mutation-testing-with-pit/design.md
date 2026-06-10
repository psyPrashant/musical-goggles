## Context

The backend (`recruitment-be/`) is a Spring Boot 4.0.6 Maven project using JUnit 5, Mockito, and Testcontainers. There are currently 24 test classes split into two categories:

- **Unit tests** (`*Test.java`, 8 files) — pure Mockito, fast, no I/O
- **Integration tests** (`*IntegrationTest.java`, 16 files) — spin up a PostgreSQL Testcontainer per class

PIT works by forking a JVM for each mutant and running the test suite against it. This means test execution time is multiplied by the number of mutants generated (typically 200–600 for a project this size). Running integration tests in this loop would make a single PIT invocation take 30–60 minutes and is impractical for CI.

The project also uses Lombok extensively for domain entities and DTOs. Lombok generates bytecode directly (getters, setters, builders, `equals`/`hashCode`) which PIT will attempt to mutate unless excluded.

## Goals / Non-Goals

**Goals:**
- A developer can run `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage` locally and get a browsable HTML report in under 5 minutes
- CI enforces a minimum mutation score and fails the build if it drops below the threshold
- The flag domain (`com.psybergate.recruitment.flag.*`) achieves ≥70% mutation coverage per the MG-168 acceptance criteria
- A `TESTING.md` file documents the baseline score, how to run PIT locally, and how the threshold is maintained

**Non-Goals:**
- Mutation testing of integration tests or the frontend
- 100% mutation coverage across all packages (impractical for service layers that involve complex data enrichment with many unmocked paths)
- Mutating Lombok-generated accessor code in DTOs/entities (noise, not signal)

## Decisions

### 1. JUnit 5 plugin is mandatory

**Decision**: Add `pitest-junit5-plugin` as a dependency inside the `pitest-maven` plugin block.

PIT's built-in test discovery only handles JUnit 3/4. Without the JUnit 5 plugin, PIT finds zero tests, reports 0 mutants tested, and exits successfully — a silent false pass. The plugin version `1.2.1` is the latest stable release compatible with PIT 1.17.x.

### 2. Exclude integration tests from PIT scope

**Decision**: Set `<targetTests>` to `com.psybergate.recruitment.*Test` (matches classes ending in exactly `Test`). Classes ending in `IntegrationTest` do not match this pattern and are excluded.

**Alternatives considered**:
- *Include all tests*: Would give more complete coverage data but makes a single PIT run take 30–60 minutes in CI due to Testcontainers startup overhead per mutant fork. Rejected.
- *Use `<excludedTestClasses>`*: More explicit but brittle — any new integration test class added without the `IntegrationTest` suffix would be included. Rejected in favour of the positive-match pattern.

### 3. Exclude Lombok-generated accessor classes from mutation targets

**Decision**: Add `<excludedClasses>` entries for `*.dto.*` packages and any class whose sole content is Lombok-generated. Specifically exclude `com.psybergate.recruitment.*.dto.*` from mutation targets.

DTOs and simple record-like entities have no branching logic — PIT would generate hundreds of mutants for `getX()`/`setX()` and flag them as survived (because tests never assert on accessor return values directly). Excluding them reduces noise and keeps the mutation score meaningful.

**Alternatives considered**:
- *Exclude nothing*: More comprehensive but buries real coverage gaps in accessor noise. Rejected.
- *Use `@SuppressWarnings("all")` on DTO classes*: Not a PIT exclusion mechanism. Rejected.

### 4. Disable timestamped report directories

**Decision**: Set `<timestampedReports>false</timestampedReports>`.

PIT defaults to writing each run into a timestamped subdirectory (e.g., `target/pit-reports/202506091430/`). This makes the CI artifact upload path unstable across runs. With timestamps disabled, reports always land at `target/pit-reports/` — a fixed path suitable for a GitHub Actions `upload-artifact` step.

### 5. Threshold value set after baseline

**Decision**: `<mutationThreshold>` starts at `0` in MG-166 (plugin wiring only). After MG-168 test improvements are merged, MG-167 establishes the actual baseline by running PIT locally, then sets the threshold to `max(60, baseline - 5)`.

The 5% buffer prevents the build from becoming fragile when one new method is added with a test that doesn't cover every branch. The 60% floor matches the MG-167 acceptance criteria.

## Risks / Trade-offs

- **PIT + Spring Boot 4 / Java 17 bytecode**: PIT 1.17.x supports Java 17 bytecode (sealed classes, records, text blocks). Spring Boot 4 itself is not a concern — PIT mutates compiled bytecode, not Spring wiring. Risk is low.
- **New `pitest-junit5-plugin` version**: PIT ecosystem plugins lag slightly behind PIT core releases. If `pitest-junit5-plugin` 1.2.1 is incompatible with PIT 1.17.x at build time, pin PIT core to the last version the plugin certifies against (currently 1.16.x). → Mitigation: verify compatibility during MG-166 implementation by running the goal locally before pushing.
- **CI build time increase**: Adding PIT adds ~2–4 minutes for unit tests only. Acceptable given the value. If it grows beyond 8 minutes, the threshold can be raised and slow tests profiled.
- **Survived mutants in `getAllFlags` filter chain**: The multi-step stream filter in `SubmissionFlagServiceImpl.getAllFlags` (lines 161–168) involves date boundary logic that is hard to test exhaustively with Mockito alone. Some mutants may survive here. → Mitigation: document in `TESTING.md` as a known gap; integration tests cover the happy path end-to-end.

## Migration Plan

1. **MG-166**: Merge `pom.xml` plugin addition. Verify locally that `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage` completes and produces a report. No threshold enforced yet.
2. **MG-168**: Merge improved `SubmissionFlagServiceTest`. Run PIT again locally to confirm the flag domain score meets ≥70%.
3. **MG-167**: Record baseline score in `TESTING.md`. Set `<mutationThreshold>` in `pom.xml`. Add PIT step to `ci.yml`. Merge — CI now enforces the threshold on every PR.

Rollback: remove the `pitest-maven` plugin block from `pom.xml` and revert the `ci.yml` step. No data migration required.

## Open Questions

- Should PIT run on every PR (adds ~3 min to CI) or only on pushes to `main`? Recommend every PR so regressions are caught before merge, but this can be revisited if build time becomes a complaint.
- What is the agreed threshold for packages other than `flag.*`? The Jira AC specifies 60% overall. Per-package thresholds are possible with PIT but add configuration complexity — defer to a future change.
