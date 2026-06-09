# flagged-page-deduplication Specification

## Purpose
TBD - created by archiving change ep37-flagged-candidate-display. Update Purpose after archive.
## Requirements
### Requirement: Flagged submissions page shows one row per submission
The flagged submissions list SHALL display at most one row per submission (`submissionId`), showing the most recent flag (by `createdAt`). If multiple flag events exist for the same submission, only the latest is shown as the primary row.

#### Scenario: Submission with multiple flags shows only latest
- **WHEN** a submission has two flags (one RESOLVED, one FLAGGED raised later)
- **THEN** only the FLAGGED (latest) row is shown in the list

#### Scenario: Submissions with single flags show normally
- **WHEN** each submission has exactly one flag
- **THEN** all submissions appear as before, one row each

### Requirement: Document icon reveals full flag history per submission
Each row on the flagged submissions list SHALL have a document icon button. Clicking it SHALL toggle an inline history panel below that row showing all historical flags for that submission in chronological order (oldest first), each with reason, status, and date.

#### Scenario: Document icon opens flag history panel
- **WHEN** a recruiter clicks the document icon on a flagged row
- **THEN** an inline panel appears below the row listing all flags for that submission in chronological order

#### Scenario: Clicking document icon again closes the panel
- **WHEN** the history panel is open and the recruiter clicks the document icon again
- **THEN** the inline panel closes

#### Scenario: Status filter and actions apply to the latest flag row
- **WHEN** a recruiter applies a status filter
- **THEN** filtering is applied to the deduplicated (latest) flag for each submission, not to historical flags

