## ADDED Requirements

### Requirement: Invite is blocked for candidates with an active flag
The system SHALL prevent a recruiter from sending a new assessment invite to a candidate who has an active flag (status FLAGGED or UNDER_REVIEW). The invite submit button SHALL be disabled and a contextual warning SHALL be displayed based on the candidate's flag state.

Warning messages:
- Active flag, `candidateActionRequired = false`: *"This candidate has been flagged and cannot be sent a new assessment at this time."*
- Active flag, `candidateActionRequired = true`: *"This candidate has been flagged. Awaiting response from candidate. A new assessment cannot be sent until resolved."*
- Blacklisted (existing): existing blacklist warning (unchanged).
- No active flag and not blacklisted: invite proceeds normally.

#### Scenario: Flagged candidate — invite blocked with flagged warning
- **WHEN** a recruiter opens the invite modal for a candidate whose `activeFlagStatus` is FLAGGED or UNDER_REVIEW and `actionRequired = false`
- **THEN** the warning "This candidate has been flagged and cannot be sent a new assessment at this time." is displayed
- **AND** the invite submit button is disabled

#### Scenario: Flagged candidate with action required — invite blocked with awaiting warning
- **WHEN** a recruiter opens the invite modal for a candidate with an active flag and `actionRequired = true`
- **THEN** the warning "This candidate has been flagged. Awaiting response from candidate. A new assessment cannot be sent until resolved." is displayed
- **AND** the invite submit button is disabled

#### Scenario: Resolved candidate — invite proceeds normally
- **WHEN** a candidate's flags are all RESOLVED or DISMISSED and they are not blacklisted
- **THEN** the invite modal shows no flag warning and the submit button is enabled

### Requirement: Backend exposes active flag status on candidate list
The `GET /api/candidates` response SHALL include `activeFlagStatus: FlagStatus | null` for each candidate, reflecting the status of the candidate's most recent open flag (FLAGGED or UNDER_REVIEW), or `null` if no open flag exists.

#### Scenario: Candidate with open flag
- **WHEN** a recruiter fetches the candidates list and a candidate has a FLAGGED flag
- **THEN** the candidate's `activeFlagStatus` is `"FLAGGED"`

#### Scenario: Candidate with no open flags
- **WHEN** a candidate has no flags or all flags are RESOLVED/DISMISSED
- **THEN** the candidate's `activeFlagStatus` is `null`
