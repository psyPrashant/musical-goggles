## MODIFIED Requirements

### Requirement: An assessment may contain at most one top-level CODE_SUBMISSION question
The system SHALL enforce that no more than one top-level question of type `CODE_SUBMISSION` is added to a single assessment. Sub-questions inside a GROUP question do not count as top-level questions and are not subject to this limit. Attempting to add a second top-level `CODE_SUBMISSION` question SHALL be rejected at the API level.

#### Scenario: Adding a second top-level CODE_SUBMISSION question is rejected
- **WHEN** an Admin or Recruiter attempts to add a top-level `CODE_SUBMISSION` question to an assessment that already contains one top-level `CODE_SUBMISSION` question
- **THEN** the response is HTTP 422 Unprocessable Entity with an error message explaining the constraint

#### Scenario: Adding a non-CODE_SUBMISSION question when limit is reached is allowed
- **WHEN** an Admin or Recruiter adds an MCQ, TEXT, or GROUP question to an assessment that already contains one top-level `CODE_SUBMISSION` question
- **THEN** the question is added successfully and the response is HTTP 201

#### Scenario: Adding the first CODE_SUBMISSION question is allowed
- **WHEN** an Admin or Recruiter adds the first top-level `CODE_SUBMISSION` question to an assessment that has none
- **THEN** the question is added successfully and the response is HTTP 201

#### Scenario: GROUP question containing a CODE_SUBMISSION sub-question does not trigger the top-level limit
- **WHEN** an Admin or Recruiter adds a GROUP question that contains a `CODE_SUBMISSION` sub-question to an assessment that already contains one top-level `CODE_SUBMISSION` question
- **THEN** the GROUP question is added successfully and the response is HTTP 201

## ADDED Requirements

### Requirement: Assessment preview includes sub-questions for GROUP type questions
The assessment preview response (`GET /api/assessments/{id}/preview`) SHALL include a `subQuestions` field on GROUP-type questions, containing the ordered list of sub-questions with their full question detail (id, type, body, options for MCQ, languageHint for CODE_SUBMISSION).

#### Scenario: Preview includes sub-questions for GROUP question
- **WHEN** an authenticated user calls `GET /api/assessments/{id}/preview` for an assessment containing a GROUP question
- **THEN** the GROUP question in the response includes a non-null `subQuestions` array with one entry per member question
- **AND** each sub-question entry includes `id`, `type`, `body`, and type-specific fields

#### Scenario: Preview sub-questions list is null for non-GROUP questions
- **WHEN** the preview response contains an MCQ, TEXT, or CODE_SUBMISSION question
- **THEN** the `subQuestions` field is absent or null for that question
