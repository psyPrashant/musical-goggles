### Requirement: PIT mutation testing plugin is configured in the Maven build
The `recruitment-be/pom.xml` SHALL include the `pitest-maven` plugin (version 1.17.x) with the `pitest-junit5-plugin` adapter as an intra-plugin dependency. The plugin SHALL be configured with the following defaults:
- `targetClasses`: `com.psybergate.recruitment.*`
- `targetTests`: `com.psybergate.recruitment.*Test` (unit tests only; `*IntegrationTest` classes are excluded)
- `excludedClasses`: `com.psybergate.recruitment.*.dto.*` (Lombok-generated accessor noise)
- `outputFormats`: `HTML` and `XML`
- `reportsDirectory`: `target/pit-reports`
- `timestampedReports`: `false`
- `mutationThreshold`: configured to the project baseline (minimum 60) after MG-167 baseline run

#### Scenario: Developer runs PIT locally
- **WHEN** a developer runs `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage` from `recruitment-be/`
- **THEN** the goal completes without error and an HTML report is written to `target/pit-reports/index.html`

#### Scenario: Report directory is stable across runs
- **WHEN** PIT is run twice in succession
- **THEN** both runs write to `target/pit-reports/` (no timestamped subdirectory is created) and the second run overwrites the first

#### Scenario: Integration tests are not run by PIT
- **WHEN** PIT executes mutation coverage
- **THEN** no class whose name ends in `IntegrationTest` is included in the test execution, and no Testcontainer is started during the PIT run

#### Scenario: DTO accessor methods are excluded from mutation targets
- **WHEN** PIT generates mutants
- **THEN** no mutants are generated for classes under `com.psybergate.recruitment.*.dto.*`

### Requirement: Flag domain achieves minimum mutation coverage threshold
The `com.psybergate.recruitment.flag.*` package SHALL achieve a mutation score of at least 70% as reported by PIT, covering the following logic in `SubmissionFlagServiceImpl`:
- `createFlag`: submission-not-found path, duplicate-open-flag path, successful creation with audit write
- `transitionFlag`: flag-not-found path, ownership mismatch path, invalid transition path, blank-notes-on-close guard, successful UNDER_REVIEW transition, successful RESOLVED transition, successful DISMISSED transition
- `getAuditTrail`: flag-not-found path, ownership mismatch path, successful audit list mapping
- `getFlagsForCandidate`: candidate-not-found path, empty-submissions path, populated result with correct enrichment
- `getAllFlags`: each filter (reason, assessmentId, fromDate, toDate) applied and not applied

#### Scenario: Flag creation audit is verified
- **WHEN** `createFlag` is called with a valid submission and no existing open flag
- **THEN** a test asserts that `auditRepository.save` was called with `action = "CREATED"`, `fromStatus = null`, and `toStatus = FLAGGED`

#### Scenario: Ownership mismatch on transition is detected
- **WHEN** `transitionFlag` is called with a `submissionId` that does not match the flag's stored `submissionId`
- **THEN** the service throws a `ResponseStatusException` with status 404

#### Scenario: Blank resolution notes on DISMISSED transition are rejected
- **WHEN** `transitionFlag` is called with `newStatus = DISMISSED` and `resolutionNotes` is a blank string (e.g. `"   "`)
- **THEN** the service throws a `ResponseStatusException` with status 400

#### Scenario: getAllFlags filters by date range
- **WHEN** `getAllFlags` is called with a non-null `fromDate` and `toDate`
- **THEN** only flags whose `createdAt` falls within that range are returned

### Requirement: Baseline mutation score and threshold are documented
A `TESTING.md` file SHALL exist in `recruitment-be/` documenting:
- The baseline mutation score recorded after MG-168 test improvements
- The configured threshold value and the rationale for choosing it
- The Maven command for running PIT locally
- A note on which test classes are excluded from PIT scope and why

#### Scenario: New developer can run PIT from documentation alone
- **WHEN** a developer reads `TESTING.md` and follows the instructions
- **THEN** they can run PIT locally and interpret the HTML report without additional guidance
