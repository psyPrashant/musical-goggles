## Why

Recruiters using the Results & Evaluation page see submissions across all assessments mixed together, making it hard to focus on a specific role or test. Adding an assessment filter lets them quickly scope the list to a single assessment without changing the existing status filters.

## What Changes

- Add an "All Assessments" dropdown to the Results page header, populated from the unique assessments present in the loaded submission list
- Filter the submission list client-side by the selected assessment (composable with the existing status filter)
- The submission count in the page sub-header should reflect the filtered count

## Capabilities

### New Capabilities
- `assessment-filter`: Assessment dropdown filter on the Results & Evaluation page — derives available options from loaded submissions, applies client-side alongside the existing status filter

### Modified Capabilities
<!-- none — no existing spec-level behaviour changes -->

## Impact

- `recruitment-fe/src/app/features/results/results.component.ts` — add `assessmentFilter` signal, update `filteredSubmissions` computed, add dropdown to template
- No backend changes required — `SubmissionSummary` already returns `assessmentId` and `assessmentTitle`
- No new API endpoints or migrations
