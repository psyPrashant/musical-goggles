## ADDED Requirements

### Requirement: Staff can dismiss an open flag directly from the flagged submissions list
The system SHALL display a "Dismiss" action on each flagged-submission list row where the flag status is `FLAGGED` or `UNDER_REVIEW`. Clicking Dismiss SHALL transition the flag to `DISMISSED` using the existing `PATCH /api/submissions/{submissionId}/flags/{flagId}` endpoint with a system-supplied resolution note. On success, the row SHALL be removed from the list or updated to reflect the resolved status. No confirmation dialog is required.

#### Scenario: Staff dismisses an open flag
- **WHEN** a staff member clicks "Dismiss" on a row with flag status `FLAGGED` or `UNDER_REVIEW`
- **THEN** the system calls `PATCH /api/submissions/{id}/flags/{flagId}` transitioning to `DISMISSED`
- **AND** the row is removed from the active flagged list on success

#### Scenario: Dismiss not shown for resolved or dismissed flags
- **WHEN** a flag row has status `RESOLVED` or `DISMISSED`
- **THEN** no "Dismiss" action is shown for that row

#### Scenario: Dismiss fails due to network error
- **WHEN** the dismiss API call fails
- **THEN** the row remains in the list and an inline error message is shown

#### Scenario: FLAGGED flag is dismissed via two-step transition
- **WHEN** staff dismisses a flag with status `FLAGGED`
- **THEN** the system transitions `FLAGGED → UNDER_REVIEW` then `UNDER_REVIEW → DISMISSED` to satisfy valid transition rules
- **AND** from the staff member's perspective this appears as a single Dismiss action
