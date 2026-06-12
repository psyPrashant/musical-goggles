# group-question-inline-authoring Specification

## Purpose

Lets recruiters author brand-new sub-questions inline while building a GROUP question, instead of having to pre-create them in the question bank first. Inline-authored entries and bank-picked entries combine into one ordered sub-question list, and new entries are persisted as standalone questions before the GROUP is created.

## Requirements

### Requirement: Recruiter can author new sub-questions inline while building a GROUP question
The `QuestionFormComponent` SHALL provide, alongside the existing question-bank picker, an inline "create new sub-question" mini-form for GROUP questions. The mini-form SHALL allow selecting a sub-question type of `MCQ`, `TEXT`, or `CODE_SUBMISSION` (GROUP SHALL NOT be selectable, preventing nested groups), and capturing `title`, `body`, `maxScore`, MCQ `options` (when type is MCQ, with the same validation as standalone MCQ creation — at least two options and exactly one marked correct), and `languageHint` (when type is CODE_SUBMISSION).

#### Scenario: Inline mini-form type selector excludes GROUP
- **WHEN** a Recruiter is building a GROUP question and opens the "create new sub-question" mini-form
- **THEN** the type selector offers only MCQ, Text, and Code Submission

#### Scenario: Adding a new MCQ sub-question requires valid options
- **WHEN** a Recruiter fills the inline mini-form with type MCQ, leaves an option blank or marks zero/multiple options as correct, and attempts to add it
- **THEN** the form displays an inline validation error and does not add the entry to the sub-question list

#### Scenario: Valid new sub-question is appended to the sub-question list
- **WHEN** a Recruiter fills the inline mini-form with valid data for any allowed type and clicks "Add sub-question"
- **THEN** a new entry is appended to the end of the GROUP's ordered sub-question list
- **AND** the mini-form is cleared for the next entry

### Requirement: Sub-question list combines bank-picked and newly-authored entries in one ordered, removable list
The GROUP question form SHALL maintain a single ordered list of sub-question entries that may originate from the existing bank picker or from the inline "create new sub-question" mini-form. Each entry SHALL be individually removable regardless of its source. Entries authored inline SHALL display a "New" badge to distinguish them from bank-picked entries.

#### Scenario: New and bank-picked entries appear in one list
- **WHEN** a Recruiter adds one sub-question via the bank picker and one via the inline mini-form
- **THEN** both entries appear in the sub-question list in the order they were added
- **AND** the inline-authored entry shows a "New" badge while the bank-picked entry does not

#### Scenario: Either source of entry can be removed
- **WHEN** a Recruiter clicks remove on a "New"-badged entry or on a bank-picked entry
- **THEN** that entry is removed from the sub-question list and no longer counts toward validation or the total points display

#### Scenario: Minimum sub-question count applies to the combined list
- **WHEN** a Recruiter has a combined total of fewer than 2 sub-question entries (bank-picked plus newly-authored) and attempts to submit
- **THEN** the form displays the existing "A group question must have at least 2 sub-questions" error and does not submit

### Requirement: Newly-authored sub-questions are persisted as standalone questions before the GROUP is created
On submitting a GROUP question that includes one or more inline-authored sub-question entries, the system SHALL first create each as a standalone question via `POST /api/questions` (using the same validation rules as creating that question type directly). The system SHALL then create the GROUP question via `POST /api/questions` with `memberQuestionIds` containing, in display order, the ids of bank-picked entries and the ids returned from creating the inline-authored entries.

#### Scenario: GROUP composed entirely of new sub-questions
- **WHEN** a Recruiter builds a GROUP using only inline-authored sub-questions and submits
- **THEN** each sub-question is created individually and appears afterward in the question bank as a standalone question
- **AND** the GROUP question is created referencing all of them as members, in the order they were added

#### Scenario: GROUP composed of a mix of bank-picked and new sub-questions
- **WHEN** a Recruiter builds a GROUP using a combination of bank-picked and inline-authored sub-questions and submits
- **THEN** only the inline-authored sub-questions are newly created
- **AND** the GROUP question references all entries (existing and newly-created) as members in display order

#### Scenario: Failure creating one new sub-question is reported without losing form state
- **WHEN** one of the inline-authored sub-questions fails validation or creation during submit
- **THEN** the form displays an error describing the failure
- **AND** the recruiter's GROUP form state (title, body, sub-question list) remains intact for retry
