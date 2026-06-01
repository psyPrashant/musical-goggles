## Why

Candidates have been invited and hold session JWTs (EP-05), but the platform has no way for them to actually load and take an assessment. This sprint delivers the complete candidate-facing assessment experience — from opening the assessment through saving draft answers to locking in a final submission.

## What Changes

- New public candidate endpoint: load assessment content (questions + metadata) using a session JWT
- New candidate answer model: persists MCQ selections, free-text responses, and code/file submissions as drafts
- Countdown timer on the frontend enforces the time limit; expiry triggers automatic submission server-side
- Final submission locks the attempt, captures a timestamp, and returns a confirmation to the candidate
- Auto-submit on timer expiry uses the same locking path as explicit submission

## Capabilities

### New Capabilities
- `candidate-assessment-access`: A JWT-authenticated candidate can load the assessment assigned to them — title, instructions, time limit, and ordered question list (MG-31)
- `candidate-answer-draft`: A candidate can save answers incrementally as drafts while working; saved state is reloaded on page refresh; supports MCQ, text, and code/file answer types (MG-33, MG-34)
- `assessment-submission`: A candidate (or the server on timer expiry) can finalize and lock an assessment attempt; the attempt cannot be edited after locking; a confirmation response is returned (MG-32, MG-35)

### Modified Capabilities
<!-- None — candidate-token-auth covers JWT issuance and scoping; no requirement changes needed -->

## Impact

- **Backend — new entities**: `CandidateSubmission`, `CandidateAnswer` (with discriminated storage for MCQ/text/code answer types)
- **Backend — new controllers/services**: `CandidateAssessmentController` (or extend existing), `CandidateAnswerController`
- **Backend — new endpoints**: `GET /api/take/assessment`, `PUT /api/take/answers`, `POST /api/take/submit`
- **Backend — security**: All new endpoints secured by candidate session JWT (`role=CANDIDATE`); answer/submit operations scoped to JWT's `assessmentId` and `candidateId` — no cross-candidate access possible
- **Frontend**: `AssessmentTakeComponent` (already scaffolded with mock data in MG-55) wired to real APIs; autosave on answer change; countdown timer deadline sourced from session start time stored server-side
- **Database**: Two new tables (`candidate_submission`, `candidate_answer`); migration scripts required
- **Dependencies**: Builds on `candidate-token-auth` (session JWT) and `assessment-questions` (question content)
