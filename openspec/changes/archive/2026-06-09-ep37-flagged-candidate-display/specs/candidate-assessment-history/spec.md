## ADDED Requirements

### Requirement: Flags loaded when assessment history modal opens
When the assessment history modal is opened, the system SHALL load candidate flags (if not already cached) so flag icons can be correlated with history entries by `submissionId`.

#### Scenario: Flags loaded on history modal open
- **WHEN** a recruiter opens the assessment history modal for a candidate
- **THEN** `getCandidateFlags(candidateId)` is called and cached for that candidate's session
