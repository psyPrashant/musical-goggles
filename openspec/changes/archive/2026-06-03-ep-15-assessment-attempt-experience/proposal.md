## Why

Candidates currently land directly in a live assessment with no orientation — the timer has already started before they understand the rules, and there is no safe way to exit, give up, or be warned that closing the tab loses time. Staff also receive incomplete result sets when candidates skip questions, because unanswered questions produce no answer record and therefore block marking completion.

## What Changes

- New guide/disclaimer screen shown before the assessment begins, with a Start button that triggers the timer.
- Browser `beforeunload` warning registered while an attempt is in progress so candidates are alerted before accidentally closing the tab.
- "Give Up" button available during an active attempt; confirms intention and submits the assessment as auto-submitted.
- Submit guard prevents silent zero-answer submission by showing a stronger confirmation when no questions have been answered.
- On submit (all paths), the backend automatically creates an `AnswerScore(score=0, autoMarked=true)` for every assessment question that has no candidate answer, ensuring marking status is always computable.

## Capabilities

### New Capabilities

- `assessment-attempt-guide`: Pre-attempt screen that shows assessment title, time limit, question count, and rules. Start button begins the attempt and starts the timer. No backend change — pure frontend state.
- `assessment-attempt-controls`: In-attempt UX guards — browser exit warning (beforeunload), Give Up button with confirmation modal, and submit guard for zero-answer attempts.
- `unanswered-question-scoring`: Backend auto-scores unanswered questions as 0 on every submit path (voluntary submit, Give Up, auto-submit on timer expiry). Uses existing `CandidateAnswer` and `AnswerScore` tables; no schema change.

### Modified Capabilities

## Impact

- **Frontend**: `AssessmentTakeComponent` gains a `phase` signal (`'guide' | 'in-progress' | 'submitted'`), a `beforeunload` listener, a Give Up modal, and a zero-answer submit guard. No new routes or services.
- **Backend**: `CandidateTakeServiceImpl.submitAssessment()` extended to create answer + score records for unanswered questions after `autoMarkMcq()`. `CandidateAnswerRepository` gains a query to find answered question IDs for a submission.
- **No breaking changes** — existing submit endpoint and response contract unchanged.
