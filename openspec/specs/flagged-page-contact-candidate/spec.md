## ADDED Requirements

### Requirement: Staff can contact a flagged candidate directly from the flagged list
The system SHALL provide a "Contact Candidate" option in the flagged-submission row actions dropdown. Clicking it SHALL reveal an inline form with a pre-filled subject (editable) and a blank message body (required). On submit, the system SHALL call `POST /api/candidates/{candidateId}/contact` with the subject and message. The backend SHALL send the email via Spring Mail and set `actionRequired = true` on the Candidate. On success, the inline form SHALL close and a success toast SHALL be shown. On failure, an inline error SHALL be displayed.

#### Scenario: Staff opens the contact form
- **WHEN** a staff member clicks "Contact Candidate" in the actions dropdown
- **THEN** an inline form appears with a pre-filled subject and an empty message body

#### Scenario: Staff sends a contact email
- **WHEN** the staff member submits the form with a non-empty message body
- **THEN** the system calls `POST /api/candidates/{candidateId}/contact`
- **AND** the backend sends an email to the candidate and sets `actionRequired = true`
- **AND** the form closes and a success toast is shown

#### Scenario: Contact email fails
- **WHEN** the contact API call fails
- **THEN** the form remains open and an inline error message is shown
- **AND** `actionRequired` is NOT set on the candidate

#### Scenario: Invitation blocked while actionRequired is true
- **WHEN** a recruiter attempts to invite a candidate whose `actionRequired` is `true`
- **THEN** the system SHALL reject the invitation with a 409 conflict response
- **AND** the frontend SHALL display an appropriate error message
