# duplicate-invite Specification

## Purpose

Prevents creating duplicate invitations for the same candidate + assessment pair, including blocking re-invites when the candidate has already completed the assessment. Returns machine-readable conflict codes and surfaces them as non-blocking toasts in the UI.

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

### Requirement: Invite is blocked when candidate has already completed the assessment
The system SHALL reject an invitation request when a `CandidateSubmission` already exists for the same candidate and assessment with status `SUBMITTED` or `AUTO_SUBMITTED`. The response SHALL return HTTP 409 with machine-readable error code `ASSESSMENT_ALREADY_COMPLETED`. This check SHALL occur before the existing PENDING/SENT duplicate check.

#### Scenario: Candidate has a SUBMITTED submission — invite blocked
- **WHEN** a recruiter submits the invite form for candidate A and assessment X
- **AND** a `CandidateSubmission` exists for candidate A + assessment X with status `SUBMITTED`
- **THEN** the system returns HTTP 409
- **AND** the response body contains the error code `ASSESSMENT_ALREADY_COMPLETED`
- **AND** no new `candidate_invitation` row is created

#### Scenario: Candidate has an AUTO_SUBMITTED submission — invite blocked
- **WHEN** a recruiter submits the invite form for candidate A and assessment X
- **AND** a `CandidateSubmission` exists for candidate A + assessment X with status `AUTO_SUBMITTED`
- **THEN** the system returns HTTP 409
- **AND** the response body contains the error code `ASSESSMENT_ALREADY_COMPLETED`
- **AND** no new `candidate_invitation` row is created

#### Scenario: Candidate has only an IN_PROGRESS submission — invite not blocked by completion check
- **WHEN** a recruiter submits the invite form for candidate A and assessment X
- **AND** a `CandidateSubmission` exists for candidate A + assessment X with status `IN_PROGRESS`
- **THEN** the completion check does not block the request (other constraints, e.g. ACTIVE_INVITE_EXISTS, may still apply)

### Requirement: Completed assessment conflict is shown as a toast
The UI SHALL display a non-blocking toast notification when the backend returns an `ASSESSMENT_ALREADY_COMPLETED` conflict. The invite modal SHALL remain open.

#### Scenario: Toast appears on completed-assessment conflict
- **WHEN** the invite API returns HTTP 409 with error code `ASSESSMENT_ALREADY_COMPLETED`
- **THEN** a toast notification appears with the message "This candidate has already completed this assessment."
- **AND** the toast auto-dismisses after 4 seconds
- **AND** the invite modal remains open

### Requirement: Completed assessments are visually disabled in the invite picker
The invite modal's assessment selection list SHALL mark any assessment that the candidate has already completed (status `SUBMITTED` or `AUTO_SUBMITTED` in their history) as disabled and non-selectable.

#### Scenario: Completed assessment is disabled in picker
- **WHEN** a recruiter opens the invite modal for a candidate
- **AND** the candidate's history contains an entry for assessment X with status `SUBMITTED` or `AUTO_SUBMITTED`
- **THEN** assessment X appears disabled in the assessment selection list
- **AND** the recruiter cannot select it to send an invite

#### Scenario: Non-completed assessment is selectable in picker
- **WHEN** a recruiter opens the invite modal for a candidate
- **AND** the candidate has no completed submission for assessment Y
- **THEN** assessment Y is selectable in the assessment selection list (subject to other constraints)
