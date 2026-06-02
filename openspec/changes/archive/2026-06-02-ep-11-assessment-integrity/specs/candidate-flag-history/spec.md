## ADDED Requirements

### Requirement: Recruiter can retrieve all flags for a candidate
The system SHALL expose `GET /api/candidates/{candidateId}/flags` accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The response SHALL list all `SubmissionFlag` records across all assessments where the given candidate was the submission's owner. Each entry SHALL include `assessmentName`, `flagReason`, `flaggedAt`, and `flagStatus`. Results SHALL be ordered by `flaggedAt` descending (most recent first).

#### Scenario: Candidate has flags across multiple assessments
- **WHEN** a recruiter calls `GET /api/candidates/{id}/flags` for a candidate with flags in two different assessments
- **THEN** HTTP 200 is returned with both flags, ordered most recent first

#### Scenario: Candidate has no flags
- **WHEN** a recruiter calls `GET /api/candidates/{id}/flags` for a candidate with no flags
- **THEN** HTTP 200 is returned with an empty list

#### Scenario: Candidate not found
- **WHEN** a recruiter calls `GET /api/candidates/{id}/flags` for a non-existent candidate
- **THEN** HTTP 404 is returned

#### Scenario: Candidate user cannot access another candidate's flag history
- **WHEN** a request with `role=CANDIDATE` calls `GET /api/candidates/{id}/flags`
- **THEN** HTTP 403 is returned

### Requirement: FE candidate profile shows flag history section
The Angular candidate profile page SHALL include a "Flag History" section that displays each historical flag for that candidate: assessment name, reason, date, and resolution status. The section SHALL be ordered by most recent flag first. If there are no flags, the section SHALL display "No flags recorded."

#### Scenario: Candidate profile with prior flags
- **WHEN** a recruiter opens a candidate profile that has two historical flags
- **THEN** both flags are displayed in the Flag History section, most recent first

#### Scenario: Candidate profile with no flags
- **WHEN** a recruiter opens a candidate profile with no flag history
- **THEN** the Flag History section shows "No flags recorded"
