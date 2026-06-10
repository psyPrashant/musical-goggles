## MODIFIED Requirements

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
