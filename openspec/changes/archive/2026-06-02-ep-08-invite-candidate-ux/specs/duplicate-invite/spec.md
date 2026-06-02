# duplicate-invite Specification

## Purpose

Prevents creating duplicate invitations for the same candidate + assessment pair. Returns a machine-readable conflict code and surfaces it as a non-blocking toast in the UI.

## ADDED Requirements

### Requirement: Duplicate invite is blocked and reported
The system SHALL reject an invitation request when a PENDING or SENT invitation already exists for the same candidate and assessment combination. The response SHALL include a machine-readable error code `DUPLICATE_INVITE`.

#### Scenario: Same candidate, same assessment — second invite blocked
- **WHEN** a recruiter submits the invite form for candidate A and assessment X
- **AND** a PENDING or SENT invitation already exists for candidate A + assessment X
- **THEN** the system returns HTTP 409
- **AND** the response body contains the error code `DUPLICATE_INVITE`
- **AND** no new `candidate_invitation` row is created in the database

#### Scenario: Same candidate, different assessment — invite allowed
- **WHEN** a recruiter submits the invite form for candidate A and assessment Y
- **AND** candidate A has an existing invitation for a different assessment X
- **THEN** the system returns HTTP 201
- **AND** a new invitation is created for assessment Y

#### Scenario: Different candidate, same assessment — invite allowed
- **WHEN** a recruiter submits the invite form for candidate B and assessment X
- **AND** candidate A already has an invitation for assessment X
- **THEN** the system returns HTTP 201
- **AND** a new invitation is created for candidate B

### Requirement: Duplicate invite conflict is shown as a toast
The UI SHALL display a non-blocking toast notification when the backend returns a `DUPLICATE_INVITE` conflict. The invite modal SHALL remain open so the recruiter can change the assessment selection.

#### Scenario: Toast appears on duplicate conflict
- **WHEN** the invite API returns HTTP 409 with error code `DUPLICATE_INVITE`
- **THEN** a toast notification appears with the message "This candidate already has a pending invitation for this assessment."
- **AND** the toast auto-dismisses after 4 seconds
- **AND** the invite modal remains open

#### Scenario: No toast on successful invite
- **WHEN** the invite API returns HTTP 201
- **THEN** no error toast is shown
- **AND** the modal transitions to the success/link state
