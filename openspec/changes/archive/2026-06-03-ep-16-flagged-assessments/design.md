## Context

EP-11 built the full flag backend (`SubmissionFlagController`, `SubmissionFlagService`) and wired flag controls into the `ResultsComponent` detail panel. The `FlaggedSubmissionsComponent` (`/flagged-submissions`) lists all flags across all submissions but is currently read-only — rows have no click behaviour and there is no way to act on a flag from the list. The dashboard pipeline bar (`/`) has four stages (Invited, In Progress, Pending Review, Completed) all backed by `GET /api/dashboard/stats`. A "Flagged" stage is missing even though the data to compute it already exists in `submission_flags`.

## Goals / Non-Goals

**Goals:**
- `FlaggedSubmissionsComponent` rows navigate to `ResultsComponent` with the submission pre-selected.
- Inline Dismiss action on open-flag rows transitions the flag to `DISMISSED` without leaving the list.
- Dashboard pipeline gains a `flagged` count; `GET /api/dashboard/stats` response extended with `pipeline.flagged`.

**Non-Goals:**
- No new flag states or transitions beyond what EP-11 already defined.
- No bulk-dismiss or multi-select actions.
- No new routes — `/results?submission=` is the existing navigation target.
- No changes to the `ResultsComponent` — it already reads the `submission` query param.
- No changes to the flag audit trail or flag detail views.

## Decisions

### D1: Inline Dismiss using existing PATCH endpoint, auto-resolution notes
**Decision**: The Dismiss action in `FlaggedSubmissionsComponent` calls `PATCH /api/submissions/{id}/flags/{flagId}` with `{"status": "DISMISSED", "resolutionNotes": "Dismissed from flagged list"}`. The backend already requires non-blank `resolutionNotes` for DISMISSED transitions; the frontend supplies a fixed default so the user is not prompted.
**Rationale**: Avoids a new endpoint and keeps the action lightweight — a single click. Staff who need to write custom notes can still navigate to the Results detail view.
**Alternative considered**: Open a mini-modal to collect notes inline. Rejected — adds friction for a common quick-dismiss action; the audit trail already records actor and timestamp.

### D2: Row navigation via Angular `routerLink`, not programmatic `router.navigate`
**Decision**: Each table row gets `[routerLink]="['/results']" [queryParams]="{submission: flag.submissionId}"` so the browser treats it as a normal link (middle-click, right-click → open in tab all work).
**Rationale**: `routerLink` is the idiomatic Angular navigation pattern and gives free browser link semantics. The `ResultsComponent` already reads `ActivatedRoute.queryParams.submission` to pre-select a submission.

### D3: `pipeline.flagged` is additive — existing consumers unaffected
**Decision**: Add `flagged: int` to the `PipelineStats` record in `DashboardStatsResponse`. The JSON field is new but does not replace or rename any existing field.
**Rationale**: All existing frontend consumers of `pipeline` access named fields — adding `flagged` does not break them. The Angular dashboard component simply reads the new field.

### D4: Flagged count definition — open flags only
**Decision**: `pipeline.flagged` = count of distinct submissions that have at least one flag with status `FLAGGED` or `UNDER_REVIEW`. Resolved and dismissed flags do not count.
**Rationale**: The pipeline represents active work. A resolved flag means the concern was handled; it should not continue to occupy the "Flagged" column.

## Risks / Trade-offs

- **[Risk] Dismiss from list skips the UNDER_REVIEW step** — the valid transition from `FLAGGED` is `FLAGGED → UNDER_REVIEW`, not `FLAGGED → DISMISSED` directly. → **Mitigation**: The Dismiss action first transitions `FLAGGED → UNDER_REVIEW` then `UNDER_REVIEW → DISMISSED` in a single service call, or the backend is adjusted to allow direct `FLAGGED → DISMISSED`. Check `SubmissionFlagService.transitionFlag()` valid transitions before implementing.
- **[Risk] `pipeline.flagged` double-counts** if a submission has two open flags. → **Mitigation**: Query uses `COUNT(DISTINCT submission_id)` not `COUNT(*)`.
- **[Risk] Stale list after dismiss** — after a dismiss, the dismissed row should disappear or update in-place. → **Mitigation**: On successful dismiss, remove the row from the local signal list without a full reload.
