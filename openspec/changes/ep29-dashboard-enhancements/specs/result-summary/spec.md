## MODIFIED Requirements

### Requirement: Results page supports deep-link via query parameter
The results page (`/results`) SHALL accept an optional `submissionId` query parameter. When present, the page SHALL auto-select the matching submission in the sidebar and load its detail on initial render.

#### Scenario: Deep link pre-selects submission
- **WHEN** a user navigates to `/results?submissionId=<uuid>`
- **THEN** the submission with that UUID is selected in the sidebar list and its result detail is displayed in the main panel

#### Scenario: No query param — normal behaviour unchanged
- **WHEN** a user navigates to `/results` with no query parameters
- **THEN** the page loads normally with no submission pre-selected

#### Scenario: Unknown submissionId is silently ignored
- **WHEN** a user navigates to `/results?submissionId=<non-existent-uuid>`
- **THEN** the page loads normally with no submission pre-selected and no error is shown
