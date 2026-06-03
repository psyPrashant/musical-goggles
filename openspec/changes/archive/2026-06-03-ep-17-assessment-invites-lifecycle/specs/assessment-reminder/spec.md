## MODIFIED Requirements

### Requirement: Reminder email contains required information
The reminder email SHALL include the candidate's name, assessment name, deadline (date and time), and a secure direct access link. The link SHALL be constructed using the configurable `app.frontend.base-url` property and the candidate's existing invitation token.

#### Scenario: Email link uses frontend base URL
- **WHEN** a reminder email is sent (automated or manual)
- **THEN** the access link in the email is constructed from `app.frontend.base-url` (e.g., `http://localhost:4200/assessment/{id}/take?token={token}`), NOT the backend server address

#### Scenario: Email content
- **WHEN** a reminder email is sent (automated or manual)
- **THEN** the email body contains the candidate's first and last name, the assessment title, the `expiresAt` formatted as a readable date-time, and a clickable link constructed from the invitation token
- **AND** the link resolves to the candidate's assessment access page without requiring a new token

#### Scenario: Expired invitation not reminded
- **WHEN** an invitation has status=EXPIRED
- **THEN** no reminder email is sent for it
