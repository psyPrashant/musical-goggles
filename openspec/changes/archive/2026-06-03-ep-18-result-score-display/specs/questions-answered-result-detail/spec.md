## ADDED Requirements

### Requirement: Result detail shows number of questions answered
The result detail header SHALL display a stat showing how many questions the candidate answered, in "X/Y answered" format where X is the number of questions the candidate submitted a response to and Y is the total question count.

#### Scenario: Candidate answered all questions
- **WHEN** the candidate submitted a response to every question in the assessment
- **THEN** the stat shows e.g. "8/8 answered"

#### Scenario: Candidate skipped some questions
- **WHEN** the candidate left one or more questions unanswered
- **THEN** the stat shows e.g. "6/8 answered", reflecting only the questions they responded to

#### Scenario: Candidate answered no questions
- **WHEN** the candidate submitted without answering any questions
- **THEN** the stat shows "0/Y answered"
