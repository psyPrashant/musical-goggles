## ADDED Requirements

### Requirement: Candidate history endpoint
The system SHALL expose `GET /api/candidates/{candidateId}/history` returning an ordered list of all assessment invitations for that candidate, each enriched with submission status, total score, and marking state. Results SHALL be ordered by invitation creation date descending (newest first). The endpoint SHALL be accessible only to users with ADMIN or RECRUITER role.

#### Scenario: Candidate with completed submission
- **WHEN** a recruiter calls `GET /api/candidates/{id}/history` for a candidate who has completed an assessment
- **THEN** the response includes an entry with `assessmentName`, `status=SUBMITTED` (or `AUTO_SUBMITTED`), `submittedAt`, `totalScore`, `markingStatus`, and `linkedRole=null`

#### Scenario: Candidate with pending invitation (no submission)
- **WHEN** a recruiter calls `GET /api/candidates/{id}/history` for a candidate who was invited but has not started
- **THEN** the response includes an entry with `status=PENDING`, `totalScore=null`, `markingStatus=null`

#### Scenario: Candidate with expired invitation
- **WHEN** an invitation's `expiresAt` is in the past and no submission exists
- **THEN** the entry's `status` SHALL be `EXPIRED`

#### Scenario: Candidate not found
- **WHEN** the candidate ID does not exist
- **THEN** the system SHALL return HTTP 404

#### Scenario: Unauthenticated request
- **WHEN** the request carries no valid auth token
- **THEN** the system SHALL return HTTP 401

### Requirement: Assessment history view on candidate profile
The system SHALL display an assessment history section accessible from the candidate list page. Each entry SHALL show: assessment name, submission status badge, date (invited date if pending, submitted date if complete), total score or "Pending review", and role context ("No linked role" when none is set).

#### Scenario: History modal opens
- **WHEN** a recruiter clicks the history button on a candidate row
- **THEN** a modal opens showing all history entries for that candidate ordered newest first

#### Scenario: Empty history
- **WHEN** a candidate has never been invited to any assessment
- **THEN** the modal SHALL display "No assessment history recorded"

#### Scenario: Score display for unmarked submission
- **WHEN** a completed submission has not been fully marked
- **THEN** the history entry SHALL display "Pending review" instead of a numeric score

### Requirement: Filter and sort candidate assessment history
The system SHALL provide client-side controls to filter the history list by status and to sort by date. Filter and sort SHALL apply immediately without a server round trip.

#### Scenario: Filter by status — completed
- **WHEN** recruiter selects "Completed" filter
- **THEN** only entries with status SUBMITTED or AUTO_SUBMITTED are shown

#### Scenario: Filter by status — pending
- **WHEN** recruiter selects "Pending" filter
- **THEN** only entries with status PENDING are shown

#### Scenario: Filter by status — expired
- **WHEN** recruiter selects "Expired" filter
- **THEN** only entries with status EXPIRED are shown

#### Scenario: Sort by date descending (default)
- **WHEN** the history is first loaded
- **THEN** entries are ordered newest first

#### Scenario: Sort by date ascending
- **WHEN** recruiter selects oldest-first sort
- **THEN** entries are reordered oldest first

### Requirement: Click-through to submission detail
The system SHALL allow a recruiter to navigate directly to the full submission detail from a completed history entry.

#### Scenario: Click-through on completed entry
- **WHEN** recruiter clicks a history entry that has a submission
- **THEN** the system navigates to the Results page pre-selecting that submission

#### Scenario: No click-through for pending entries
- **WHEN** a history entry has no submission (status=PENDING or EXPIRED)
- **THEN** no navigation link is shown for that entry

### Requirement: Role context per history entry
The system SHALL display a linked job/role name on each history entry. When no job is linked to the assessment, the entry SHALL display "No linked role".

#### Scenario: Assessment with no linked role
- **WHEN** an assessment has no associated job role
- **THEN** the history entry SHALL display "No linked role" as the role context field
