## ADDED Requirements

### Requirement: Unanswered questions are auto-scored 0 on submit
The system SHALL automatically create an `AnswerScore` with `score=0`, `autoMarked=true`, and `feedback="Not answered"` for every assessment question that has no corresponding `CandidateAnswer` at the time of submission. This SHALL apply to all submit paths: voluntary submit, Give Up (auto-submitted), and timer-expiry auto-submit. No schema changes are required.

#### Scenario: Candidate submits with unanswered questions
- **WHEN** a candidate submits an assessment
- **AND** some questions have no saved answer
- **THEN** the system creates `AnswerScore(score=0, autoMarked=true, feedback="Not answered")` for each unanswered question
- **AND** the submission's marking status reflects these zero scores

#### Scenario: All questions answered — no zero scores inserted
- **WHEN** a candidate submits an assessment
- **AND** all questions have at least one saved answer
- **THEN** the system does not create any zero-score records
- **AND** existing answers are scored as normal

#### Scenario: Give Up path also triggers zero scoring
- **WHEN** a candidate confirms Give Up
- **AND** the assessment is submitted as auto-submitted
- **THEN** unanswered questions receive the same zero-score treatment as a voluntary submit

#### Scenario: Timer expiry also triggers zero scoring
- **WHEN** the assessment timer expires and the system auto-submits
- **THEN** unanswered questions receive zero scores

### Requirement: Marking status is FULLY_MARKED when all non-text/code questions are scored
After zero-score insertion, the system SHALL compute marking status as `FULLY_MARKED` when every assessment question has an `AnswerScore`. Questions answered with text or code require a human score; if any of those are still unscored (excluding auto-scored zeros for unanswered), marking status SHALL remain `PENDING_REVIEW`.

#### Scenario: MCQ-only assessment fully auto-marked after submit
- **WHEN** a candidate submits an MCQ-only assessment
- **THEN** all questions are scored (auto-marked MCQ + zero scores for unanswered)
- **AND** marking status is `FULLY_MARKED`

#### Scenario: Mixed assessment with unanswered text question
- **WHEN** a candidate submits an assessment with MCQ and TEXT questions
- **AND** the TEXT question was not answered
- **THEN** the TEXT question receives a zero score with `autoMarked=true`
- **AND** the MCQ questions are auto-marked
- **AND** marking status is `FULLY_MARKED` since all questions now have a score

#### Scenario: Mixed assessment with answered-but-unscored text question
- **WHEN** a candidate submits an assessment with a TEXT question that has a saved answer
- **AND** a recruiter has not yet manually scored that answer
- **THEN** marking status is `PENDING_REVIEW`
