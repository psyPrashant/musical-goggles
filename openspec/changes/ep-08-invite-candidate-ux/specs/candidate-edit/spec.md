# candidate-edit Specification

## Purpose

Allows recruiters to correct a candidate's first name, last name, and email address directly from the candidates list, using inline editing in the table row.

## ADDED Requirements

### Requirement: Recruiter can update a candidate's details
The system SHALL expose `PUT /api/candidates/{id}` accepting `firstName`, `lastName`, and `email`. All three fields are required. The updated candidate SHALL be returned in the response.

#### Scenario: Successful update
- **WHEN** `PUT /api/candidates/{id}` is called with valid `firstName`, `lastName`, and `email`
- **AND** the candidate exists
- **AND** the email is not used by another candidate
- **THEN** the system returns HTTP 200 with the updated candidate

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
The UI SHALL display an edit icon button on each candidate row. Clicking the icon SHALL switch that row into an inline edit mode showing input fields for first name, last name, and email. Only one row SHALL be in edit mode at a time.

#### Scenario: Enter edit mode
- **WHEN** a recruiter clicks the edit icon on a candidate row
- **THEN** the row switches to inline edit mode showing input fields pre-populated with current values
- **AND** Save and Cancel icon buttons appear

#### Scenario: Save valid changes
- **WHEN** the recruiter edits fields and clicks Save
- **AND** all fields are non-empty
- **AND** the email is not taken by another candidate
- **THEN** `PUT /api/candidates/{id}` is called
- **AND** on success the row exits edit mode and displays the updated values

#### Scenario: Save with duplicate email
- **WHEN** the recruiter changes the email to one belonging to another candidate and clicks Save
- **THEN** the system returns 409
- **AND** an inline error message appears in the row: "This email is already used by another candidate."
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
