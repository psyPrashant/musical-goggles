## MODIFIED Requirements

### Requirement: MCQ answers are automatically scored at submission time
When a `CandidateSubmission` is locked (status transitions to `SUBMITTED` or `AUTO_SUBMITTED`), the system SHALL automatically score all MCQ `CandidateAnswer` records in that submission by comparing the candidate's `selectedOptionIds` against the correct `QuestionOption` entries. An `AnswerScore` SHALL be written for each MCQ answer within the same transaction that locks the submission. A correct MCQ answer SHALL award `question.maxScore` points (not a fixed 1), and an incorrect answer SHALL award 0.

#### Scenario: Candidate selects the single correct option
- **WHEN** an MCQ question has one correct option and the candidate selected that option
- **THEN** an `AnswerScore` is created with `score = question.maxScore` and `isAutoMarked: true`

#### Scenario: Candidate selects a wrong option
- **WHEN** an MCQ question has one correct option and the candidate selected a different option
- **THEN** an `AnswerScore` is created with `score: 0` and `isAutoMarked: true`

#### Scenario: Candidate left an MCQ question unanswered
- **WHEN** no `CandidateAnswer` exists for an MCQ question at submission time
- **THEN** no `AnswerScore` is created for that question; the answer is treated as unscored in the result summary

#### Scenario: Multiple-correct MCQ — all correct selected
- **WHEN** an MCQ question requires two correct options and the candidate selected both
- **THEN** an `AnswerScore` is created with `score = question.maxScore` and `isAutoMarked: true`

#### Scenario: Multiple-correct MCQ — partially correct selection
- **WHEN** an MCQ question requires two correct options and the candidate selected only one
- **THEN** an `AnswerScore` is created with `score: 0` and `isAutoMarked: true`

#### Scenario: Submission with no MCQ questions skips auto-marking
- **WHEN** an assessment contains only text and code questions
- **THEN** the submission locks successfully and no `AnswerScore` rows are written by auto-marking

#### Scenario: MCQ question worth 5 points scores full value on correct answer
- **WHEN** an MCQ question has `maxScore = 5` and the candidate selects the correct option
- **THEN** an `AnswerScore` is created with `score: 5` and `isAutoMarked: true`

### Requirement: Auto-marking failure rolls back the entire submission
If an error occurs during MCQ auto-marking, the entire submission transaction SHALL be rolled back. The `CandidateSubmission` status SHALL remain `IN_PROGRESS` and no partial scores SHALL be persisted.

#### Scenario: Auto-marking exception causes submission rollback
- **WHEN** an unexpected error occurs during MCQ score computation
- **THEN** the submission is not locked, no `AnswerScore` rows are persisted, and the API returns HTTP 500
