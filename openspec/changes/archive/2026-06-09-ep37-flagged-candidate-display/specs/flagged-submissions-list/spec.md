## ADDED Requirements

### Requirement: Flagged submissions list deduplicated and enriched with history
The flagged submissions list SHALL deduplicate by `submissionId` (showing only the latest flag per submission) and SHALL provide a document icon per row to view the full flag history for that submission inline.

#### Scenario: One row per submission
- **WHEN** multiple flags exist for the same submission
- **THEN** only the most recent flag appears as the primary row

#### Scenario: Document icon toggles inline history
- **WHEN** a recruiter clicks the document icon
- **THEN** an inline history panel opens below that row showing all flags in chronological order
