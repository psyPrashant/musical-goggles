## ADDED Requirements

### Requirement: Each flagged-submission row has a contextual actions dropdown
The system SHALL render an actions cell on each flagged-submission row containing a trigger button labelled "Actions" (or a kebab icon). Clicking it SHALL open a dropdown. Clicking anywhere in the actions cell SHALL stop event propagation so row navigation is not triggered. The dropdown SHALL contain the following options, shown conditionally:

| Option | Condition |
|---|---|
| View Result | Always |
| Contact Candidate | Always |
| Blacklist / Unblacklist | Always (label depends on state) |
| Resolve Flag | Only when status is FLAGGED or UNDER_REVIEW |
| Dismiss | Only when status is FLAGGED or UNDER_REVIEW |

The dropdown SHALL close when an option is selected or when the user clicks outside it.

#### Scenario: Dropdown shows all options for an open flag
- **WHEN** staff opens the dropdown on a row with status `FLAGGED` or `UNDER_REVIEW`
- **THEN** all five options are visible

#### Scenario: Dropdown hides resolve and dismiss for closed flags
- **WHEN** staff opens the dropdown on a row with status `RESOLVED` or `DISMISSED`
- **THEN** "Resolve Flag" and "Dismiss" SHALL NOT appear

#### Scenario: Clicking in actions cell does not navigate
- **WHEN** a staff member clicks the actions button or any dropdown item
- **THEN** the row-click navigation SHALL NOT fire
