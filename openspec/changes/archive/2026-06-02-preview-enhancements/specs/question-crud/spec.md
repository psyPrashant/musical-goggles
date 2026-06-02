## MODIFIED Requirements

### Requirement: Admin and Recruiter can filter and inspect questions from the question bank list
The question bank view SHALL support filtering by all four question types including `GROUP`. GROUP questions SHALL be filterable via a "Group" chip in the type filter bar. When a GROUP question card is displayed, an inline "Preview" toggle SHALL be available that expands the card to reveal the group's preamble body and an ordered list of sub-question titles with their type badges. Expanding one card SHALL collapse any previously expanded card. The preview data SHALL be sourced from the `memberQuestions` list already returned in the bank list response — no additional API call is required.

#### Scenario: Group filter chip shows only GROUP questions
- **WHEN** a recruiter clicks the "Group" filter chip in the question bank
- **THEN** only questions of type GROUP are displayed in the card grid

#### Scenario: Preview toggle expands a GROUP card
- **WHEN** a recruiter clicks "Preview" on a GROUP question card
- **THEN** the card expands to show the preamble (group body text) and an ordered list of sub-question titles with type badges

#### Scenario: Clicking Preview again collapses the card
- **WHEN** a recruiter clicks "Preview" on an already-expanded GROUP card
- **THEN** the expansion collapses and only the standard card content is shown

#### Scenario: Expanding one card collapses another
- **WHEN** card A is expanded and a recruiter clicks "Preview" on card B
- **THEN** card B expands and card A collapses

#### Scenario: GROUP card with no loaded sub-questions shows empty state
- **WHEN** a GROUP question's `memberQuestions` list is empty or absent
- **THEN** the expansion shows a message indicating no sub-questions are available
