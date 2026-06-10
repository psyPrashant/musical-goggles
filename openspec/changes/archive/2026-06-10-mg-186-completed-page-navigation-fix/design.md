## Context

The Results page (`/results`) already supports deep-linking via a `submission` query param read in `ngOnInit()`. The Completed Assessments page navigates to `/results?submissionId=<id>` — a typo in the param name (`submissionId` vs `submission`) means the Results page never finds a match and the detail panel stays empty. Additionally, passing the `assessmentId` allows the Results page to pre-filter its left-panel list, reducing cognitive load.

## Goals / Non-Goals

**Goals:**
- Fix the param name so the correct submission is auto-selected on arrival.
- Pre-set the Results page assessment filter using `assessmentId`.
- No backend changes required.

**Non-Goals:**
- Changing the Results page URL structure or adding route segments.
- Altering how the Results page loads submissions (still calls `listAllSubmissions()`).

## Decisions

**Query params over route segments** — `/results?submission=X&assessmentId=Y` keeps the Results page bookmarkable from multiple entry points (flagged page, completed page, direct link) without coupling the route to a specific upstream context. The Results page remains independently navigable.

**Assessment filter via `assessmentId`** — The Results page assessment filter already works off `assessmentId` values (see `availableAssessments()` computed signal). Reading this from the query param at init is a one-liner and is consistent with how `submission` is already handled.

**Read both params before the list resolves** — `assessmentFilter` can be set immediately from query params in `ngOnInit()`, before the subscription resolves. This means the filter is active when `filteredSubmissions()` first computes, avoiding a flash of the unfiltered list.

## Risks / Trade-offs

- [Stale URL] If a user bookmarks `/results?submission=X&assessmentId=Y` and the submission is later deleted, the Results page gracefully degrades (no match found → nothing selected). No extra error handling needed.
- [assessmentId not in SubmissionSummary from completed page] The `SubmissionSummary` model already includes `assessmentId` (confirmed in `results.component.ts` `availableAssessments()` computed). The completed page's `SubmissionSummary` also carries `assessmentId` — no model change needed.
