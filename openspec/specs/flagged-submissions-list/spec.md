## Purpose
Defines the flagged submissions list page: what staff can see, filter, and action on flagged assessment attempts.
## Requirements
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
The Angular SPA SHALL provide a route (`/flagged-submissions`) that renders the flagged submissions list with columns for candidate name, assessment name, reason, date flagged, and status. The page SHALL support filter controls for reason, assessment, date range, **and status**. All flags SHALL remain visible in the list regardless of status — resolved and dismissed entries SHALL NOT be removed after a status transition.

#### Scenario: Recruiter navigates to flagged submissions page
- **WHEN** a recruiter opens the flagged submissions page
- **THEN** all flags (FLAGGED, UNDER_REVIEW, ACTION_REQUIRED, RESOLVED, DISMISSED) are loaded and displayed ordered by most recent first

#### Scenario: Recruiter filters by assessment
- **WHEN** a recruiter selects an assessment in the filter dropdown
- **THEN** only flags for that assessment are shown

#### Scenario: Resolved flag remains visible after resolve action
- **WHEN** a staff member resolves a flag
- **THEN** the flag row remains in the list with its status badge updated to "Resolved"

#### Scenario: Dismissed flag remains visible after dismiss action
- **WHEN** a staff member dismisses a flag
- **THEN** the flag row remains in the list with its status badge updated to "Dismissed"

### Requirement: Flagged submissions list has a status filter
The flagged submissions page SHALL include a status filter dropdown with options: All, Flagged, Under Review, Action Required, Resolved, Dismissed. The default selection SHALL be "All" (showing every status). Selecting a status SHALL filter the visible rows to that status only.

#### Scenario: Default state shows all statuses
- **WHEN** a recruiter opens the flagged submissions page without applying any status filter
- **THEN** all flags regardless of status are displayed

#### Scenario: Filter to active-only
- **WHEN** a recruiter selects "Flagged" from the status filter
- **THEN** only rows with status FLAGGED are shown

#### Scenario: Filter to resolved
- **WHEN** a recruiter selects "Resolved" from the status filter
- **THEN** only rows with status RESOLVED are shown

### Requirement: Flagged submissions page shows one row per submission
The flagged submissions list SHALL display at most one row per submission (`submissionId`), showing the most recent flag. Each row SHALL have a document icon button that toggles an inline history panel showing all flags for that submission in chronological order.

#### Scenario: Submission with multiple flags shows only latest
- **WHEN** a submission has multiple flag events
- **THEN** only the latest flag row is shown in the list

#### Scenario: Document icon opens flag history panel
- **WHEN** a recruiter clicks the document icon on a flagged row
- **THEN** an inline panel appears showing all flags for that submission in chronological order

### Requirement: Flagged submissions list deduplicated and enriched with history
The flagged submissions list SHALL deduplicate by `submissionId` (showing only the latest flag per submission) and SHALL provide a document icon per row to view the full flag history for that submission inline.

#### Scenario: One row per submission
- **WHEN** multiple flags exist for the same submission
- **THEN** only the most recent flag appears as the primary row

#### Scenario: Document icon toggles inline history
- **WHEN** a recruiter clicks the document icon
- **THEN** an inline history panel opens below that row showing all flags in chronological order

