# assessment-crud Specification

## Purpose
TBD - created by archiving change ep-03-assessment-builder. Update Purpose after archive.
## Requirements
### Requirement: Admin and Recruiter can create an assessment with metadata
The system SHALL allow an Admin or Recruiter to create an assessment with a `title` (required), `description` (optional), and `timeLimitMinutes` (required, positive integer). A newly created assessment SHALL have status `DRAFT`. The created assessment SHALL be returned in the response with its generated `id`.

#### Scenario: Create assessment with valid metadata
- **WHEN** an Admin or Recruiter submits `POST /api/assessments` with a valid title and timeLimitMinutes
- **THEN** the response is HTTP 201 with the created assessment including `id` and `status: DRAFT`

#### Scenario: Create assessment without title is rejected
- **WHEN** an Admin or Recruiter submits `POST /api/assessments` with no `title`
- **THEN** the response is HTTP 400 with a validation error

#### Scenario: Create assessment with zero or negative time limit is rejected
- **WHEN** an Admin or Recruiter submits `POST /api/assessments` with `timeLimitMinutes` of 0 or negative
- **THEN** the response is HTTP 400 with a validation error

### Requirement: Admin and Recruiter can retrieve assessments
The system SHALL expose `GET /api/assessments` returning a summary list of all assessments (id, title, status, questionCount). `GET /api/assessments/{id}` SHALL return the full assessment detail including the ordered list of associated questions.

#### Scenario: List all assessments
- **WHEN** an authenticated Admin or Recruiter calls `GET /api/assessments`
- **THEN** the response is HTTP 200 with an array of assessment summaries

#### Scenario: Get assessment detail with questions
- **WHEN** an authenticated Admin or Recruiter calls `GET /api/assessments/{id}` with a valid ID
- **THEN** the response is HTTP 200 with the full assessment including its questions ordered by `displayOrder`

#### Scenario: Get non-existent assessment returns 404
- **WHEN** an authenticated user calls `GET /api/assessments/{id}` with an ID that does not exist
- **THEN** the response is HTTP 404

### Requirement: Admin and Recruiter can update assessment metadata
The system SHALL allow updating an assessment's `title`, `description`, and `timeLimitMinutes` via `PUT /api/assessments/{id}`. The `status` field SHALL NOT be updated via this endpoint — status changes use the publish endpoint.

#### Scenario: Update assessment title
- **WHEN** an Admin or Recruiter calls `PUT /api/assessments/{id}` with a new title
- **THEN** the persisted assessment reflects the updated title and the response is HTTP 200

#### Scenario: Status field is ignored in update
- **WHEN** an Admin or Recruiter calls `PUT /api/assessments/{id}` including a `status` field in the body
- **THEN** the status is not changed and the response is HTTP 200

### Requirement: Admin and Recruiter can delete an assessment
The system SHALL allow deleting an assessment via `DELETE /api/assessments/{id}`. Deleting an assessment SHALL cascade-delete its `AssessmentQuestion` records.

#### Scenario: Delete assessment removes question links
- **WHEN** an Admin or Recruiter calls `DELETE /api/assessments/{id}` for an assessment that has questions
- **THEN** the assessment is deleted, the `assessment_questions` rows for that assessment are removed, and the response is HTTP 204

### Requirement: Admin and Recruiter can publish an assessment
The system SHALL allow transitioning an assessment from `DRAFT` to `PUBLISHED` via `PUT /api/assessments/{id}/publish`. A `PUBLISHED` assessment cannot be re-published.

#### Scenario: Publish a DRAFT assessment
- **WHEN** an Admin or Recruiter calls `PUT /api/assessments/{id}/publish` on a DRAFT assessment
- **THEN** the assessment status changes to `PUBLISHED` and the response is HTTP 200

#### Scenario: Publishing an already-PUBLISHED assessment returns 409
- **WHEN** an Admin or Recruiter calls `PUT /api/assessments/{id}/publish` on an already PUBLISHED assessment
- **THEN** the response is HTTP 409 Conflict

### Requirement: Only Admin and Recruiter roles can access assessment endpoints
All assessment CRUD endpoints SHALL require the `ADMIN` or `RECRUITER` role. Unauthenticated requests and requests with `CANDIDATE` role SHALL be rejected.

#### Scenario: Candidate cannot list assessments
- **WHEN** a request to `GET /api/assessments` is made with a candidate session JWT
- **THEN** the response is HTTP 403

