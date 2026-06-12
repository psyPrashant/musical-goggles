## MODIFIED Requirements

### Requirement: Admin and Recruiter can create questions of four types
The system SHALL support creating questions of type `MCQ`, `TEXT`, `CODE_SUBMISSION`, and `GROUP` via both the API and the question creation UI. Every question SHALL have a `title` (short label) and a `body` (the question text presented to the candidate). MCQ questions SHALL additionally require at least two answer options and exactly one correct option marked. GROUP questions SHALL require at least two sub-questions, sourced from existing bank questions (`memberQuestionIds`), newly-authored sub-questions created inline in the form, or a mix of both. The `QuestionFormComponent` SHALL present a "Group / Scenario" option in the type selector and, when selected, render a member picker that allows the recruiter to search the question bank and add sub-questions, alongside an inline "create new sub-question" mini-form (see `group-question-inline-authoring`), before saving. For question types `MCQ`, `TEXT`, and `CODE_SUBMISSION`, the form SHALL show an editable "Points (max score)" field. For type `GROUP`, the form SHALL NOT show an editable Points field; instead it SHALL show a read-only "Total points" value computed as the sum of the `maxScore` of all current sub-question entries (bank-picked and newly-authored), updating live as entries are added or removed. There is no limit on the number of CODE_SUBMISSION questions that may be added to a single assessment.

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

#### Scenario: Multiple CODE_SUBMISSION questions can be added to one assessment
- **WHEN** an Admin or Recruiter adds a second CODE_SUBMISSION question to an assessment that already contains one
- **THEN** the question is added successfully and the response is HTTP 200 or 201 (no 422 error)

#### Scenario: Create GROUP question via the UI using the bank picker
- **WHEN** a Recruiter selects "Group / Scenario" in the question form, searches the bank, adds at least 2 sub-questions, fills in the title and preamble body, and clicks "Create Question"
- **THEN** the form submits `POST /api/questions` with `type=GROUP` and `memberQuestionIds` containing the bank-picked question ids, the question is persisted, and the recruiter is navigated back to the question bank

#### Scenario: GROUP question with fewer than 2 sub-questions is blocked in the UI
- **WHEN** a Recruiter selects GROUP type, adds only one sub-question (from the bank picker, the inline mini-form, or both combined), and attempts to submit
- **THEN** the form displays an inline error "A group question must have at least 2 sub-questions" and does not submit

#### Scenario: Already-selected sub-questions are hidden from the picker
- **WHEN** a Recruiter has added question X to the member list
- **THEN** question X no longer appears in the bank search results, preventing it from being added twice

#### Scenario: GROUP questions are excluded from the member picker
- **WHEN** the member picker is shown
- **THEN** GROUP-type questions do not appear as selectable members (no nested groups)

#### Scenario: Edit mode for GROUP question shows read-only notice
- **WHEN** a Recruiter navigates to `/questions/:id/edit` for a GROUP question
- **THEN** the form displays a notice stating the question cannot be edited via this form and hides the save button

#### Scenario: Points field is hidden and a computed total is shown for GROUP questions
- **WHEN** a Recruiter selects "Group / Scenario" as the question type
- **THEN** the editable "Points (max score)" field is not shown
- **AND** a read-only "Total points" value is shown instead

#### Scenario: Total points updates live as sub-questions are added or removed
- **WHEN** a Recruiter adds or removes a sub-question (via the bank picker or the inline mini-form) while building a GROUP question
- **THEN** the "Total points" value immediately reflects the sum of `maxScore` across all current sub-question entries, before the form is submitted
