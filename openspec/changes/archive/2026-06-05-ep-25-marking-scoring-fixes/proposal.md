## Why

Two critical bugs in the marking flow prevent recruiters from completing assessments that contain GROUP questions: unanswered GROUP sub-questions cannot be scored because the UI Save button is disabled, and submissions stay stuck as "Pending Review" even after the recruiter has scored every reachable question. Both bugs surface for any submission where a GROUP sub-question was left unanswered by the candidate.

## What Changes

- **New backend endpoint** `PUT /api/submissions/{submissionId}/questions/{questionId}/score` that creates a `CandidateAnswer` on-the-fly when one doesn't exist (unanswered sub-question), then saves the `AnswerScore`. Enables recruiters to score unanswered GROUP sub-questions for the first time.
- **Fix `scoreAnswer` guard in frontend** — `saveScore()` currently silently no-ops when `answerId` is null; update it to call the new `questionId`-based endpoint instead, removing the disabled-button blocker for unanswered GROUP sub-questions.
- **Fix `fullyMarked` computation in `getResult()`** — currently sets `fullyMarked = false` whenever a GROUP sub-question has no `CandidateAnswer`. Change so that a missing `CandidateAnswer` (unanswered question) does NOT block `FULLY_MARKED`; only an answered-but-unscored question (`CandidateAnswer` present, `AnswerScore` absent) should block it.

## Capabilities

### New Capabilities

- `score-unanswered-subquestion`: Scoring endpoint and frontend fallback that allow a recruiter to score a GROUP sub-question even when the candidate left it unanswered (no `CandidateAnswer` row exists).

### Modified Capabilities

- `result-summary`: The `FULLY_MARKED` condition currently blocks on missing `CandidateAnswer` rows; this requirement changes so only answered-but-unscored questions block completion.

## Impact

- **Backend**: `SubmissionServiceImpl` — new `scoreByQuestionId()` method and controller route; `getResult()` `fullyMarked` logic tweak (two lines).
- **Frontend**: `results.component.ts` `saveScore()` — add fallback to `questionId`-based scoring call; `MarkingService` — add new HTTP method.
- **No schema changes** — `CandidateAnswer` and `AnswerScore` tables are unchanged; the new endpoint reuses the existing upsert pattern from `scoreIfUnanswered`.
