# group-question-type Specification

## Purpose

A GROUP question type that bundles an ordered set of sub-questions under a single preamble. GROUP questions can be created in the question bank, added to assessments, and answered by candidates as a scenario block. Each sub-question is answered and scored independently.

## Requirements

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

### Requirement: GROUP questions are rendered in assessment take as a preamble with individual sub-questions
When a GROUP question is included in an assessment, the candidate view SHALL display the group's `body` as a preamble text, followed by each sub-question rendered using its native type (MCQ, TEXT, or CODE_SUBMISSION). Each sub-question SHALL be independently answerable and navigable.

#### Scenario: GROUP question renders preamble and sub-questions
- **WHEN** a candidate navigates to a GROUP question during an assessment
- **THEN** the group's `body` text is shown as a scenario/preamble heading
- **AND** each sub-question is rendered below it in `displayOrder` sequence using its native question type UI
- **AND** each sub-question has its own answer state

#### Scenario: GROUP question counts as one navigation entry
- **WHEN** a GROUP question is in an assessment
- **THEN** the question navigation panel shows it as a single entry
- **AND** the entry is marked "answered" only when all sub-questions have been answered

### Requirement: Candidate answers for GROUP sub-questions are stored per sub-question id
The submit payload SHALL include one `CandidateAnswer` per sub-question id (not per group id). The `candidate_answers` table schema is unchanged.

#### Scenario: Sub-question answers are stored individually
- **WHEN** a candidate answers all sub-questions of a GROUP question and submits
- **THEN** one `candidate_answer` row exists per sub-question id
- **AND** no `candidate_answer` row is created for the group question id itself

### Requirement: GROUP sub-questions are marked and scored individually
In the results/marking view, each sub-question of a GROUP SHALL appear as a separate marking item. Marking one sub-question SHALL NOT affect other sub-questions in the same group.

#### Scenario: GROUP sub-questions appear in the marking view
- **WHEN** a recruiter opens the marking panel for a submission containing a GROUP question
- **THEN** each sub-question of the GROUP is visible as a separate question entry with its candidate answer
- **AND** each can be scored and given feedback independently
