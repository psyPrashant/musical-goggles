## ADDED Requirements

### Requirement: Admin and Recruiter can create questions of three types
The system SHALL support creating questions of type `MCQ`, `TEXT`, and `CODE_SUBMISSION`. Every question SHALL have a `title` (short label) and a `body` (the question text presented to the candidate). MCQ questions SHALL additionally require at least two answer options and exactly one correct option marked.

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
The system SHALL allow updating a question's title, body, options (MCQ), and tags via `PUT /api/questions/{id}`. Questions can be deleted via `DELETE /api/questions/{id}`. Deleting a question SHALL remove it from any groups it belongs to.

#### Scenario: Update question body
- **WHEN** an Admin or Recruiter calls `PUT /api/questions/{id}` with updated fields
- **THEN** the persisted question reflects the changes and the response is HTTP 200

#### Scenario: Delete question removes it from groups
- **WHEN** an Admin or Recruiter calls `DELETE /api/questions/{id}` for a question that belongs to one or more groups
- **THEN** the question is deleted and the `question_group_items` records for that question are also removed

### Requirement: Only Admin and Recruiter roles can access question endpoints
All question CRUD endpoints SHALL require the `ADMIN` or `RECRUITER` role. Unauthenticated requests and requests with `CANDIDATE` role SHALL be rejected.

#### Scenario: Candidate cannot access question list
- **WHEN** a request to `GET /api/questions` is made with a candidate session JWT
- **THEN** the response is HTTP 403
