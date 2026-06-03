## Why

The flagged submissions list (built in EP-11) is a read-only table — staff cannot act on a flag or navigate to the attempt without leaving the page. The dashboard pipeline also has no "Flagged" stage, so there is no at-a-glance count of how many candidates have open integrity concerns.

## What Changes

- Rows in `FlaggedSubmissionsComponent` become clickable links that navigate to the Results page with the submission pre-selected, so staff can review the attempt in context.
- An inline "Dismiss" action is added to FLAGGED and UNDER_REVIEW rows, letting staff resolve a flag directly from the list without navigating away.
- The dashboard pipeline bar gains a "Flagged" stage showing the count of submissions with an open flag (status `FLAGGED` or `UNDER_REVIEW`).
- The `GET /api/dashboard/stats` response is extended with `pipeline.flagged` to back the new dashboard stage.

## Capabilities

### New Capabilities

- `flagged-attempt-actions`: Inline dismiss (DISMISSED transition) action on flagged-submission list rows for open flags.
- `flagged-attempt-navigation`: Clicking a row in the flagged submissions list navigates to the Results page with that submission pre-selected.

### Modified Capabilities

- `dashboard-stats`: Pipeline object gains a `flagged` integer count (submissions with status `FLAGGED` or `UNDER_REVIEW`). Dashboard UI shows a new "Flagged" pipeline stage.

## Impact

- **Frontend**: `FlaggedSubmissionsComponent` — rows become router links; inline Dismiss button calls `FlagService.transitionFlag()`; list refreshes after dismiss. `DashboardComponent` — adds "Flagged" pipeline card consuming the new `pipeline.flagged` field.
- **Backend**: `DashboardStatsResponse` (and its nested `PipelineStats` record) gains `flagged` field. `DashboardServiceImpl` queries `SubmissionFlagRepository.countByStatusIn(FLAGGED, UNDER_REVIEW)`. `SubmissionFlagRepository` gains that query method.
- **No breaking changes** — `pipeline.flagged` is additive; existing consumers of the dashboard stats endpoint are unaffected.
