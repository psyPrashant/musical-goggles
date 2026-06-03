## ADDED Requirements

### Requirement: Clicking a flagged submission row navigates to the attempt detail
The system SHALL make each row in the flagged submissions list a navigable link. Clicking a row SHALL navigate to the Results page (`/results`) with the `submission` query parameter set to the submission ID, causing the Results page to pre-select and display that submission's detail panel. The link SHALL support standard browser link behaviour (middle-click opens in new tab, right-click context menu).

#### Scenario: Staff clicks a flagged submission row
- **WHEN** a staff member clicks a row in the flagged submissions list
- **THEN** the browser navigates to `/results?submission={submissionId}`
- **AND** the Results page opens with that submission's detail panel pre-selected

#### Scenario: Row renders as a navigable link element
- **WHEN** the flagged submissions list is displayed
- **THEN** each row is rendered with `routerLink` so it behaves as a standard browser link
- **AND** middle-clicking a row opens the Results page in a new tab

#### Scenario: Navigation does not prevent Dismiss action
- **WHEN** a staff member clicks the "Dismiss" button within a row
- **THEN** the dismiss action fires and the row navigation does NOT trigger
