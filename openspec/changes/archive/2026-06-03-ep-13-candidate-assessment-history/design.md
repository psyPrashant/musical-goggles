## Context

The platform already holds all the data needed: `candidate_invitations` tracks every invite, `candidate_submissions` records submission state, and `answer_scores` holds per-answer scores. There is currently no single endpoint or UI surface that assembles this into a candidate-level timeline. Recruiters must visit the Results page and manually correlate submissions back to a candidate.

The existing `CandidatesComponent` already has a flag-history modal pattern (from EP-11) that can be reused for the assessment history panel.

## Goals / Non-Goals

**Goals:**
- Single backend endpoint `GET /api/candidates/{id}/history` aggregates invitations → submissions → scores into a timeline.
- Frontend history modal on the candidate list page shows name, status, date, score, and role context per entry.
- Client-side filter (by submission status) and sort (by date) — no additional API calls needed after load.
- Click-through to the Results page submission detail where a submission exists.
- "No linked role" placeholder for assessments not tied to a job.

**Non-Goals:**
- No new database tables — purely a read-only aggregation over existing data.
- No pagination at MVP — candidate history is expected to be small (<20 entries per candidate).
- Job/role entity does not exist in the system yet; the assessment title serves as the role context (MG-89 "No linked role" is always shown since job linking is out of scope).
- No export or print of history.

## Decisions

### D1: Single aggregated endpoint vs. separate invitation + submission endpoints
**Decision**: One endpoint `GET /api/candidates/{id}/history` returns a `List<CandidateHistoryItemResponse>`.
**Rationale**: The frontend needs all three data sources combined into one display row. Fetching invitations, submissions, and scores separately would require three round trips and client-side joins, increasing complexity for no benefit. The data volume per candidate is small.
**Alternative considered**: Reuse `GET /api/submissions` filtered by candidate. Rejected — invitations without any submission (status=`PENDING`) would be invisible.

### D2: Scoring — total score vs. percentage
**Decision**: Return `totalScore` (integer sum) alongside `markingStatus` (`FULLY_MARKED` / `PENDING_REVIEW`).
**Rationale**: The Results page already uses this pattern; consistent representation across the UI. Percentage requires knowing max possible score which needs a separate query.

### D3: Client-side vs. server-side filtering
**Decision**: Client-side filtering and sorting.
**Rationale**: History per candidate is small. Simpler endpoint; no query param proliferation; instant UX response. Accepted risk: if a candidate has an unusually large history, client-side filtering is still O(n) over a small n.

### D4: History UI placement
**Decision**: Extend the existing flag-history modal pattern — add an "Assessment History" button (📋) alongside the ⚑ flag button on each candidate row. Opens a modal.
**Rationale**: Reuses established modal pattern from EP-11; avoids a full page navigation and keeps the candidate list as the primary surface.

## Risks / Trade-offs

- **[Risk] N+1 score loading**: Loading scores for each submission individually. → **Mitigation**: Batch-load all answer scores for the candidate's submissions in one query.
- **[Risk] "No linked role" always shows**: MG-89 requires job context, but job entities don't exist yet. → **Mitigation**: Always display "No linked role" — the spec is satisfied; job linking is a future epic.
- **[Risk] Submission without invitation**: Unlikely but guard with a null check. → **Mitigation**: Only process invitations; derive submission from `invitationId` lookup.
