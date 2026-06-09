# action-required-indicator Specification

## Purpose
TBD - created by archiving change ep37-flagged-candidate-display. Update Purpose after archive.
## Requirements
### Requirement: Action Required badge on candidate flag history entries
The flag history panel on the candidates page SHALL display an "Action Required" badge on each flag entry where `candidateActionRequired = true`.

#### Scenario: Flag with action required shows badge
- **WHEN** a recruiter views the flag history for a candidate and a flag entry has `candidateActionRequired = true`
- **THEN** an "Action Required" badge is displayed on that entry

#### Scenario: Flag without action required shows no badge
- **WHEN** a flag entry has `candidateActionRequired = false`
- **THEN** no "Action Required" badge is shown for that entry

### Requirement: Action Required indicator on flagged submissions rows
The flagged submissions list SHALL display a visual indicator (icon or sub-badge) on rows where the flag's `candidateActionRequired = true`, distinguishing them from plain FLAGGED rows.

#### Scenario: Flagged row with action required shows indicator
- **WHEN** a flag row in the flagged submissions list has `candidateActionRequired = true`
- **THEN** an "Action Req." indicator is visible on that row alongside the existing status badge

#### Scenario: Flagged row without action required shows no indicator
- **WHEN** a flag row has `candidateActionRequired = false`
- **THEN** no action-required indicator is shown

