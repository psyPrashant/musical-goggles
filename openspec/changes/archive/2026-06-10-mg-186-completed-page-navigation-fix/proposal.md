## Why

Clicking a row on the Completed Assessments page navigates to the Results page but the specific submission is never selected — the recruiter lands on a blank detail panel and must manually find the candidate. The root cause is a query-param name mismatch: the Completed page sends `submissionId` but the Results page reads `submission`.

## What Changes

- Fix `CompletedAssessmentsComponent.viewResult()` to use query param `submission` (matching what `ResultsComponent` already reads).
- Also pass `assessmentId` as a second query param so the Results page pre-sets its assessment filter.
- Update `ResultsComponent.ngOnInit()` to read `assessmentId` query param and set `assessmentFilter` signal on load, so the submission list is pre-filtered to the relevant assessment.

## Capabilities

### New Capabilities
- `completed-page-deep-link`: Clicking a completed-assessment row deep-links to the Results page with the target submission auto-selected and the assessment filter pre-set.

### Modified Capabilities
<!-- No existing spec-level requirement changes. -->

## Impact

- `recruitment-fe/src/app/features/completed-assessments/completed-assessments.component.ts` — `viewResult()` method
- `recruitment-fe/src/app/features/results/results.component.ts` — `ngOnInit()` query-param handling
