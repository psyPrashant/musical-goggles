## MODIFIED Requirements

### Requirement: Candidate explicitly submits their assessment
The system SHALL expose a `POST /api/take/submit` endpoint secured by the candidate session JWT. The endpoint SHALL lock the `CandidateSubmission` by setting its status to `SUBMITTED` (or `AUTO_SUBMITTED` when the `autoSubmitted` flag is true), record `submittedAt`, transition the associated `CandidateInvitation` status to `COMPLETED`, **and trigger MCQ auto-marking for all MCQ answers in the submission** — all within a single transaction. The response SHALL include the submission ID, final status, and `submittedAt` timestamp.

#### Scenario: Manual submission locks the attempt
- **WHEN** a candidate calls `POST /api/take/submit` with `autoSubmitted: false` and their submission is `IN_PROGRESS`
- **THEN** the response is HTTP 200 with submission status `SUBMITTED` and `submittedAt` populated
- **AND** the `CandidateSubmission` is persisted as `SUBMITTED`
- **AND** the linked `CandidateInvitation` status is updated to `COMPLETED`
- **AND** `AnswerScore` rows are written for all MCQ answers in the submission

#### Scenario: Auto-submission on timer expiry locks the attempt
- **WHEN** the frontend timer reaches zero and calls `POST /api/take/submit` with `autoSubmitted: true`
- **THEN** the response is HTTP 200 with submission status `AUTO_SUBMITTED` and `submittedAt` populated
- **AND** MCQ auto-marking runs and `AnswerScore` rows are written for all MCQ answers

#### Scenario: Submitting an already-locked attempt is idempotent
- **WHEN** a candidate calls `POST /api/take/submit` on a submission already in `SUBMITTED` or `AUTO_SUBMITTED` state
- **THEN** the response is HTTP 200 with the existing submission status and original `submittedAt` — no duplicate records created and auto-marking is NOT re-run

#### Scenario: Submission is rejected if no active IN_PROGRESS attempt exists
- **WHEN** a candidate calls `POST /api/take/submit` but no `CandidateSubmission` record exists for their JWT claims
- **THEN** the response is HTTP 404

#### Scenario: Auto-marking failure rolls back the entire submission
- **WHEN** an error occurs during MCQ auto-marking inside the submit transaction
- **THEN** the submission is NOT locked, no `AnswerScore` rows are persisted, and the API returns HTTP 500
