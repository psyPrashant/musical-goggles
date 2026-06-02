## MODIFIED Requirements

### Requirement: Recruiter can update a candidate's details
The system SHALL expose `PUT /api/candidates/{id}` accepting `firstName`, `lastName`, `email`, and optional `cellPhone`. `firstName`, `lastName`, and `email` are required. `cellPhone` is optional; when provided it SHALL match the pattern `^[+\d\s()\-]{7,20}$`. The updated candidate SHALL be returned in the response including the `cellPhone` field.

#### Scenario: Successful update without phone
- **WHEN** `PUT /api/candidates/{id}` is called with valid `firstName`, `lastName`, and `email` and no `cellPhone`
- **AND** the candidate exists
- **AND** the email is not used by another candidate
- **THEN** the system returns HTTP 200 with the updated candidate and `cellPhone: null`

#### Scenario: Successful update with phone
- **WHEN** `PUT /api/candidates/{id}` is called with valid `firstName`, `lastName`, `email`, and a valid `cellPhone`
- **AND** the candidate exists
- **THEN** the system returns HTTP 200 with the updated candidate and `cellPhone` equal to the submitted value

#### Scenario: Clearing a phone number
- **WHEN** `PUT /api/candidates/{id}` is called with `cellPhone: null`
- **THEN** the system returns HTTP 200 and the candidate's `cellPhone` is set to `null`

#### Scenario: Invalid phone format
- **WHEN** `PUT /api/candidates/{id}` is called with a `cellPhone` that does not match the allowed pattern
- **THEN** the system returns HTTP 400

#### Scenario: Candidate not found
- **WHEN** `PUT /api/candidates/{id}` is called with an unknown id
- **THEN** the system returns HTTP 404

#### Scenario: Email conflict with another candidate
- **WHEN** `PUT /api/candidates/{id}` is called with an email already belonging to a different candidate
- **THEN** the system returns HTTP 409
- **AND** no update is persisted

#### Scenario: Missing required field
- **WHEN** `PUT /api/candidates/{id}` is called with a blank `firstName`, `lastName`, or `email`
- **THEN** the system returns HTTP 400

#### Scenario: Unauthenticated access denied
- **WHEN** `PUT /api/candidates/{id}` is called without a valid session
- **THEN** the system returns HTTP 401

### Requirement: Candidates list provides inline row editing
The UI SHALL display an edit icon button on each candidate row. Clicking the icon SHALL switch that row into an inline edit mode showing input fields for first name, last name, email, and an optional phone field. Only one row SHALL be in edit mode at a time.

#### Scenario: Enter edit mode
- **WHEN** a recruiter clicks the edit icon on a candidate row
- **THEN** the row switches to inline edit mode showing input fields pre-populated with current values for first name, last name, email, and cell phone

#### Scenario: Save valid changes with phone
- **WHEN** the recruiter edits fields including a valid phone number and clicks Save
- **AND** all required fields are non-empty
- **THEN** `PUT /api/candidates/{id}` is called with the phone included
- **AND** on success the row exits edit mode and displays the updated values including the phone

#### Scenario: Save clears phone
- **WHEN** the recruiter clears the phone field and clicks Save
- **THEN** `PUT /api/candidates/{id}` is called with `cellPhone: null`
- **AND** the Phone column shows `—` after save

#### Scenario: Save with duplicate email
- **WHEN** the recruiter changes the email to one belonging to another candidate and clicks Save
- **THEN** the system returns 409
- **AND** an inline error message appears: "This email is already used by another candidate."
- **AND** the row remains in edit mode

#### Scenario: Cancel discards changes
- **WHEN** the recruiter clicks Cancel
- **THEN** the row exits edit mode
- **AND** no HTTP call is made
- **AND** the original values are restored

#### Scenario: Only one row in edit mode
- **WHEN** a recruiter is editing row A
- **AND** clicks the edit icon on row B
- **THEN** row A exits edit mode without saving
- **AND** row B enters edit mode
