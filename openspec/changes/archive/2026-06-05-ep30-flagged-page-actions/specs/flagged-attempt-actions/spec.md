## MODIFIED Requirements

### Requirement: Staff can dismiss an open flag directly from the flagged submissions list
The system SHALL provide an actions dropdown on each flagged-submission list row. The dropdown SHALL contain: "View Result", "Contact Candidate", "Blacklist" or "Unblacklist", "Resolve Flag", and "Dismiss". "Dismiss" SHALL transition the flag to `DISMISSED` using the existing two-step pattern. "Dismiss" and "Resolve Flag" SHALL only appear when flag status is `FLAGGED` or `UNDER_REVIEW`. Clicking anywhere in the actions cell SHALL stop event propagation so the row navigation is not triggered.

#### Scenario: Staff opens the actions dropdown
- **WHEN** a staff member clicks the actions button on a flagged row
- **THEN** a dropdown appears with contextually relevant options

#### Scenario: Dismiss removes the row on success
- **WHEN** a staff member clicks "Dismiss" in the dropdown for a flag with status `FLAGGED` or `UNDER_REVIEW`
- **THEN** the system transitions the flag to `DISMISSED`
- **AND** the row is removed from the active flagged list

#### Scenario: Dismiss and Resolve Flag hidden for closed flags
- **WHEN** a flag row has status `RESOLVED` or `DISMISSED`
- **THEN** neither "Dismiss" nor "Resolve Flag" is shown in the dropdown

#### Scenario: FLAGGED flag is dismissed via two-step transition
- **WHEN** staff dismisses a flag with status `FLAGGED`
- **THEN** the system transitions `FLAGGED → UNDER_REVIEW` then `UNDER_REVIEW → DISMISSED`
- **AND** from the staff member's perspective this appears as a single Dismiss action
