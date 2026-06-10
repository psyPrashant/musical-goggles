## ADDED Requirements

### Requirement: Assessment preview shows randomisation quota breakdown
When an assessment has `randomiseQuestions = true`, the preview page SHALL display a quota summary (e.g. "Randomised: 5 MCQ · 2 Code · 3 Text") so staff can verify the configuration before publishing. When `randomiseQuestions = false`, no randomisation information SHALL be shown.

#### Scenario: Preview of a randomised assessment shows quota breakdown
- **WHEN** a staff member views the preview of an assessment with `randomiseQuestions = true` and quotas `[{MCQ, 5}, {CODE_SUBMISSION, 2}, {TEXT, 3}]`
- **THEN** the preview displays "Randomised: 5 MCQ · 2 Code · 3 Text" (or equivalent readable labels)

#### Scenario: Preview of a non-randomised assessment shows no quota info
- **WHEN** a staff member views the preview of an assessment with `randomiseQuestions = false`
- **THEN** no randomisation section or quota labels are displayed
