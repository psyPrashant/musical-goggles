## ADDED Requirements

### Requirement: CI runs automatically on push and pull request to main
The system SHALL have a GitHub Actions workflow that triggers on every push to `main` and on every pull request targeting `main`. Both backend and frontend pipelines SHALL run in this workflow.

#### Scenario: CI triggers on push to main
- **WHEN** a developer pushes a commit to the `main` branch
- **THEN** the GitHub Actions workflow starts within 60 seconds

#### Scenario: CI triggers on pull request to main
- **WHEN** a pull request is opened or updated targeting `main`
- **THEN** the GitHub Actions workflow runs and its result is reported as a required status check on the PR

### Requirement: Backend CI builds and runs all tests
The backend CI job SHALL checkout the code, set up Java 17, build the project with Maven (`./mvnw clean package`), run all tests (`./mvnw test`), run PIT mutation coverage (`./mvnw test-compile org.pitest:pitest-maven:mutationCoverage`), and upload the mutation report as a workflow artifact. The job SHALL fail if any test fails, the build fails, or the mutation score falls below the configured threshold.

#### Scenario: Successful backend build
- **WHEN** the backend job runs against code with no test failures and mutation score at or above threshold
- **THEN** the job exits with status 0, all tests are reported as passed, and the PIT HTML report is available as a downloadable artifact

#### Scenario: Failed test blocks merge
- **WHEN** a pull request introduces a failing backend test
- **THEN** the CI job exits with a non-zero status and the PR status check is marked as failed

#### Scenario: Mutation score below threshold blocks merge
- **WHEN** a pull request causes the overall mutation score to drop below the configured `mutationThreshold`
- **THEN** the `pitest:mutationCoverage` goal exits non-zero, the CI job fails, and the PR status check is marked as failed

#### Scenario: Mutation report is published as CI artifact
- **WHEN** the backend CI job completes (pass or fail)
- **THEN** the contents of `target/pit-reports/` are uploaded as a GitHub Actions artifact named `pit-mutation-report` and are downloadable from the workflow run summary

#### Scenario: Maven dependencies are cached
- **WHEN** the backend CI job runs and `~/.m2` cache is warm
- **THEN** dependency download is skipped, reducing build time

### Requirement: Frontend CI installs dependencies, type-checks, and runs tests
The frontend CI job SHALL checkout the code, set up Node.js (version matching the project's `.nvmrc` or `package.json` `engines` field), run `npm ci`, then `npx tsc --noEmit` and `npm test`. The job SHALL fail on type errors or test failures.

#### Scenario: Successful frontend CI
- **WHEN** the frontend job runs against code with no type errors and all tests passing
- **THEN** the job exits with status 0

#### Scenario: Type error blocks merge
- **WHEN** a pull request introduces a TypeScript type error
- **THEN** `npx tsc --noEmit` exits non-zero and the job fails

#### Scenario: node_modules cache is used
- **WHEN** `package-lock.json` has not changed since the last run
- **THEN** `node_modules` is restored from cache and `npm ci` download is skipped

### Requirement: Backend and frontend jobs run in parallel
The workflow SHALL run the backend and frontend jobs as parallel jobs in a single workflow file, not sequentially, to minimise total CI wall-clock time.

#### Scenario: Both jobs run concurrently
- **WHEN** the workflow is triggered
- **THEN** both the backend job and the frontend job start at the same time without one waiting for the other
