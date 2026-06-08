## ADDED Requirements

### Requirement: Staff can resolve a flag directly from the flagged list
The system SHALL provide a "Resolve Flag" option in the flagged-submission row actions dropdown, visible only when the flag status is `FLAGGED` or `UNDER_REVIEW`. Clicking it SHALL reveal an inline form with a required resolution notes textarea. On submit, the system SHALL transition the flag to `RESOLVED` using the same two-step pattern as dismiss (FLAGGED → UNDER_REVIEW → RESOLVED). On success, the row SHALL be removed from the list. On failure, an inline error SHALL be shown.

#### Scenario: Staff resolves an open flag with notes
- **WHEN** a staff member clicks "Resolve Flag" in the dropdown
- **THEN** an inline resolution notes form appears

#### Scenario: Staff submits resolution notes
- **WHEN** the staff member enters resolution notes and clicks Confirm
- **THEN** the system transitions the flag to `RESOLVED` (via UNDER_REVIEW if currently FLAGGED)
- **AND** the row is removed from the flagged list on success

#### Scenario: Resolution notes are required
- **WHEN** the staff member tries to submit with an empty notes field
- **THEN** the system SHALL not submit and SHALL indicate the field is required

#### Scenario: Resolve Flag not shown for closed flags
- **WHEN** a flag row has status `RESOLVED` or `DISMISSED`
- **THEN** the "Resolve Flag" option SHALL NOT be shown in the dropdown
