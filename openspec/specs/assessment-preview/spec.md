# assessment-preview Specification

## Purpose
TBD - created by archiving change ep-03-assessment-builder. Update Purpose after archive.
## Requirements
### Requirement: Admin and Recruiter can preview an assessment from a candidate's perspective
The system SHALL expose `GET /api/assessments/{id}/preview` returning a read-only candidate-facing view of the assessment. The preview response SHALL include the assessment title, description, time limit, and the ordered list of questions as a candidate would see them (question body, type, and MCQ options — but NOT admin fields such as correct option markers, `createdBy`, or internal IDs beyond what a candidate would need). The preview SHALL be available for both DRAFT and PUBLISHED assessments so that assessors can quality-check before publishing.

#### Scenario: Preview a DRAFT assessment
- **WHEN** an Admin or Recruiter calls `GET /api/assessments/{id}/preview` on a DRAFT assessment
- **THEN** the response is HTTP 200 with the candidate-perspective question list in displayOrder sequence

#### Scenario: Preview a PUBLISHED assessment
- **WHEN** an Admin or Recruiter calls `GET /api/assessments/{id}/preview` on a PUBLISHED assessment
- **THEN** the response is HTTP 200 with the candidate-perspective question list in displayOrder sequence

#### Scenario: Preview response does not expose correct option markers for MCQ
- **WHEN** an Admin or Recruiter calls `GET /api/assessments/{id}/preview` for an assessment with MCQ questions
- **THEN** the MCQ options in the response do NOT include the `isCorrect` flag — options are presented as plain choices

#### Scenario: Preview for non-existent assessment returns 404
- **WHEN** an Admin or Recruiter calls `GET /api/assessments/{id}/preview` with an ID that does not exist
- **THEN** the response is HTTP 404

#### Scenario: Candidate role cannot access the preview endpoint
- **WHEN** a request to `GET /api/assessments/{id}/preview` is made with a candidate session JWT
- **THEN** the response is HTTP 403

### Requirement: Preview renders all supported question types
The preview response SHALL correctly represent each question type: MCQ (with options, no correct marker), TEXT (body only), and CODE_SUBMISSION (body and optional languageHint).

#### Scenario: Preview renders MCQ question with options
- **WHEN** an assessment contains an MCQ question and an Admin or Recruiter calls its preview
- **THEN** the MCQ question in the response includes the question body and all answer option texts

#### Scenario: Preview renders CODE_SUBMISSION question with language hint
- **WHEN** an assessment contains a CODE_SUBMISSION question that has a `languageHint`
- **THEN** the preview response includes the `languageHint` field for that question

