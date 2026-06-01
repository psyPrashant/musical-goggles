## ADDED Requirements

### Requirement: System persists a score and feedback record per candidate answer
The system SHALL maintain an `AnswerScore` entity linked to a `CandidateAnswer` with a unique one-to-one constraint. The entity SHALL store: `score` (non-negative integer), `feedback` (optional free text), `markedBy` (UUID of the marking user, nullable for auto-marks), `markedAt` (timestamp), and `isAutoMarked` (boolean). A given `CandidateAnswer` SHALL have at most one `AnswerScore` at any time.

#### Scenario: An answer has no score yet
- **WHEN** a `CandidateAnswer` exists and no marking has occurred
- **THEN** no `AnswerScore` row exists for that answer; the result summary treats it as unscored

#### Scenario: An answer has an auto-generated score
- **WHEN** MCQ auto-marking runs at submission time
- **THEN** an `AnswerScore` row is created with `isAutoMarked: true`, `markedBy: null`, and `markedAt` set to the submission timestamp

#### Scenario: An answer has a manually assigned score
- **WHEN** a recruiter submits a manual score
- **THEN** the `AnswerScore` row has `isAutoMarked: false`, `markedBy` set to the recruiter's user ID, and `markedAt` set to the time of marking

### Requirement: Score value must be non-negative
The `score` field of `AnswerScore` SHALL be validated to be greater than or equal to zero. A negative score SHALL be rejected.

#### Scenario: Negative score is rejected
- **WHEN** a marking request is submitted with `score: -1`
- **THEN** the response is HTTP 400 with a validation error

#### Scenario: Zero score is accepted
- **WHEN** a marking request is submitted with `score: 0`
- **THEN** the score is persisted successfully
