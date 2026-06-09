## ADDED Requirements

### Requirement: Flag icon on candidate assessment history entries
The candidate assessment history modal SHALL display a ⚑ flag icon on history rows that have an associated flag (any flag status). The flag status SHALL be derived by correlating loaded candidate flags with history entries by `submissionId`.

#### Scenario: History entry with a flag shows flag icon
- **WHEN** a recruiter views a candidate's assessment history and an entry's `submissionId` matches a loaded flag for that candidate
- **THEN** a ⚑ icon is displayed on that row alongside the assessment name

#### Scenario: History entry without a flag shows no icon
- **WHEN** a history entry has no matching flag
- **THEN** no flag icon is displayed on that row

### Requirement: Blacklist symbol on candidate assessment history entries
The candidate assessment history modal SHALL display a ⊘ no-entry symbol on all history rows when the candidate is currently blacklisted.

#### Scenario: Blacklisted candidate — all history rows show ⊘
- **WHEN** a recruiter opens the assessment history for a blacklisted candidate
- **THEN** every history row shows a ⊘ symbol

#### Scenario: Non-blacklisted candidate — no ⊘ shown
- **WHEN** the candidate is not blacklisted
- **THEN** no ⊘ symbol is shown on history rows

### Requirement: Candidate flags are loaded when assessment history modal opens
The system SHALL load candidate flags when the assessment history modal is opened (if not already loaded), so that flag icons can be correlated with history entries.

#### Scenario: Flags loaded on history modal open
- **WHEN** a recruiter opens the assessment history modal for a candidate
- **THEN** the system calls `getCandidateFlags(candidateId)` and stores the result for icon correlation
