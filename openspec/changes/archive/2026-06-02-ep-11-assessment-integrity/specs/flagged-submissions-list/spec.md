## ADDED Requirements

### Requirement: Recruiter can view all flagged submissions
The system SHALL expose `GET /api/flags` accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The response SHALL list all submission flags across all assessments, including `candidateName`, `assessmentName`, `flagReason`, `flaggedAt`, and `flagStatus`. Results SHALL be ordered by `flaggedAt` descending.

#### Scenario: Multiple flags exist
- **WHEN** a recruiter calls `GET /api/flags`
- **THEN** the system returns HTTP 200 with a list of flag objects each containing `flagId`, `submissionId`, `candidateName`, `assessmentName`, `reason`, `status`, `createdAt`

#### Scenario: No flags exist
- **WHEN** a recruiter calls `GET /api/flags` and no flags have been raised
- **THEN** the system returns HTTP 200 with an empty list

#### Scenario: Candidate user cannot access flagged submissions list
- **WHEN** a request with `role=CANDIDATE` calls `GET /api/flags`
- **THEN** the system returns HTTP 403

### Requirement: Flagged submissions list is filterable
The `GET /api/flags` endpoint SHALL accept optional query parameters: `reason` (exact match on flag reason enum), `assessmentId` (UUID), `fromDate` (ISO-8601 date), and `toDate` (ISO-8601 date). All filters are AND-combined.

#### Scenario: Filter by assessmentId
- **WHEN** a recruiter calls `GET /api/flags?assessmentId={id}`
- **THEN** only flags for submissions belonging to that assessment are returned

#### Scenario: Filter by date range
- **WHEN** a recruiter calls `GET /api/flags?fromDate=2026-01-01&toDate=2026-06-01`
- **THEN** only flags created within that range are returned

#### Scenario: Filter by reason
- **WHEN** a recruiter calls `GET /api/flags?reason=TIMING_ANOMALY`
- **THEN** only flags with that reason are returned

### Requirement: FE displays a dedicated flagged submissions page
The Angular SPA SHALL provide a route (e.g. `/flagged-submissions`) that renders the flagged submissions list with columns for candidate name, assessment name, reason, date flagged, and status. The page SHALL support filter controls for reason, assessment, and date range.

#### Scenario: Recruiter navigates to flagged submissions page
- **WHEN** a recruiter opens the flagged submissions page
- **THEN** all current flags are loaded and displayed in a table ordered by most recent first

#### Scenario: Recruiter filters by assessment
- **WHEN** a recruiter selects an assessment in the filter dropdown
- **THEN** only flags for that assessment are shown
