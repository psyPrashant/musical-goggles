## MODIFIED Requirements

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

### Requirement: Questions can be updated and deleted
The system SHALL allow updating a question's title, body, options (MCQ), and tags via `PUT /api/questions/{id}`. Questions can be deleted via `DELETE /api/questions/{id}`.

#### Scenario: Update question body
- **WHEN** an Admin or Recruiter calls `PUT /api/questions/{id}` with updated fields
- **THEN** the persisted question reflects the changes and the response is HTTP 200

#### Scenario: Delete question
- **WHEN** an Admin or Recruiter calls `DELETE /api/questions/{id}`
- **THEN** the question is deleted and any group membership rows referencing it are also removed

## REMOVED Requirements

### Requirement: Deleting a question removes it from groups
**Reason**: The `question_group_items` table no longer exists. The equivalent behaviour (cascade delete from `group_question_members` via FK ON DELETE CASCADE) is enforced at the DB level without application logic.
**Migration**: No action needed. Cascade is handled by the `group_question_members` FK constraint in V10 migration.
