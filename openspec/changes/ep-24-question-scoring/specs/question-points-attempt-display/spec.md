## ADDED Requirements

### Requirement: Candidate sees each question's point value during an assessment attempt
The assessment attempt view SHALL display the point value for each question as a badge (e.g. "5 pts") so that the candidate can allocate their time according to question weight.

#### Scenario: Single-point question shows singular label
- **WHEN** a candidate views a question with `maxScore = 1` during an attempt
- **THEN** the question displays a badge showing "1 pt"

#### Scenario: Multi-point question shows plural label
- **WHEN** a candidate views a question with `maxScore = 5` during an attempt
- **THEN** the question displays a badge showing "5 pts"

#### Scenario: Point badge is present for all question types
- **WHEN** a candidate encounters a text, MCQ, or code question during an attempt
- **THEN** each question displays its point badge regardless of type

#### Scenario: Point value included in attempt payload
- **WHEN** the candidate attempt endpoint returns questions
- **THEN** each question in the response includes a `maxScore` field
