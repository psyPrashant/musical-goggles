## MODIFIED Requirements

### Requirement: Admin and Recruiter can filter and inspect questions from the question bank list
The question bank view SHALL support filtering by all four question types including `GROUP`. GROUP questions SHALL be filterable via a "Group" chip in the type filter bar. Every question card SHALL provide an inline "Preview" toggle that expands the card to show a full candidate-facing preview of the question. The preview SHALL be identical in content and layout to how the candidate sees the question during an assessment: MCQ questions SHALL show the question body and all answer options in a lettered radio-button list; TEXT questions SHALL show the question body and a disabled textarea; CODE_SUBMISSION questions SHALL show the question body, an optional language badge, and a disabled code editor area; GROUP questions SHALL show the group preamble body followed by each sub-question rendered with its own type-specific candidate view (MCQ sub shows options, TEXT sub shows textarea, CODE sub shows code area). Only one preview panel SHALL be open at a time — opening a new card's preview SHALL close any previously open one. The preview data SHALL be sourced from the `memberQuestions`, `options`, and `languageHint` fields already returned by `GET /api/questions` — no additional API call is required.

#### Scenario: Preview toggle opens a candidate-facing MCQ preview
- **WHEN** a recruiter clicks "Preview" on an MCQ question card
- **THEN** the card expands to show the question body and a lettered radio-button list of all answer options

#### Scenario: Preview toggle opens a candidate-facing TEXT preview
- **WHEN** a recruiter clicks "Preview" on a TEXT question card
- **THEN** the card expands to show the question body and a disabled textarea representing the candidate's answer area

#### Scenario: Preview toggle opens a candidate-facing CODE_SUBMISSION preview
- **WHEN** a recruiter clicks "Preview" on a CODE_SUBMISSION question card
- **THEN** the card expands to show the question body, the language badge (if set), and a disabled code editor textarea

#### Scenario: Preview toggle opens a candidate-facing GROUP preview with sub-questions
- **WHEN** a recruiter clicks "Preview" on a GROUP question card
- **THEN** the card expands to show the group preamble body followed by each sub-question with its position number, type badge, body text, and its own type-specific candidate input area

#### Scenario: MCQ sub-question within a GROUP preview shows its options
- **WHEN** a GROUP question contains an MCQ sub-question and the recruiter opens the GROUP preview
- **THEN** the MCQ sub-question entry shows its answer options in a lettered list

#### Scenario: Clicking Preview again collapses the panel
- **WHEN** a recruiter clicks "Preview" (now labelled "Close") on an already-expanded card
- **THEN** the expansion collapses and only the standard card content is shown

#### Scenario: Expanding one card collapses another
- **WHEN** card A is expanded and a recruiter clicks "Preview" on card B
- **THEN** card B expands and card A collapses

#### Scenario: GROUP card with no loaded sub-questions shows empty state
- **WHEN** a GROUP question's `memberQuestions` list is empty or absent
- **THEN** the expansion shows a message indicating no sub-questions are available
