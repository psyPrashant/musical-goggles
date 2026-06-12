## ADDED Requirements

### Requirement: Recruiter can score a text or code answer with a score and feedback
The system SHALL expose a `PUT /api/submissions/{submissionId}/answers/{answerId}/score` endpoint accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The request SHALL accept a `score` (non-negative integer) and an optional `feedback` string. The endpoint SHALL upsert the `AnswerScore` for the given answer — creating it if absent, overwriting it if present — with `isAutoMarked: false`, `markedBy` set to the authenticated user's ID, and `markedAt` set to the current timestamp.

#### Scenario: First-time manual score is created
- **WHEN** a recruiter submits `PUT /api/submissions/{submissionId}/answers/{answerId}/score` with `score: 7` and `feedback: "Good explanation"`
- **THEN** the response is HTTP 200 with the created `AnswerScore` including `score: 7`, `feedback`, `isAutoMarked: false`, `markedBy`, and `markedAt`

#### Scenario: Existing score is updated (re-mark)
- **WHEN** a recruiter submits a new score for an answer that already has an `AnswerScore`
- **THEN** the existing `AnswerScore` is overwritten with the new values and `markedAt` is refreshed

#### Scenario: Score with no feedback is accepted
- **WHEN** a recruiter submits a score with no `feedback` field
- **THEN** the score is persisted with `feedback: null`

#### Scenario: Answer does not belong to the specified submission
- **WHEN** the `answerId` in the URL does not belong to `submissionId`
- **THEN** the response is HTTP 404

#### Scenario: Submission does not exist
- **WHEN** the `submissionId` in the URL does not correspond to any `CandidateSubmission`
- **THEN** the response is HTTP 404

#### Scenario: Candidate cannot access the marking endpoint
- **WHEN** a request with `role=CANDIDATE` JWT calls the score endpoint
- **THEN** the response is HTTP 403

### Requirement: Manual scoring records who marked the answer and when
The `AnswerScore` written by manual marking SHALL always contain a non-null `markedBy` (the ID of the authenticated recruiter/admin) and a non-null `markedAt` timestamp. This information SHALL be included in the result summary response to support audit trails.

#### Scenario: Marker identity is captured from JWT
- **WHEN** a recruiter with user ID `abc-123` submits a manual score
- **THEN** `AnswerScore.markedBy` equals `abc-123`

### Requirement: Code submission answers display with syntax highlighting in the marking view
The marking/results view SHALL render `CODE_SUBMISSION` answers (top-level and within GROUP questions) as read-only syntax-highlighted Java code instead of plain text. The display MUST be read-only — markers cannot modify the candidate's submitted code. When a code question has no answer, the existing empty-answer display SHALL be kept.

#### Scenario: Submitted code is highlighted for the marker
- **WHEN** a marker opens a submission containing a `CODE_SUBMISSION` answer
- **THEN** the answer renders as read-only Java code with syntax highlighting

#### Scenario: Marker cannot edit the displayed code
- **WHEN** a marker clicks into the displayed code
- **THEN** the content cannot be modified

#### Scenario: Unanswered code question keeps existing display
- **WHEN** a marker views a `CODE_SUBMISSION` question the candidate did not answer
- **THEN** the existing empty/unanswered presentation is shown
