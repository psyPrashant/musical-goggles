# question-crud Specification

## Purpose
TBD - created by archiving change ep-02-question-bank. Update Purpose after archive.

## Requirements

### Requirement: Admin and Recruiter can create questions of four types
The system SHALL support creating questions of type `MCQ`, `TEXT`, `CODE_SUBMISSION`, and `GROUP`. Every question SHALL have a `title` (short label) and a `body` (the question text presented to the candidate). MCQ questions SHALL additionally require at least two answer options and exactly one correct option marked. GROUP questions SHALL require a `memberQuestionIds` list of at least two existing question ids.

#### Scenario: Create MCQ question with options
- **WHEN** an Admin or Recruiter submits a valid `POST /api/questions` with `type=MCQ` and at least two options (one marked correct)
- **THEN** the question is persisted and the response is HTTP 201 with the created question including its generated `id`

#### Scenario: MCQ question without correct option is rejected
- **WHEN** an Admin or Recruiter submits a `POST /api/questions` with `type=MCQ` and no option marked as `isCorrect=true`
- **THEN** the response is HTTP 400 with a validation error

#### Scenario: Create Text question
- **WHEN** an Admin or Recruiter submits a valid `POST /api/questions` with `type=TEXT`
- **THEN** the question is persisted with no answer options

#### Scenario: Create Code Submission question
- **WHEN** an Admin or Recruiter submits a valid `POST /api/questions` with `type=CODE_SUBMISSION`
- **THEN** the question is persisted with an optional `languageHint` field (e.g., "Java", "Python")

#### Scenario: Create GROUP question
- **WHEN** an Admin or Recruiter submits a valid `POST /api/questions` with `type=GROUP`, a `body`, and `memberQuestionIds` referencing two or more existing questions
- **THEN** the question is persisted and the response is HTTP 201 with the created GROUP question including its `id` and ordered `members`

### Requirement: Questions can be retrieved individually or as a filtered list
The system SHALL expose `GET /api/questions` returning a list of all questions visible to the authenticated user. The endpoint SHALL support optional query parameters `type` (filter by question type) and `tag` (filter by tag name, case-insensitive).

#### Scenario: List all questions
- **WHEN** an authenticated Admin or Recruiter calls `GET /api/questions`
- **THEN** the response is HTTP 200 with an array of all questions (summary view — title, type, tags)

#### Scenario: Filter by type
- **WHEN** an authenticated user calls `GET /api/questions?type=MCQ`
- **THEN** only MCQ questions are returned

#### Scenario: Get a single question with full detail
- **WHEN** an authenticated user calls `GET /api/questions/{id}` with a valid ID
- **THEN** the response includes all fields including MCQ options (if applicable)

#### Scenario: Get non-existent question returns 404
- **WHEN** an authenticated user calls `GET /api/questions/{id}` with an ID that does not exist
- **THEN** the response is HTTP 404

### Requirement: Questions can be updated and deleted
The system SHALL allow updating a question's title, body, options (MCQ), and tags via `PUT /api/questions/{id}`. Questions can be deleted via `DELETE /api/questions/{id}`.

#### Scenario: Update question body
- **WHEN** an Admin or Recruiter calls `PUT /api/questions/{id}` with updated fields
- **THEN** the persisted question reflects the changes and the response is HTTP 200

#### Scenario: Delete question
- **WHEN** an Admin or Recruiter calls `DELETE /api/questions/{id}`
- **THEN** the question is deleted and any group membership rows referencing it are also removed

### Requirement: Only Admin and Recruiter roles can access question endpoints
All question CRUD endpoints SHALL require the `ADMIN` or `RECRUITER` role. Unauthenticated requests and requests with `CANDIDATE` role SHALL be rejected.

#### Scenario: Candidate cannot access question list
- **WHEN** a request to `GET /api/questions` is made with a candidate session JWT
- **THEN** the response is HTTP 403
