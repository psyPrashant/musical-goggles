## ADDED Requirements

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

### Requirement: Server enforces the submission deadline
The backend SHALL reject new draft saves (via `PUT /api/take/answers`) if the current time exceeds the submission deadline (`startedAt + timeLimitMinutes`). After the deadline, only the submit endpoint is accepted. The submit endpoint itself SHALL be accepted regardless of whether the deadline has passed (to handle late auto-submit calls due to network delay).

#### Scenario: Draft save after deadline is rejected
- **WHEN** a candidate calls `PUT /api/take/answers` after the deadline has passed and the submission is still `IN_PROGRESS`
- **THEN** the response is HTTP 409 with a message indicating the time limit has expired

#### Scenario: Submit accepted after deadline
- **WHEN** a candidate calls `POST /api/take/submit` after the deadline has passed
- **THEN** the response is HTTP 200 and the submission is locked normally

### Requirement: Candidate receives a confirmation after submission
The `POST /api/take/submit` response SHALL include sufficient information for the frontend to render a confirmation screen: submission ID, assessment title, `submittedAt` timestamp, and the number of answered questions out of the total.

#### Scenario: Confirmation data is returned on successful submission
- **WHEN** a candidate successfully submits
- **THEN** the response body includes `submissionId`, `assessmentTitle`, `submittedAt`, `answeredCount`, and `totalQuestionCount`

### Requirement: Countdown timer deadline is surfaced to the frontend
The `GET /api/take/assessment` response SHALL include an absolute UTC `deadline` timestamp computed as `startedAt + timeLimitMinutes` so the frontend can initialise or resume the countdown timer correctly without trusting the client clock.

#### Scenario: Deadline is stable across page refreshes
- **WHEN** a candidate refreshes the page mid-assessment and calls `GET /api/take/assessment` again
- **THEN** the `deadline` in the response is the same absolute timestamp as on the first load, derived from the stored `startedAt`
