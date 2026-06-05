## ADDED Requirements

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
