## MODIFIED Requirements

### Requirement: Submission list shows candidate's percentage score
When a submission is fully marked, the system SHALL display the candidate's score as a percentage (rounded to the nearest integer) alongside the marking progress on the submission list item. The percentage SHALL be calculated as `totalScore / SUM(question.maxScore) * 100` where the denominator is the weighted total of all question point values in the assessment, not a raw question count. When marking is incomplete or the submission has not started, the percentage SHALL be displayed as "—".

#### Scenario: Fully marked submission shows percentage
- **WHEN** all questions in a submission have been scored (`markedCount === totalAnswers`)
- **THEN** the list item shows a percentage such as "75%" derived from `totalScore / maxScore * 100` where `maxScore` is the sum of all question point values

#### Scenario: Pending submission shows dash
- **WHEN** a submission has at least one unscored question (`markedCount < totalAnswers`)
- **THEN** the score field shows "—"

#### Scenario: Not-started candidate shows dash
- **WHEN** a candidate has NOT_STARTED status (no submission exists)
- **THEN** the score field shows "—"

#### Scenario: Assessment with zero questions shows dash
- **WHEN** `maxScore` is 0
- **THEN** the score field shows "—" (division-by-zero guard)

#### Scenario: Assessment with mixed-weight questions shows weighted percentage
- **WHEN** an assessment has questions worth 1, 1, and 5 points (total 7) and a candidate scores 5
- **THEN** the percentage shows "71%" (5/7 * 100, rounded)
