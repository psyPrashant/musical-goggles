## MODIFIED Requirements

### Requirement: Result detail header shows score as a fraction
The result detail header SHALL display the candidate's total score as "X/Y" where X is the total score earned and Y is the weighted total of all question point values (`SUM(question.maxScore)`) for the assessment, not a raw question count. This replaces the previous "X pts" display.

#### Scenario: Score displayed as fraction with weighted denominator
- **WHEN** a staff member opens a submitted candidate's result detail for an assessment with questions worth 1, 1, and 5 points
- **THEN** the header score block shows e.g. "5/7", not "5/3" (count-based) or "5 pts"

#### Scenario: Score can exceed denominator
- **WHEN** a text question has been manually scored above its `maxScore`
- **THEN** the display still shows the actual values (e.g. "12/8") without truncation

#### Scenario: Uniform 1-pt assessment unchanged
- **WHEN** all questions in an assessment have `maxScore = 1`
- **THEN** the fraction denominator equals the question count (same as before this change)
