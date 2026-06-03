## ADDED Requirements

### Requirement: Staff can define a point value for each question
When creating or editing any question type (text, MCQ, code), the system SHALL allow staff to set a `maxScore` (integer, minimum 1) that represents the maximum number of points a candidate can earn for that question. If not specified, `maxScore` SHALL default to 1.

#### Scenario: Staff creates a question with a custom point value
- **WHEN** a staff member submits a `POST /api/questions` request with `"maxScore": 5`
- **THEN** the question is persisted with `maxScore = 5` and the response includes `"maxScore": 5`

#### Scenario: Staff creates a question without specifying maxScore
- **WHEN** a staff member submits a `POST /api/questions` request without a `maxScore` field
- **THEN** the question is persisted with `maxScore = 1` and the response includes `"maxScore": 1`

#### Scenario: Staff edits a question to change its point value
- **WHEN** a staff member submits a `PUT /api/questions/{id}` request with `"maxScore": 3`
- **THEN** the question's `maxScore` is updated to 3 and the response reflects the new value

#### Scenario: Invalid maxScore is rejected
- **WHEN** a staff member submits a question with `"maxScore": 0`
- **THEN** the API returns HTTP 400

### Requirement: Question point value is visible on the question form
The question creation and edit form in the staff UI SHALL display a numeric "Points" input field. The field SHALL show the current `maxScore` value when editing, and SHALL default to 1 for new questions.

#### Scenario: New question form shows default Points value
- **WHEN** a staff member opens the question creation form
- **THEN** the Points field shows the value 1

#### Scenario: Edit form shows existing maxScore
- **WHEN** a staff member opens the edit form for a question with `maxScore = 5`
- **THEN** the Points field shows 5

#### Scenario: Points value is submitted with the form
- **WHEN** a staff member changes the Points field to 4 and saves
- **THEN** the API request includes `"maxScore": 4`

### Requirement: Question point value is shown on the question list card
Each question in the staff questions list SHALL display the question's `maxScore` as a small badge (e.g. "5 pts") alongside the existing type and tag indicators.

#### Scenario: Question card shows point badge
- **WHEN** a staff member views the questions list
- **THEN** each question card displays its `maxScore` formatted as "X pt" (1) or "X pts" (>1)
