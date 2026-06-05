## Context

The Results & Evaluation page loads all candidate submissions via `GET /api/submissions` and applies a client-side status filter using Angular signals. `SubmissionSummary` already carries `assessmentId` and `assessmentTitle`, so all data needed for an assessment filter is already present in the response.

## Goals / Non-Goals

**Goals:**
- Add an assessment dropdown to the Results page header
- Filter the submission list client-side by selected assessment, composable with the existing status filter
- Derive dropdown options dynamically from the loaded submissions (no extra API call)

**Non-Goals:**
- Server-side filtering by assessment
- Persisting the selected filter across sessions
- Filtering on any other attribute (date range, score, etc.)

## Decisions

**Client-side filtering only** — the submissions payload already includes `assessmentTitle` on every entry and the list is small enough for in-memory filtering. An extra API call would add latency for no benefit.

**Derive options from submissions, not a separate assessments list** — avoids a second HTTP request and ensures the dropdown only shows assessments that actually have submissions, preventing empty filter states.

**Signal-based state (no new service)** — consistent with the existing `statusFilter` signal pattern in `ResultsComponent`. A new `assessmentFilter = signal('')` drives the `filteredSubmissions` computed alongside the status filter.

**Dropdown over filter chips** — there can be many assessments; chips would overflow. A `<select>` is compact and familiar.

## Risks / Trade-offs

- **Stale options on re-filter** — if a recruiter filters by status first then opens the assessment dropdown, options reflect the full unfiltered list (not the currently visible subset). This is intentional: assessment options should always be stable and not disappear based on status selection.
- **Duplicate assessment names** — deduplicated by `assessmentId` in the component; titles are display-only.
