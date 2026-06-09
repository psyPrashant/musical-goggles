## ADDED Requirements

### Requirement: Publish & Send auto-attaches password without recruiter input
When a recruiter uses the "Publish & Send" flow for a password-protected DRAFT assessment, the system SHALL automatically include the assessment's stored password in the invite email. No password input SHALL be shown in the confirmation dialog or the invite form.

#### Scenario: Publish & Send for password-protected assessment — password included automatically
- **WHEN** a recruiter selects a DRAFT password-protected assessment
- **AND** confirms "Publish & Send"
- **THEN** the assessment is published
- **AND** the invite email sent to the candidate SHALL include the correct assessment password without any recruiter re-entry
