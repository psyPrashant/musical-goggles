# Mutation Testing with PIT

## Baseline Score

Measured after unit test expansion (2026-06-10):

| Metric | Score |
|---|---|
| Overall mutation score (killed/total) | **34%** |
| Overall test strength (killed/covered) | 80% |
| Flag domain (`com.psybergate.recruitment.flag.*`) mutation coverage | 84% |
| Flag domain test strength | 90% |

Unit test count grew from 52 to 108 across 11 test classes. New unit test classes added: `InvitationServiceTest` (17 tests), `SubmissionServiceTest` (15 tests), `MarkingServiceTest` (8 tests), `AuthServiceTest` (7 tests). Existing classes expanded: `CandidateTakeServiceImplTest` (+8 tests), `CandidateHistoryServiceTest` (+1 test).

The remaining 66% of mutations have no coverage (NO_COVERAGE) because those classes are only exercised by integration tests (excluded from PIT scope — see below). The test strength of 80% means that for mutants which ARE covered by unit tests, 80% are killed.

### Previous baseline (2026-06-09)

| Metric | Score |
|---|---|
| Overall mutation score (killed/total) | 20% |
| Overall test strength (killed/covered) | 80% |

## Threshold

`<mutationThreshold>` in `pom.xml` is set to **`29`** (overall mutation score).

Rationale: the overall score is now 34%; `34 - 5 = 29` gives a 5-point buffer before CI fails. The flag domain itself must maintain ≥70% per the MG-168 acceptance criteria (enforced by team convention, not the global threshold — per-package thresholds would require the Arcmutate plugin).

## Running PIT Locally

From `recruitment-be/`:

```powershell
./mvnw test-compile org.pitest:pitest-maven:mutationCoverage
```

The HTML report opens at:
```
target/pit-reports/index.html
```

Drill into a package by clicking it in the report, then into a class to see which lines have surviving mutants (highlighted in orange/red).

## Scope Exclusions

### Integration tests excluded

PIT only runs test classes matching `com.psybergate.recruitment.*Test`. Classes ending in `IntegrationTest` are additionally excluded via `<excludedTestClasses>`. This is intentional:

- Integration tests spin up a Testcontainers PostgreSQL instance per class
- PIT forks a JVM per mutant and re-runs the test suite for each — typically 600+ iterations
- Including integration tests would make a single PIT run take 30–60 minutes and require Docker in the CI agent

### DTO classes excluded from mutation targets

Classes under `com.psybergate.recruitment.*.dto.*` are excluded from `<targetClasses>`. These are plain records/classes with Lombok-generated accessors. PIT would generate hundreds of mutants for `getX()`/`setX()` with no meaningful test signal.

## Raising the Threshold

After writing new tests for a package, re-run PIT, check the new overall score, and update `<mutationThreshold>` to `max(current_threshold, new_score - 5)` in `pom.xml`. Document the updated baseline in this file.
