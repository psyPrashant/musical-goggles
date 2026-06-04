## ADDED Requirements

### Requirement: Candidate pipeline displayed at top of dashboard content
The dashboard SHALL display the candidate pipeline section as the first element in the content area, directly below the page header.

#### Scenario: Dashboard loads with pipeline data
- **WHEN** a staff member navigates to the dashboard
- **THEN** the candidate pipeline card SHALL appear immediately below the page header, before any other content sections

#### Scenario: Pipeline shows all five stages
- **WHEN** the dashboard stats load successfully
- **THEN** the pipeline SHALL display exactly five stages in order: Invited, In Progress, Pending Review, Completed, Flagged — each with its count and progress bar

#### Scenario: Pipeline shows empty state when stats are unavailable
- **WHEN** the stats API call fails or is loading
- **THEN** the pipeline stages array SHALL be empty and no pipeline stage rows SHALL be rendered

### Requirement: Summary stat cards removed from dashboard
The dashboard SHALL NOT display the four summary stat cards (Total Assessments, Active Candidates, Pending Reviews, Average Score).

#### Scenario: Dashboard renders without stat cards
- **WHEN** a staff member views the dashboard
- **THEN** no element with stat card content (Total Assessments, Active Candidates, Pending Reviews, Average Score labels or values) SHALL be present in the DOM

### Requirement: Recent Assessments and Recent Activity remain below pipeline
The mid-grid containing Recent Assessments and Recent Activity SHALL remain visible and SHALL appear below the candidate pipeline section.

#### Scenario: Dashboard layout order
- **WHEN** the dashboard is fully rendered
- **THEN** the content order SHALL be: candidate pipeline → Recent Assessments / Recent Activity grid
