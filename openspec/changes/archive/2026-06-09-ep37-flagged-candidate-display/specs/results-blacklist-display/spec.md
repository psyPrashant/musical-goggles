## ADDED Requirements

### Requirement: Blacklist symbol in results submissions list
The results page submissions panel SHALL display a ⊘ no-entry symbol inline next to the candidate name for blacklisted candidates.

#### Scenario: Blacklisted candidate shows ⊘ in submissions list
- **WHEN** a blacklisted candidate appears in the results submissions panel
- **THEN** a ⊘ symbol is shown inline next to their name

#### Scenario: Non-blacklisted candidate shows no ⊘
- **WHEN** a candidate is not blacklisted
- **THEN** no ⊘ symbol appears on their submissions list row

### Requirement: Blacklisted tag in result detail header
The result detail panel SHALL display a "Blacklisted" tag next to the candidate's name in the detail header when the candidate is blacklisted.

#### Scenario: Blacklisted candidate detail shows tag
- **WHEN** a recruiter selects a submission from a blacklisted candidate
- **THEN** the detail header shows a "Blacklisted" tag next to the candidate's name

### Requirement: Results submissions list tags reflow below candidate name
All status badges, flag badges, and pending markers in the submissions list SHALL be displayed on a row below the candidate name, not inline. The blacklist ⊘ symbol is the only indicator that stays inline with the name.

#### Scenario: Tags display below name
- **WHEN** the submissions list renders a row with status and flag badges
- **THEN** the badges appear on a second line below the candidate name and are not truncated

#### Scenario: Blacklist symbol stays inline with name
- **WHEN** a blacklisted candidate's row is rendered
- **THEN** the ⊘ symbol is on the same line as the candidate name, not below it

### Requirement: Backend exposes blacklist state on submission summary
The `GET /api/submissions` (results list) response SHALL include `candidateBlacklisted: boolean` for each submission entry.

#### Scenario: Blacklisted candidate in results list
- **WHEN** a recruiter fetches the submissions list and a candidate is blacklisted
- **THEN** the submission entry includes `candidateBlacklisted: true`
