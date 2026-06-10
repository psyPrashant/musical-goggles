## 1. MG-166 — PIT Plugin Configuration

- [x] 1.1 Add `pitest-maven` 1.17.x plugin block to `recruitment-be/pom.xml` under `<build><plugins>`
- [x] 1.2 Add `pitest-junit5-plugin` 1.2.1 as an intra-plugin `<dependency>` inside the `pitest-maven` plugin block
- [x] 1.3 Configure `<targetClasses>` to `com.psybergate.recruitment.*`
- [x] 1.4 Configure `<targetTests>` to `com.psybergate.recruitment.*Test` (excludes `*IntegrationTest` classes)
- [x] 1.5 Configure `<excludedClasses>` to exclude `com.psybergate.recruitment.*.dto.*`
- [x] 1.6 Configure `<outputFormats>` to include `HTML` and `XML`
- [x] 1.7 Set `<reportsDirectory>target/pit-reports</reportsDirectory>` and `<timestampedReports>false</timestampedReports>`
- [x] 1.8 Set `<mutationThreshold>0</mutationThreshold>` as a placeholder (updated in task 3.3)
- [x] 1.9 Verify locally: run `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage` and confirm `target/pit-reports/index.html` is generated without error

## 2. MG-168 — Flag Domain Unit Test Improvements

- [x] 2.1 Add test: `createFlag_submissionNotFound_throws404` — mock `submissionRepository.findById` returning empty, assert 404 `ResponseStatusException`
- [x] 2.2 Add test: `transitionFlag_flagNotFound_throws404` — mock `flagRepository.findById` returning empty, assert 404
- [x] 2.3 Add test: `transitionFlag_ownershipMismatch_throws404` — flag's `submissionId` differs from the passed `submissionId`, assert 404
- [x] 2.4 Add test: `transitionFlag_dismissedWithBlankNotes_throws400` — `newStatus = DISMISSED`, `resolutionNotes = "   "`, assert 400
- [x] 2.5 Add test: `transitionFlag_validResolveWithNotes_savesAndAudits` — UNDER_REVIEW → RESOLVED with notes, verify `flagRepository.save` and `auditRepository.save` called
- [x] 2.6 Add test: `transitionFlag_validDismissWithNotes_savesAndAudits` — UNDER_REVIEW → DISMISSED with notes, verify save and audit
- [x] 2.7 Add test: `getAuditTrail_happyPath_returnsMappedList` — mock `auditRepository.findByFlagIdOrderByOccurredAtAsc`, assert returned list is correctly mapped to `FlagAuditResponse`
- [x] 2.8 Add test: `getAuditTrail_flagNotFound_throws404`
- [x] 2.9 Add test: `getAuditTrail_ownershipMismatch_throws404`
- [x] 2.10 Add test: `getFlagsForCandidate_candidateNotFound_throws404`
- [x] 2.11 Add test: `getFlagsForCandidate_noSubmissions_returnsEmptyList`
- [x] 2.12 Add test: `getAllFlags_withReasonFilter_returnsOnlyMatchingFlags` — pass a `FlagReason`, assert flags with other reasons are excluded
- [x] 2.13 Add test: `getAllFlags_withDateRangeFilter_excludesFlagsOutsideRange` — set `fromDate`/`toDate`, assert boundary flags are correctly included/excluded
- [x] 2.14 Run `./mvnw test -Dtest=SubmissionFlagServiceTest` and confirm all tests pass
- [x] 2.15 Run PIT locally and confirm `com.psybergate.recruitment.flag.*` mutation score is ≥70% in the HTML report

## 3. MG-167 — Baseline Documentation and CI Threshold

- [x] 3.1 Run `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage` locally with all MG-168 tests in place; record the overall mutation score
- [x] 3.2 Create `recruitment-be/TESTING.md` documenting: baseline score, threshold rationale, local PIT command, scope exclusions (integration tests, DTO classes)
- [x] 3.3 Update `<mutationThreshold>` in `pom.xml` to `max(60, baseline_score - 5)` (rounded down to nearest integer)
- [x] 3.4 Verify threshold enforcement: temporarily lower a passing test assertion to allow a mutant to survive, confirm `pitest:mutationCoverage` exits non-zero; revert
- [x] 3.5 Add PIT step to `.github/workflows/ci.yml` backend job: run `./mvnw test-compile org.pitest:pitest-maven:mutationCoverage` after the `Test` step
- [x] 3.6 Add `actions/upload-artifact` step to `.github/workflows/ci.yml` to upload `recruitment-be/target/pit-reports/` as artifact named `pit-mutation-report` (use `if: always()` so the report uploads even on threshold failure)
- [ ] 3.7 Push a branch and confirm CI passes end-to-end with the PIT step present and the artifact visible on the workflow run summary
