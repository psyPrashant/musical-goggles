## Why

The staff dashboard surfaces high-level pipeline numbers and recent activity, but none of those elements are interactive — recruiters cannot drill into a pipeline stage to see which candidates are in it, cannot navigate directly from an activity event to the relevant result, and have no dedicated view for browsing completed assessments by test or pass/fail outcome. These gaps mean staff must leave the dashboard, manually navigate to the results page, and re-apply filters every time they want to act on something they see at a glance.

## What Changes

- Pipeline cards on the dashboard become clickable and expand an inline panel listing the candidates in that stage with a direct "View Result" link per candidate.
- Recent activity feed items that correspond to a submission become clickable links that navigate to the results page with that submission pre-selected.
- A new **Completed Assessments** page is added under `/completed-assessments`, showing all submitted results filterable by assessment and pass/all.
- The `ActivityEvent` DTO gains a nullable `submissionId` field so the frontend can construct the navigation target.
- The `SubmissionSummaryResponse` DTO gains `assessmentId` and `assessmentTitle` so the completed assessments page can filter client-side by test.
- A new `GET /api/submissions/completed` endpoint returns only submitted/auto-submitted records.
- The results page gains support for a `?submissionId=` query parameter to auto-select a submission on load.

## Capabilities

### New Capabilities

- `dashboard-pipeline-drilldown`: Clicking a pipeline stage card opens an inline candidate list filtered to that stage, with navigation to individual results.
- `completed-assessments-page`: A dedicated page listing all completed submissions, filterable by assessment and pass/fail outcome.

### Modified Capabilities

- `dashboard-stats`: `ActivityEvent` gains a nullable `submissionId` field; no change to existing fields or query behaviour.
- `submission-listing`: `SubmissionSummaryResponse` gains `assessmentId` and `assessmentTitle`; a new `/completed` endpoint is added; no existing fields removed.
- `result-summary`: Results page gains optional `?submissionId` query param support for deep-linking from dashboard.

## Impact

- **Backend DTOs**: `ActivityEvent`, `SubmissionSummaryResponse` — additive changes only, no breaking changes.
- **Backend services**: `DashboardServiceImpl` (pass submission IDs), `SubmissionServiceImpl` (resolve assessment titles, add completed query).
- **New endpoint**: `GET /api/submissions/completed`.
- **Frontend models**: `ActivityEvent`, `SubmissionSummary` — additive fields.
- **New component**: `CompletedAssessmentsComponent` at `features/completed-assessments/`.
- **Modified components**: `DashboardComponent` (clickable cards + activity links), `ResultsComponent` (query param support).
- **Routing**: new `/completed-assessments` route; sidebar nav link added.
