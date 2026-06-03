## MODIFIED Requirements

### Requirement: Difficulty is displayed as a badge in the question bank UI
The question bank card for each question SHALL display a coloured difficulty badge (Easy / Medium / Hard) when the difficulty field is set. Questions with no difficulty SHALL show no badge. The difficulty selector in the question creation and edit form SHALL render as a three-button selector (None / Easy / Medium / Hard) with a "None" option to clear the value, matching the visual style of the type selector. Difficulty badges SHALL also appear on question rows in the assessment builder picker list and in the assessment builder existing-questions table.

#### Scenario: Badge shown for a question with difficulty set
- **WHEN** a recruiter views the question bank and a question has difficulty HARD
- **THEN** a "Hard" badge is visible on that question's card

#### Scenario: No badge for question with no difficulty
- **WHEN** a recruiter views the question bank and a question has no difficulty set
- **THEN** no difficulty badge is rendered for that card

#### Scenario: Difficulty selector in form allows selecting Easy, Medium, Hard, or None
- **WHEN** a recruiter opens the question creation form
- **THEN** a difficulty selector with None, Easy, Medium, and Hard buttons is visible; None is selected by default

#### Scenario: Difficulty badge shown in assessment builder picker
- **WHEN** the assessment builder available-questions list shows a question with difficulty MEDIUM
- **THEN** a "Medium" badge is visible on that row

#### Scenario: Difficulty badge shown in assessment builder existing-questions table
- **WHEN** a question with difficulty EASY has been added to an assessment
- **THEN** an "Easy" badge appears in that question's row in the assessment questions table
