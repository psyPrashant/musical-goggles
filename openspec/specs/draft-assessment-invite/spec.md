# draft-assessment-invite Specification

## Purpose

Detects when a recruiter selects a DRAFT assessment in the invite form and presents an inline "Publish & Send" confirmation dialog. This avoids a confusing 400 error and gives the recruiter a path forward without leaving the modal.

## ADDED Requirements

### Requirement: DRAFT assessment is detected before the invite call
The UI SHALL check the selected assessment's `status` field before making any HTTP call. If the status is `DRAFT`, the invite SHALL NOT be submitted; instead an inline confirmation dialog SHALL be displayed.

#### Scenario: DRAFT assessment selected — confirmation dialog shown
- **WHEN** a recruiter fills in the invite form
- **AND** the selected assessment has status `DRAFT`
- **AND** the recruiter clicks "Send Invite"
- **THEN** no HTTP invite call is made
- **AND** an inline confirmation appears inside the modal: "This assessment is a draft and has not been published. Would you like to publish it now and send the invite?"
- **AND** two actions are available: "Publish & Send" and "Cancel"

#### Scenario: PUBLISHED assessment selected — no dialog, normal flow
- **WHEN** the selected assessment has status `PUBLISHED`
- **THEN** clicking "Send Invite" proceeds with the invite call immediately with no extra dialog

### Requirement: Publish & Send publishes the assessment then sends the invite
When the recruiter confirms via "Publish & Send", the system SHALL call the publish endpoint for the assessment, then — on success — send the invite. Both steps use existing endpoints.

#### Scenario: Publish succeeds — invite is sent
- **WHEN** the recruiter clicks "Publish & Send"
- **THEN** the system calls `PUT /api/assessments/{id}/publish`
- **AND** on a 200 response, the assessment status in the UI is updated to `PUBLISHED`
- **AND** the invite is sent
- **AND** the modal transitions to the success/link state

#### Scenario: Publish fails — error shown, invite not sent
- **WHEN** the recruiter clicks "Publish & Send"
- **AND** `PUT /api/assessments/{id}/publish` returns an error
- **THEN** an error message is shown inside the modal
- **AND** the invite is NOT sent
- **AND** the modal remains open

### Requirement: Cancel dismisses the dialog without side effects
Clicking "Cancel" on the DRAFT confirmation SHALL close the dialog and return the recruiter to the filled-in invite form with no changes made.

#### Scenario: Cancel — form preserved, nothing submitted
- **WHEN** the recruiter clicks "Cancel" on the DRAFT confirmation
- **THEN** the confirmation dialog is dismissed
- **AND** the invite form is visible again with all previously entered values intact
- **AND** no HTTP calls have been made

### Requirement: Publish & Send auto-attaches password without recruiter input
When a recruiter uses the "Publish & Send" flow for a password-protected DRAFT assessment, the system SHALL automatically include the assessment's stored password in the invite email. No password input SHALL be shown in the confirmation dialog or the invite form.

#### Scenario: Publish & Send for password-protected assessment — password included automatically
- **WHEN** a recruiter selects a DRAFT password-protected assessment
- **AND** confirms "Publish & Send"
- **THEN** the assessment is published
- **AND** the invite email sent to the candidate SHALL include the correct assessment password without any recruiter re-entry
