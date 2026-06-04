## ADDED Requirements

### Requirement: Question bank can be filtered by difficulty
The question bank view SHALL display a difficulty filter row with four chips: All, Easy, Medium, Hard. Selecting a chip filters the card grid to show only questions matching that difficulty. Selecting All removes the difficulty filter. The difficulty filter SHALL compose with the existing type filter, tag filter, and search — all active filters apply simultaneously. Only one difficulty chip can be active at a time.

#### Scenario: Selecting Easy shows only Easy questions
- **WHEN** a recruiter clicks the Easy chip in the question bank
- **THEN** only questions with difficulty EASY are displayed; questions with MEDIUM, HARD, or no difficulty are hidden

#### Scenario: Selecting All clears the difficulty filter
- **WHEN** a recruiter has Easy active and clicks All
- **THEN** all questions are shown (subject to other active filters)

#### Scenario: Difficulty filter composes with type filter
- **WHEN** a recruiter has type MCQ and difficulty HARD active
- **THEN** only MCQ questions with HARD difficulty are displayed

#### Scenario: No questions match combined filters shows empty state
- **WHEN** no questions match the active difficulty + type + search combination
- **THEN** the empty state message "No questions match your filters." is displayed

### Requirement: Assessment builder picker can be filtered by difficulty
The "Add Question from Bank" panel in the assessment detail page SHALL include a difficulty filter dropdown or chip row (All / Easy / Medium / Hard). Selecting a difficulty hides questions of other difficulty levels from the picker list. The difficulty filter composes with the existing type filter and search term.

#### Scenario: Filtering picker by difficulty hides non-matching questions
- **WHEN** a recruiter selects Hard in the assessment builder difficulty filter
- **THEN** only questions with difficulty HARD appear in the available-questions list

#### Scenario: Difficulty filter in picker composes with type filter
- **WHEN** a recruiter selects TEXT type and MEDIUM difficulty in the picker
- **THEN** only TEXT questions with MEDIUM difficulty are shown in the picker

### Requirement: Difficulty badge displayed on assessment builder question rows
The assessment builder SHALL display a difficulty badge on each row in both the available-questions picker list and the existing-questions table. Questions with no difficulty set SHALL show no badge.

#### Scenario: Difficulty badge shown on picker row
- **WHEN** the assessment builder picker shows a question with difficulty EASY
- **THEN** an "Easy" badge is visible on that row

#### Scenario: No badge for question with no difficulty in picker
- **WHEN** a question in the picker has no difficulty set
- **THEN** no difficulty badge is rendered for that row

#### Scenario: Difficulty badge shown on existing-question table row
- **WHEN** a question is already added to an assessment and has difficulty HARD
- **THEN** a "Hard" badge is visible in that question's row in the assessment questions table
