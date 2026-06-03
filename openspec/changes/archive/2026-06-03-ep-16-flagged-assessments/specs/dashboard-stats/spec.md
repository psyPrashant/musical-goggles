## MODIFIED Requirements

### Requirement: Dashboard stats endpoint returns live aggregated data
The system SHALL expose `GET /api/dashboard/stats` accessible to ADMIN and RECRUITER roles. The response SHALL include active candidate count, pending review count, average score (last 30 days), pipeline stage counts, and a recent activity list.

#### Scenario: Stats with existing data
- **WHEN** `GET /api/dashboard/stats` is called
- **AND** the database contains invitations and submissions
- **THEN** the system returns HTTP 200 with:
  - `activeCandidates`: count of `candidate_invitations` with status PENDING or SENT and `expires_at` in the future
  - `pendingReviews`: count of `candidate_submissions` with status SUBMITTED that have at least one `candidate_answer` without a corresponding `answer_score`
  - `averageScore`: average of `answer_scores.score` for scores created in the last 30 days; expressed as a number (e.g. `78.4`); `null` if no scored answers exist in the period
  - `pipeline`: object with `invited`, `inProgress`, `pendingReview`, `completed`, `flagged` integer counts
  - `recentActivity`: array of up to 10 most recent activity events (invitations sent + submissions started/submitted) sorted by `occurredAt` descending

#### Scenario: Stats with empty database (fresh install)
- **WHEN** `GET /api/dashboard/stats` is called
- **AND** no invitations or submissions exist
- **THEN** the system returns HTTP 200 with all counts as `0` and `averageScore` as `null` and `recentActivity` as an empty array

#### Scenario: Unauthenticated access denied
- **WHEN** `GET /api/dashboard/stats` is called without a valid session
- **THEN** the system returns HTTP 401

### Requirement: Pipeline counts reflect actual candidate stages
The `pipeline` object in the stats response SHALL map to the following definitions:

#### Scenario: Pipeline stages are correctly computed
- **WHEN** the database has candidates at various stages
- **THEN** `invited` = count of PENDING/SENT invitations with no associated submission
- **AND** `inProgress` = count of `candidate_submissions` with status `IN_PROGRESS`
- **AND** `pendingReview` = count of SUBMITTED submissions with at least one unscored answer
- **AND** `completed` = count of SUBMITTED submissions where all answers have a score
- **AND** `flagged` = count of distinct submissions that have at least one `submission_flag` with status `FLAGGED` or `UNDER_REVIEW`

#### Scenario: Flagged count excludes resolved and dismissed flags
- **WHEN** all flags on a submission have status `RESOLVED` or `DISMISSED`
- **THEN** that submission is NOT counted in `pipeline.flagged`

#### Scenario: Submission counted once even with multiple open flags
- **WHEN** a submission has two open flags (status `FLAGGED` or `UNDER_REVIEW`)
- **THEN** `pipeline.flagged` counts that submission only once

### Requirement: Activity events represent real platform events
The `recentActivity` array SHALL contain events derived from actual database records, not static data.

#### Scenario: Activity events populated from invitations and submissions
- **WHEN** the dashboard stats are fetched
- **THEN** each activity event includes: `type` (e.g. `INVITATION_SENT`, `SUBMISSION_STARTED`, `SUBMISSION_COMPLETED`), `description` (human-readable label including candidate name), `meta` (contextual detail), and `occurredAt` (ISO-8601 timestamp)
- **AND** events are sorted by `occurredAt` descending
- **AND** the array is capped at 10 entries

### Requirement: Dashboard UI shows live stats from API
The dashboard component SHALL replace all hardcoded values with live data from `GET /api/dashboard/stats`. A loading state SHALL be shown while the request is in flight. The pipeline bar SHALL include a "Flagged" stage displaying the `pipeline.flagged` count.

#### Scenario: Dashboard loads with live data
- **WHEN** the user navigates to the dashboard
- **THEN** the UI shows a loading indicator
- **AND** on response, all four stat cards display values from the API
- **AND** the pipeline bar reflects actual stage counts including the "Flagged" stage
- **AND** the recent activity list shows actual events

#### Scenario: Dashboard with no flagged submissions
- **WHEN** `pipeline.flagged` is `0`
- **THEN** the "Flagged" pipeline stage displays `0`

#### Scenario: Dashboard with no data
- **WHEN** the API returns all zeros and an empty activity list
- **THEN** stat cards display `0` for counts and `—` for average score
- **AND** the activity section shows an empty-state message

#### Scenario: Dashboard API error
- **WHEN** `GET /api/dashboard/stats` returns an error
- **THEN** the stat cards show `—` rather than stale or missing values
- **AND** an error message is shown in the dashboard
