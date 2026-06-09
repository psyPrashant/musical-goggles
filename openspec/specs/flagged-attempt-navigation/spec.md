## Purpose
Defines how clicking a flagged submission row navigates staff directly to the assessment attempt/result view for that submission.
## Requirements
### Requirement: Clicking a flagged submission row navigates to the attempt detail
The system SHALL make each row in the flagged submissions list clickable. Clicking a row SHALL navigate to the Results page (`/results`) with the `submission` query parameter set to the submission ID. The Results page SHALL read the `submission` query parameter on init to pre-select and display that submission's detail panel.

#### Scenario: Staff clicks a flagged submission row
- **WHEN** a staff member clicks a row in the flagged submissions list
- **THEN** the browser navigates to `/results?submission={submissionId}` using SPA router navigation
- **AND** the Results page opens with that submission's detail panel pre-selected

#### Scenario: Results page reads submission query param on load
- **WHEN** the Results page loads with `?submission={submissionId}` in the URL
- **THEN** the page auto-selects the matching submission and shows its detail panel

#### Scenario: Navigation does not prevent actions dropdown
- **WHEN** a staff member interacts with the actions dropdown within a row
- **THEN** the dropdown action fires and the row navigation does NOT trigger

