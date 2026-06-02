## Why

Recruiters have no way to see a candidate's full assessment journey from a single view — they must navigate individual submissions scattered across different assessments. This leaves gaps in candidate evaluation and makes it hard to identify patterns of engagement or disengagement.

## What Changes

- New backend endpoint `GET /api/candidates/{id}/history` returns all invitations for a candidate, enriched with submission status, total score, and marking state.
- New candidate history section on the candidate profile in the frontend, showing each assessment entry with status, date, and score inline.
- Filter controls (by status: completed / pending / expired) and sort (newest / oldest) applied client-side.
- Each history entry displays the assessment name and "No linked role" fallback where no job context exists.
- Click-through from each history entry to the full submission detail view in the Results page.

## Capabilities

### New Capabilities

- `candidate-assessment-history`: Recruiter-facing view of all assessments a candidate has been invited to, with submission status, score/marking state, date, and role context. Includes filter-by-status and sort-by-date controls.

### Modified Capabilities

- `submission-listing`: The existing submission listing capability is unchanged in requirements; the new history endpoint is additive and candidate-scoped.

## Impact

- **Backend**: New controller + service method in the `candidate` package. Reads from `candidate_invitations`, `candidate_submissions`, and `answer_scores` — no schema changes.
- **Frontend**: `CandidatesComponent` extended with a history panel/modal; new `CandidateHistoryItem` model type; `CandidateService` gains a `getHistory()` method.
- **No breaking changes** — existing candidate and submission endpoints unchanged.
