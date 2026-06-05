## Context

The recruitment platform's staff dashboard (`GET /api/dashboard/stats`, `DashboardComponent`) currently shows a 5-stage candidate pipeline and a recent activity feed as static, non-interactive elements. The results page (`/results`, `ResultsComponent`) supports selecting submissions from a sidebar list but has no URL-based entry point. All DTO changes are additive — no existing fields are removed or renamed.

Key constraints:
- Frontend: Angular 21 standalone components, signals-based state, no NgModules.
- Backend: Spring Boot 4, Java records for DTOs, Spring Security role guards.
- `SubmissionSummaryResponse` is consumed by the results page and flagged-submissions page; enriching it must not break those consumers.

## Goals / Non-Goals

**Goals:**
- Add `submissionId` to `ActivityEvent` so the frontend can deep-link to a result.
- Add `assessmentId` / `assessmentTitle` to `SubmissionSummaryResponse` for client-side filtering.
- New `GET /api/submissions/completed` endpoint (submitted + auto-submitted only).
- Dashboard pipeline cards expand an inline candidate panel; activity items navigate to results.
- New `/completed-assessments` page with assessment and pass/fail filters.
- Results page accepts `?submissionId=` query param and auto-selects on load.

**Non-Goals:**
- Pagination on the completed assessments page (client-side filtering of the full list is sufficient at current scale).
- Server-side filtering by assessment or pass/fail.
- Any change to how pipeline stage counts are calculated on the backend.

## Decisions

**1. Inline panel vs. navigation for pipeline drilldown (MG-148)**
*Decision:* Inline expandable panel below the pipeline grid, not a separate route.
*Rationale:* Preserves dashboard context; toggling feels lighter than a page transition for a count-based exploration. A route would require the backend to expose per-stage candidate lists as a dedicated endpoint.
*Alternative considered:* Navigate to `/results?status=invited` — rejected because the results page status filter does not map 1:1 to pipeline stages (pending review is a derived state, not a raw submission status).

**2. Client-side vs. server-side pipeline candidate data (MG-148)**
*Decision:* Load all submissions from the existing `GET /api/submissions` once on dashboard init; derive pipeline buckets client-side using the same logic as `DashboardServiceImpl`.
*Rationale:* Avoids a new backend endpoint; the submission list is already loaded by the results page and is small enough for client-side work.
*Risk:* Dashboard now makes two HTTP calls on load (stats + submissions). Acceptable at current scale.

**3. Pass threshold for completed assessments (MG-149)**
*Decision:* Pass = `totalScore / maxScore ≥ 0.5` (50%), computed client-side.
*Rationale:* No configurable threshold exists in the domain model. 50% is the conventional default and matches the visual score percentage already shown on results. This can be revisited if a per-assessment threshold is added later.

**4. Assessment title resolution in SubmissionServiceImpl (MG-149)**
*Decision:* Batch-load `Assessment` entities by ID after collecting submission IDs, using `assessmentRepository.findAllById()`. Build a `Map<UUID, String>` for title lookup.
*Rationale:* Avoids N+1 queries; `assessmentRepository` is already injected in `SubmissionServiceImpl`.

**5. Query param auto-select in results page (MG-150)**
*Decision:* Read `ActivatedRoute.snapshot.queryParamMap` after the submissions list loads; find and select the matching item synchronously.
*Rationale:* Snapshot read is simpler than a reactive subscription since it only needs to fire once on initial load. If the submissions are already loaded, the check runs immediately in the `next` callback.

## Risks / Trade-offs

- **Stale pipeline counts:** Dashboard loads stats and submissions in separate calls; counts from `PipelineStats` and counts derived from the submissions list may briefly differ if data changes between the two calls.  
  → Mitigation: Acceptable for a dashboard view; no realtime requirement exists.

- **Large submissions list:** `GET /api/submissions` returns all submissions with no pagination. If the dataset grows significantly, the dashboard init load could become slow.  
  → Mitigation: The `/api/submissions/completed` endpoint introduced for MG-149 limits scope. MG-148 continues to use the full list; add pagination as a separate concern if needed.

- **`SubmissionSummaryResponse` enrichment may affect serialisation tests** if any test asserts on the exact JSON shape.  
  → Mitigation: Fields are additive; existing assertions remain valid. New fields will be null-safe (nullable `assessmentTitle`).
