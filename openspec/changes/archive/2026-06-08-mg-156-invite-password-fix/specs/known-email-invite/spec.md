## ADDED Requirements

### Requirement: Invite email auto-attaches assessment password without recruiter re-entry
When sending an invite for a password-protected assessment, the system SHALL automatically include the assessment's stored plain-text password in the invitation email. The `POST /api/invitations` endpoint SHALL NOT accept a `plainPassword` field; the password is sourced exclusively from the assessment record.

#### Scenario: Password-protected assessment — password auto-included in email
- **WHEN** a recruiter sends an invite for a password-protected assessment
- **THEN** the invitation email received by the candidate SHALL include the correct assessment password
- **AND** the recruiter SHALL NOT be prompted to enter the password manually

#### Scenario: No-password assessment — email sent without password line
- **WHEN** a recruiter sends an invite for an assessment with no password set
- **THEN** the invitation email SHALL be sent without any password line
- **AND** the invite form SHALL NOT display a password input field

#### Scenario: API request with plainPassword field is ignored
- **WHEN** `POST /api/invitations` is called with a `plainPassword` field in the request body
- **THEN** the field SHALL be ignored and the assessment's stored password SHALL be used
