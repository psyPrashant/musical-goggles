## MODIFIED Requirements

### Requirement: Admin and Recruiter can create a GROUP question with sub-questions
The system SHALL support creating a question of type `GROUP` via `POST /api/questions`. A GROUP question SHALL have a `title`, a `body` (used as the scenario preamble), and a `memberQuestionIds` list (ordered UUIDs of existing questions to include as sub-questions). All referenced question ids SHALL exist. A GROUP question SHALL contain at least two member questions. A GROUP question's `maxScore` SHALL always be computed by the system as the sum of its members' `maxScore` values; any client-supplied `maxScore` in the request SHALL be ignored for `type=GROUP`. This computation SHALL be applied on both creation and update of a GROUP question.

#### Scenario: Create GROUP question with valid members
- **WHEN** an Admin or Recruiter submits `POST /api/questions` with `type=GROUP`, a `body`, and `memberQuestionIds` referencing two or more existing questions
- **THEN** the system returns HTTP 201 with the created GROUP question including its `id` and the ordered `members` list

#### Scenario: Create GROUP question with fewer than two members is rejected
- **WHEN** an Admin or Recruiter submits `POST /api/questions` with `type=GROUP` and `memberQuestionIds` with zero or one ids
- **THEN** the system returns HTTP 400 with a validation error

#### Scenario: Create GROUP question referencing non-existent sub-question
- **WHEN** an Admin or Recruiter submits `POST /api/questions` with `type=GROUP` and a `memberQuestionIds` list containing an id that does not exist
- **THEN** the system returns HTTP 404

#### Scenario: GROUP question appears in question list with type filter
- **WHEN** an authenticated user calls `GET /api/questions?type=GROUP`
- **THEN** only GROUP questions are returned
- **AND** each GROUP question includes its ordered `members` list

#### Scenario: GROUP question maxScore equals the sum of member maxScores
- **WHEN** an Admin or Recruiter submits `POST /api/questions` with `type=GROUP` and `memberQuestionIds` referencing questions whose `maxScore` values are 2, 3, and 5
- **THEN** the created GROUP question's `maxScore` is `10`, regardless of any `maxScore` value included in the request body

#### Scenario: Client-supplied maxScore is ignored for GROUP questions
- **WHEN** an Admin or Recruiter submits `POST /api/questions` with `type=GROUP`, valid `memberQuestionIds`, and a `maxScore` value that does not equal the sum of the members' `maxScore`
- **THEN** the system returns HTTP 201 with the GROUP question's `maxScore` set to the sum of its members' `maxScore`, not the submitted value
