## ADDED Requirements

### Requirement: Admin and Recruiter can add a question from the question bank to an assessment
The system SHALL allow adding any existing question (by `questionId`) to an assessment via `POST /api/assessments/{id}/questions`. The request SHALL include a `displayOrder` (positive integer) that determines the question's position within the assessment. Each question SHALL appear at most once per assessment — adding the same question twice SHALL be idempotent (return HTTP 200 without creating a duplicate).

#### Scenario: Add a question with display order
- **WHEN** an Admin or Recruiter submits `POST /api/assessments/{id}/questions` with a valid `questionId` and `displayOrder`
- **THEN** the question is linked to the assessment at the specified position and the response is HTTP 201

#### Scenario: Add a question that does not exist returns 404
- **WHEN** an Admin or Recruiter submits `POST /api/assessments/{id}/questions` with a `questionId` that does not exist in the question bank
- **THEN** the response is HTTP 404

#### Scenario: Adding the same question again is idempotent
- **WHEN** an Admin or Recruiter submits `POST /api/assessments/{id}/questions` with a `questionId` already in the assessment
- **THEN** the response is HTTP 200 and no duplicate `assessment_questions` record is created

#### Scenario: Add without displayOrder is rejected
- **WHEN** an Admin or Recruiter submits `POST /api/assessments/{id}/questions` with no `displayOrder`
- **THEN** the response is HTTP 400 with a validation error

### Requirement: Admin and Recruiter can remove a question from an assessment
The system SHALL allow removing a question from an assessment via `DELETE /api/assessments/{id}/questions/{questionId}`. Removing a question from an assessment SHALL NOT delete the question from the question bank.

#### Scenario: Remove a question from an assessment
- **WHEN** an Admin or Recruiter calls `DELETE /api/assessments/{id}/questions/{questionId}`
- **THEN** the `assessment_questions` record is deleted, the question remains in the bank, and the response is HTTP 204

#### Scenario: Remove a question not in the assessment returns 404
- **WHEN** an Admin or Recruiter calls `DELETE /api/assessments/{id}/questions/{questionId}` for a question not linked to that assessment
- **THEN** the response is HTTP 404

### Requirement: An assessment may contain at most one CODE_SUBMISSION question
The system SHALL enforce that no more than one question of type `CODE_SUBMISSION` is added to a single assessment. Attempting to add a second `CODE_SUBMISSION` question SHALL be rejected at the API level.

#### Scenario: Adding a second CODE_SUBMISSION question is rejected
- **WHEN** an Admin or Recruiter attempts to add a `CODE_SUBMISSION` question to an assessment that already contains one
- **THEN** the response is HTTP 422 Unprocessable Entity with an error message explaining the constraint

#### Scenario: Adding a non-CODE_SUBMISSION question when limit is reached is allowed
- **WHEN** an Admin or Recruiter adds an MCQ or TEXT question to an assessment that already contains one `CODE_SUBMISSION` question
- **THEN** the question is added successfully and the response is HTTP 201

#### Scenario: Adding the first CODE_SUBMISSION question is allowed
- **WHEN** an Admin or Recruiter adds the first `CODE_SUBMISSION` question to an assessment that has none
- **THEN** the question is added successfully and the response is HTTP 201

### Requirement: Question order within an assessment is configurable
The ordered list of questions returned by `GET /api/assessments/{id}` SHALL be sorted ascending by `displayOrder`. The display order of an existing question SHALL be updatable by re-adding it with a different `displayOrder` (idempotent add updates the order).

#### Scenario: Questions are returned in displayOrder sequence
- **WHEN** an authenticated Admin or Recruiter calls `GET /api/assessments/{id}` for an assessment with multiple questions
- **THEN** the questions array in the response is sorted ascending by their `displayOrder`
