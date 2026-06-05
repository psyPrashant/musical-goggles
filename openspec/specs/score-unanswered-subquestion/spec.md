## ADDED Requirements

### Requirement: Recruiter can score a question that has no candidate answer
The system SHALL expose a `PUT /api/submissions/{submissionId}/questions/{questionId}/score` endpoint accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. When no `CandidateAnswer` exists for the given `questionId` on that submission, the system SHALL create one (with null content, `savedAt = now()`, `draft = false`) before saving the `AnswerScore`. The request SHALL accept a `score` (non-negative integer) and an optional `feedback` string. The response SHALL return the `AnswerScoreResponse` including the `answerId` of the created or found `CandidateAnswer`.

#### Scenario: Score an unanswered GROUP sub-question for the first time
- **WHEN** a recruiter submits `PUT /api/submissions/{submissionId}/questions/{questionId}/score` with `score: 3`
- **AND** no `CandidateAnswer` exists for that `questionId` on that submission
- **THEN** the system creates a `CandidateAnswer` with null content
- **AND** creates an `AnswerScore` with `score: 3`, `isAutoMarked: false`, `markedBy` set to the authenticated user's ID
- **AND** responds HTTP 200 with the score details including the new `answerId`

#### Scenario: Re-score via questionId overwrites existing score
- **WHEN** a recruiter submits a score via the questionId endpoint for a question that already has a `CandidateAnswer` and `AnswerScore`
- **THEN** the existing `AnswerScore` is overwritten and `markedAt` is refreshed
- **AND** no duplicate `CandidateAnswer` is created

#### Scenario: Question does not belong to the submission's assessment
- **WHEN** the `questionId` does not belong to any question in the submission's assessment (including GROUP sub-questions)
- **THEN** the response is HTTP 404

#### Scenario: Submission does not exist
- **WHEN** the `submissionId` does not correspond to any `CandidateSubmission`
- **THEN** the response is HTTP 404

#### Scenario: Candidate cannot access this endpoint
- **WHEN** a request with `role=CANDIDATE` calls the endpoint
- **THEN** the response is HTTP 403

### Requirement: Frontend uses questionId-based scoring when answerId is absent
The marking UI SHALL call `PUT .../questions/{questionId}/score` whenever a `ResultQuestion` has a null `answerId` (unanswered sub-question). The Save button for GROUP sub-questions SHALL be enabled regardless of whether `answerId` is null.

#### Scenario: Save button enabled for unanswered GROUP sub-question
- **WHEN** a GROUP sub-question entry in the marking detail has `answerId: null`
- **THEN** the Save button is not disabled
- **AND** clicking Save calls the questionId-based scoring endpoint

#### Scenario: After scoring an unanswered sub-question, answerId is populated on refresh
- **WHEN** a recruiter saves a score for a sub-question via the questionId endpoint
- **THEN** the marking detail is re-fetched
- **AND** the sub-question now has a non-null `answerId` in the refreshed result
