## 1. Backend — Repository

- [x] 1.1 Add `countDistinctSubmissionIdByStatusIn(Collection<FlagStatus> statuses): long` to `SubmissionFlagRepository` (counts distinct submission IDs with an open flag)

## 2. Backend — Service & Response Model

- [x] 2.1 Add `flagged` field to `PipelineStats` record inside `DashboardStatsResponse`
- [x] 2.2 In `DashboardServiceImpl`, compute `flagged` count using `SubmissionFlagRepository.countDistinctSubmissionIdByStatusIn(FLAGGED, UNDER_REVIEW)`
- [x] 2.3 Include `flagged` value in the `PipelineStats` constructor call in the service

## 3. Backend — Tests

- [x] 3.1 Unit test: `DashboardServiceImpl` returns correct `pipeline.flagged` count when submissions have open flags
- [x] 3.2 Unit test: `pipeline.flagged` = 0 when no open flags exist
- [x] 3.3 Unit test: submission with two open flags counted only once
- [x] 3.4 Integration test: `GET /api/dashboard/stats` response includes `pipeline.flagged` field

## 4. Frontend — Flagged Submissions List — Row Navigation

- [x] 4.1 Wrap each table row (`<tr>`) in `FlaggedSubmissionsComponent` with `[routerLink]="['/results']" [queryParams]="{submission: flag.submissionId}"` (or use a containing `<a>` element styled as a row)
- [x] 4.2 Ensure `stopPropagation()` is called on the Dismiss button click to prevent row navigation from firing when Dismiss is clicked
- [x] 4.3 Import `RouterLink` directive into `FlaggedSubmissionsComponent` (standalone component)

## 5. Frontend — Flagged Submissions List — Inline Dismiss

- [x] 5.1 Add `dismissingFlagId = signal<string | null>(null)` to track which row is in-flight
- [x] 5.2 Add `dismissError = signal<string | null>(null)` to hold per-row error messages
- [x] 5.3 Add `dismissFlag(flag: FlagListItem)` method:
  - If `flag.status === 'FLAGGED'`: call `transitionFlag(UNDER_REVIEW)` then `transitionFlag(DISMISSED, "Dismissed from flagged list")`
  - If `flag.status === 'UNDER_REVIEW'`: call `transitionFlag(DISMISSED, "Dismissed from flagged list")`
  - On success: remove the row from the local `flags` signal list
  - On error: set `dismissError` with a user-facing message
- [x] 5.4 Add "Dismiss" button to each row, visible only when `flag.status === 'FLAGGED' || flag.status === 'UNDER_REVIEW'`
- [x] 5.5 Show loading indicator on the row while `dismissingFlagId() === flag.flagId`
- [x] 5.6 Show inline error message below the row when `dismissError` is set for that flag

## 6. Frontend — Dashboard Pipeline

- [x] 6.1 Add `flagged` field to the `PipelineStats` interface in the dashboard model/service file
- [x] 6.2 Add a "Flagged" pipeline stage card/bar segment to `DashboardComponent` template, bound to `stats.pipeline.flagged`
- [x] 6.3 Style the "Flagged" stage with a warning/amber colour consistent with the existing pipeline bar theme

## 7. Frontend — Tests

- [x] 7.1 Component spec: clicking a flagged submission row triggers navigation to `/results?submission={id}`
- [x] 7.2 Component spec: clicking Dismiss does NOT trigger row navigation
- [x] 7.3 Component spec: `dismissFlag()` removes the row on success; shows error message on failure
- [x] 7.4 Component spec: Dismiss button not shown for RESOLVED or DISMISSED rows
- [x] 7.5 Component spec: Dashboard renders "Flagged" pipeline stage with value from `pipeline.flagged`
