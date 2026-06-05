## ADDED Requirements

### Requirement: Staff can blacklist or unblacklist a candidate from the flagged list
The system SHALL provide a "Blacklist" or "Unblacklist" option in the flagged-submission row actions dropdown, labelled based on the candidate's current `blacklisted` state. Clicking "Blacklist" SHALL call `PATCH /api/candidates/{candidateId}/blacklist` with `{ blacklisted: true }`. Any authenticated staff member (Recruiter or Admin) SHALL be permitted to blacklist. Clicking "Unblacklist" SHALL call the same endpoint with `{ blacklisted: false }`. Only users with the ADMIN role SHALL be permitted to unblacklist; Recruiters SHALL receive a 403 response. The `FlagListItem` SHALL include `candidateId` and `candidateBlacklisted` so the dropdown can reflect current state.

#### Scenario: Recruiter blacklists a candidate
- **WHEN** a recruiter clicks "Blacklist" in the dropdown
- **THEN** the system calls `PATCH /api/candidates/{id}/blacklist` with `{ blacklisted: true }`
- **AND** the dropdown label changes to "Unblacklist" on success

#### Scenario: Admin unblacklists a candidate
- **WHEN** an admin clicks "Unblacklist" in the dropdown
- **THEN** the system calls `PATCH /api/candidates/{id}/blacklist` with `{ blacklisted: false }`
- **AND** the dropdown label changes to "Blacklist" on success

#### Scenario: Recruiter cannot unblacklist
- **WHEN** a recruiter attempts to unblacklist a candidate
- **THEN** the system SHALL return 403 Forbidden
- **AND** the frontend SHALL show an inline error indicating admin approval is required

#### Scenario: Blacklisted candidate cannot be invited
- **WHEN** a recruiter attempts to invite a candidate whose `blacklisted` is `true`
- **THEN** the system SHALL reject the invitation with a 409 conflict response
