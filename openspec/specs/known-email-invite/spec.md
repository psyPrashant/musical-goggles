# known-email-invite Specification

## Purpose

Recovers gracefully when a recruiter types an email address that already belongs to an existing candidate. Instead of showing a dead-end conflict error, the system looks up the existing candidate and pre-populates the form so the invite can proceed without interruption.

## ADDED Requirements

### Requirement: Known email resolves to existing candidate silently
The system SHALL provide a `GET /api/candidates/by-email?email=<address>` endpoint that returns the matching candidate if found. This endpoint SHALL be accessible to ADMIN and RECRUITER roles only.

#### Scenario: Existing email found
- **WHEN** `GET /api/candidates/by-email?email=jane@example.com` is called
- **AND** a candidate with that email exists
- **THEN** the system returns HTTP 200 with the candidate's `id`, `firstName`, `lastName`, and `email`

#### Scenario: Email not found
- **WHEN** `GET /api/candidates/by-email?email=unknown@example.com` is called
- **AND** no candidate with that email exists
- **THEN** the system returns HTTP 404

#### Scenario: Unauthenticated access denied
- **WHEN** `GET /api/candidates/by-email` is called without a valid session
- **THEN** the system returns HTTP 401

### Requirement: Invite form pre-populates on known-email conflict and proceeds
The UI SHALL detect the 409 conflict from `POST /api/candidates`, immediately look up the existing candidate by email, and pre-populate the invite form. The form SHALL show a notice and automatically proceed to send the invite using the existing candidate's id.

#### Scenario: Known email typed — form pre-populates and invite proceeds
- **WHEN** a recruiter types an email that belongs to an existing candidate
- **AND** selects a different assessment
- **AND** submits the invite form
- **THEN** the form detects the 409 on candidate creation
- **AND** fetches the existing candidate via `GET /api/candidates/by-email`
- **AND** an inline notice appears: "This email is already registered as a candidate. Inviting them to the selected assessment."
- **AND** the invite is sent automatically using the existing candidate's id
- **AND** the modal transitions to the success/link state on a successful invite

#### Scenario: Known email + same assessment — duplicate guard fires instead
- **WHEN** a recruiter types an email that belongs to an existing candidate
- **AND** selects the same assessment that candidate already has a PENDING/SENT invite for
- **THEN** after looking up the candidate and attempting the invite, the duplicate-invite toast fires (see `duplicate-invite` spec)
- **AND** the modal remains open

#### Scenario: Known email lookup fails
- **WHEN** the `GET /api/candidates/by-email` call returns a non-200 response
- **THEN** the original 409 error message is shown to the recruiter
- **AND** the form remains editable

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
