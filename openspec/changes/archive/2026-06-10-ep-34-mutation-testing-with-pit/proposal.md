## Why

Line coverage alone cannot reveal whether tests actually assert meaningful behaviour — a test can execute a branch without verifying the result. PIT mutation testing closes this gap by introducing small deliberate code faults ("mutants") and confirming that the test suite kills each one. Adopting it now, while the flag-domain business logic is still being actively developed, gives the team a reliable signal of test quality and prevents coverage gaps from compounding.

## What Changes

- `pitest-maven` plugin added to `recruitment-be/pom.xml`, scoped to unit tests only (`*Test` classes; integration tests are excluded to keep run times practical)
- PIT outputs HTML and XML reports to `target/pit-reports/`
- CI backend job gains a mutation coverage step that publishes the report as an artifact and enforces a minimum mutation score threshold
- `SubmissionFlagServiceTest` extended with ~12 additional test methods covering every untested branch in `SubmissionFlagServiceImpl` (ownership checks, blank-notes guard, all filter combinations in `getAllFlags`, full audit-trail coverage)
- `TESTING.md` added to `recruitment-be/` documenting the baseline mutation score, threshold rationale, and instructions for running PIT locally

## Capabilities

### New Capabilities

- `pit-mutation-testing`: PIT plugin configuration in `pom.xml` — plugin version, target classes/tests, output formats, timestamped-reports disabled, mutation threshold. Covers the developer-facing workflow for running mutation coverage locally and the rules governing which classes and test classes are in scope.

### Modified Capabilities

- `ci-cd-pipeline`: Backend CI job gains a new requirement — run `pitest:mutationCoverage` after the test step, fail the job if the mutation score falls below the configured threshold, and upload `target/pit-reports/` as a workflow artifact.

## Impact

- **`recruitment-be/pom.xml`** — new `<plugin>` block for `pitest-maven` + `pitest-junit5-plugin` dependency
- **`recruitment-be/src/test/…/flag/SubmissionFlagServiceTest.java`** — new test methods added (no structural changes to existing tests)
- **`recruitment-be/TESTING.md`** — new file documenting baseline score and threshold
- **`.github/workflows/ci.yml`** — new step in the `backend` job
- No API changes, no database changes, no frontend changes
- Build time impact: PIT unit-test run is expected to add ~2–4 minutes to CI (unit tests only; Testcontainers integration tests are excluded)
