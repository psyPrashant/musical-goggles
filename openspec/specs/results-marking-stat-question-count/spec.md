## Requirements

### Requirement: Answered stat in results detail header uses question count as denominator
The `.answered-stat` display in the results detail header SHALL show the number of answered questions out of the total number of questions in the assessment, not out of the total available score.

#### Scenario: Answered stat shows question count denominator
- **WHEN** a recruiter views the results detail page for a submitted assessment
- **THEN** the answered stat reads "X/Y answered" where Y is the number of questions in the assessment (not the total score points)

#### Scenario: Answered stat is correct when maxScore differs from question count
- **WHEN** an assessment has 5 questions worth 34 pts total and the candidate answered 3
- **THEN** the answered stat reads "3/5 answered" (not "3/34 answered")
