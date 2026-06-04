# question-difficulty Specification

## Purpose
TBD - created by archiving change ep-20-question-management. Update Purpose after archive.
## Requirements
### Requirement: Questions can be assigned a difficulty level
The system SHALL allow a difficulty level of EASY, MEDIUM, or HARD to be optionally assigned to any question type (MCQ, TEXT, CODE_SUBMISSION, GROUP) at creation time or via update. If no difficulty is provided, the question SHALL be stored without a difficulty value (null). The `POST /api/questions` and `PUT /api/questions/{id}` request bodies SHALL accept an optional `difficulty` field. All question response shapes SHALL include a `difficulty` field (null when unset).

#### Scenario: Create question with difficulty
- **WHEN** a Recruiter submits `POST /api/questions` with `difficulty: "HARD"`
- **THEN** the question is persisted with difficulty HARD and the response includes `"difficulty": "HARD"`

#### Scenario: Create question without difficulty
- **WHEN** a Recruiter submits `POST /api/questions` with no `difficulty` field
- **THEN** the question is persisted with null difficulty and the response includes `"difficulty": null`

#### Scenario: Invalid difficulty value is rejected
- **WHEN** a Recruiter submits `POST /api/questions` with `difficulty: "EXTREME"`
- **THEN** the response is HTTP 400

#### Scenario: Update question difficulty
- **WHEN** a Recruiter submits `PUT /api/questions/{id}` with `difficulty: "EASY"`
- **THEN** the stored difficulty is updated to EASY

### Requirement: Difficulty is displayed as a badge in the question bank UI
The question bank card for each question SHALL display a coloured difficulty badge (Easy / Medium / Hard) when the difficulty field is set. Questions with no difficulty SHALL show no badge. The difficulty selector in the question creation and edit form SHALL render as a three-button selector (Easy / Medium / Hard) with a "None" option to clear the value, matching the visual style of the type selector.

#### Scenario: Badge shown for a question with difficulty set
- **WHEN** a recruiter views the question bank and a question has difficulty HARD
- **THEN** a "Hard" badge is visible on that question's card

#### Scenario: No badge for question with no difficulty
- **WHEN** a recruiter views the question bank and a question has no difficulty set
- **THEN** no difficulty badge is rendered for that card

#### Scenario: Difficulty selector in form allows selecting Easy, Medium, Hard, or None
- **WHEN** a recruiter opens the question creation form
- **THEN** a difficulty selector with Easy, Medium, Hard, and None buttons is visible; None is selected by default

