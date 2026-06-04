## ADDED Requirements

### Requirement: GROUP sub-questions appear individually in the results marking detail view
The results detail view SHALL render each sub-question of a GROUP question as a separate, individually-markable entry beneath the GROUP's preamble text.

#### Scenario: GROUP sub-questions visible in marking view
- **WHEN** a recruiter opens the results detail for a submission containing a GROUP question
- **THEN** the GROUP's preamble (body text) is shown as a section header
- **AND** each sub-question is rendered below it with its candidate answer, current score, and feedback input
- **AND** each sub-question can be scored independently

#### Scenario: GROUP question with no sub-questions answered still shows sub-question rows
- **WHEN** a candidate did not answer any sub-questions of a GROUP
- **THEN** each sub-question still appears in the marking view with an empty answer and a zero score

### Requirement: Answered-stat denominator counts sub-questions
The "X/Y answered" stat in the results detail header SHALL use the total number of individually-answerable questions (GROUP sub-questions each counted separately) as the denominator.

#### Scenario: Answered stat with GROUP questions
- **WHEN** an assessment has 1 GROUP (with 3 sub-questions) and 2 standalone questions
- **THEN** the answered stat denominator is 5 (not 3)

### Requirement: Submission list "x/x marked" denominator counts sub-questions
The `totalAnswers` value used as the denominator in the submission list "x/x marked" stat SHALL equal the total number of answerable questions in the assessment, counting GROUP sub-questions individually.

#### Scenario: Submission list shows correct total for GROUP assessments
- **WHEN** an assessment contains 1 GROUP with 7 sub-questions and 1 standalone MCQ
- **THEN** the submission list shows "x/8 marked" (not "x/2 marked")
