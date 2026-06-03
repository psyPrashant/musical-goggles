## MODIFIED Requirements

### Requirement: Result detail header shows score as a fraction
The result detail header SHALL display the candidate's total score as "X/Y" where X is the total score earned and Y is the total number of questions (`maxScore`). This replaces the previous "X pts" display.

#### Scenario: Score displayed as fraction
- **WHEN** a staff member opens a submitted candidate's result detail
- **THEN** the header score block shows the score in "X/Y" format (e.g. "6/8"), not "6 pts"

#### Scenario: Score can exceed denominator
- **WHEN** a text question has been manually scored above 1 point
- **THEN** the display still shows the actual values (e.g. "12/8") without truncation
