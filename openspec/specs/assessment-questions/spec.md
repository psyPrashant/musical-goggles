# assessment-questions Specification

## Purpose
TBD - created by archiving change ep-03-assessment-builder. Update Purpose after archive.
## Requirements
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

### Requirement: Question order within an assessment is configurable
The ordered list of questions returned by `GET /api/assessments/{id}` SHALL be sorted ascending by `displayOrder`. The display order of an existing question SHALL be updatable by re-adding it with a different `displayOrder` (idempotent add updates the order).

#### Scenario: Questions are returned in displayOrder sequence
- **WHEN** an authenticated Admin or Recruiter calls `GET /api/assessments/{id}` for an assessment with multiple questions
- **THEN** the questions array in the response is sorted ascending by their `displayOrder`

### Requirement: Recruiter can access a candidate-facing preview of an assessment from the assessments list
The assessments list view SHALL include a "Preview" action on each assessment row that navigates to the candidate-facing assessment preview page (`/assessments/:id/preview`). The preview page already exists; this requirement adds the shortcut from the list.

#### Scenario: Preview button navigates to assessment preview
- **WHEN** a recruiter clicks the "Preview" button on any assessment row in the assessments list
- **THEN** the recruiter is navigated to `/assessments/{id}/preview` and the candidate-facing preview is displayed

#### Scenario: Preview is available for both DRAFT and PUBLISHED assessments
- **WHEN** the assessments list shows a mix of DRAFT and PUBLISHED assessments
- **THEN** the Preview button is visible and functional for all assessments regardless of status

### Requirement: Assessment preview renders GROUP questions with their full sub-question list
The assessment preview page (`AssessmentPreviewComponent`) SHALL render GROUP questions by showing the group body as a preamble paragraph, followed by an ordered list of sub-questions. Each sub-question SHALL be rendered with its type badge and body text. MCQ sub-questions SHALL additionally render their answer options. The sub-question list SHALL use the same visual patterns as top-level question cards.

#### Scenario: GROUP question shows preamble and sub-questions
- **WHEN** a recruiter views the candidate-facing preview of an assessment containing a GROUP question
- **THEN** the GROUP card displays the group body as a preamble, followed by numbered sub-question entries each showing a type badge and question body

#### Scenario: MCQ sub-question within a GROUP shows answer options
- **WHEN** a GROUP question contains an MCQ sub-question
- **THEN** the MCQ sub-question entry in the preview displays its answer options labelled A, B, C… in the same style as standalone MCQ questions

#### Scenario: Non-GROUP questions are unaffected
- **WHEN** the assessment preview renders MCQ, TEXT, or CODE_SUBMISSION questions at the top level
- **THEN** their rendering is unchanged from before this change

