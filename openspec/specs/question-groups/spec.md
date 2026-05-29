## ADDED Requirements

### Requirement: Admin and Recruiter can create named question groups
The system SHALL allow creating a `QuestionGroup` with a `name` (required, unique within the project) and an optional `description`. A group can be created empty and populated with questions separately.

#### Scenario: Create a new group
- **WHEN** an Admin or Recruiter submits `POST /api/question-groups` with a valid `name`
- **THEN** the group is persisted and the response is HTTP 201 with the created group's `id` and `name`

#### Scenario: Duplicate group name is rejected
- **WHEN** an Admin or Recruiter submits `POST /api/question-groups` with a `name` already in use
- **THEN** the response is HTTP 409 Conflict

### Requirement: Questions can be added to and removed from a group
The system SHALL expose `POST /api/question-groups/{groupId}/questions` to add a question to a group and `DELETE /api/question-groups/{groupId}/questions/{questionId}` to remove one. A question may belong to multiple groups simultaneously.

#### Scenario: Add a question to a group
- **WHEN** an Admin or Recruiter calls `POST /api/question-groups/{groupId}/questions` with a valid `questionId`
- **THEN** the question is associated with the group and appears in subsequent `GET /api/question-groups/{groupId}` responses

#### Scenario: Adding a question to a group it already belongs to is idempotent
- **WHEN** a question is added to a group it is already a member of
- **THEN** the response is HTTP 200 (or 201) with no duplicate entry created

#### Scenario: Remove a question from a group
- **WHEN** an Admin or Recruiter calls `DELETE /api/question-groups/{groupId}/questions/{questionId}`
- **THEN** the question is disassociated from the group but not deleted from the question bank

### Requirement: A group can be marked as structured to enforce question display order
When a group is marked `isStructured=true`, each question added to it SHALL have an explicit `displayOrder` (positive integer). The `GET /api/question-groups/{groupId}` response for a structured group SHALL return questions sorted by `displayOrder` ascending.

#### Scenario: Structured group returns questions in order
- **WHEN** a structured group has questions added with `displayOrder` values 10, 20, and 30
- **THEN** `GET /api/question-groups/{groupId}` returns those questions in ascending `displayOrder` order

#### Scenario: Adding question to structured group without displayOrder is rejected
- **WHEN** a question is added to a structured group without a `displayOrder` value
- **THEN** the response is HTTP 400 with a validation error

#### Scenario: Unstructured group returns questions in insertion order or any order
- **WHEN** a group is not structured
- **THEN** questions are returned without a guaranteed order (the API does not sort them)

### Requirement: Groups can be listed and retrieved with their questions
The system SHALL expose `GET /api/question-groups` returning all groups (summary: id, name, question count). `GET /api/question-groups/{id}` SHALL return the group with its full question list.

#### Scenario: List groups shows question count
- **WHEN** an Admin or Recruiter calls `GET /api/question-groups`
- **THEN** each group in the response includes a `questionCount` field

#### Scenario: Get group returns embedded questions
- **WHEN** an Admin or Recruiter calls `GET /api/question-groups/{id}`
- **THEN** the response includes the group metadata and an array of its questions (summary view)
