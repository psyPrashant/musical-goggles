## ADDED Requirements

### Requirement: Code submission answers display with syntax highlighting in the marking view
The marking/results view SHALL render `CODE_SUBMISSION` answers (top-level and within GROUP questions) as read-only syntax-highlighted Java code instead of plain text. The display MUST be read-only — markers cannot modify the candidate's submitted code. When a code question has no answer, the existing empty-answer display SHALL be kept.

#### Scenario: Submitted code is highlighted for the marker
- **WHEN** a marker opens a submission containing a `CODE_SUBMISSION` answer
- **THEN** the answer renders as read-only Java code with syntax highlighting

#### Scenario: Marker cannot edit the displayed code
- **WHEN** a marker clicks into the displayed code
- **THEN** the content cannot be modified

#### Scenario: Unanswered code question keeps existing display
- **WHEN** a marker views a `CODE_SUBMISSION` question the candidate did not answer
- **THEN** the existing empty/unanswered presentation is shown
