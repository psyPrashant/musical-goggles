## Requirements

### Requirement: Completed assessments page exists
The system SHALL provide a dedicated page at `/completed-assessments` accessible to RECRUITER and ADMIN roles listing all submitted assessment results.

#### Scenario: Page loads with completed submissions
- **WHEN** a recruiter navigates to `/completed-assessments`
- **THEN** a table is displayed showing all submissions with status SUBMITTED or AUTO_SUBMITTED

#### Scenario: Page is linked from sidebar
- **WHEN** a recruiter is logged in
- **THEN** a "Completed Assessments" link is visible in the sidebar navigation

### Requirement: Filter by assessment
The completed assessments page SHALL provide a dropdown to filter results by assessment title.

#### Scenario: Select assessment filter
- **WHEN** a recruiter selects an assessment from the filter dropdown
- **THEN** only submissions for that assessment are shown in the table

#### Scenario: All assessments default
- **WHEN** the page first loads
- **THEN** submissions for all assessments are shown (no filter applied)

### Requirement: Filter by pass/all
The completed assessments page SHALL provide a filter to show only passing submissions or all submissions.

Pass is defined as: `totalScore / maxScore >= 0.5` (50% or above).

#### Scenario: Show passing only
- **WHEN** the recruiter selects "Pass only" filter
- **THEN** only submissions where totalScore / maxScore >= 0.5 are shown

#### Scenario: Show all default
- **WHEN** the page first loads
- **THEN** all completed submissions are shown regardless of score

#### Scenario: Zero maxScore edge case
- **WHEN** a submission has maxScore = 0
- **THEN** that submission is excluded from "Pass only" results (cannot calculate percentage)

### Requirement: Completed assessments rows are clickable
Each row in the completed assessments table SHALL navigate to the results page with that submission pre-selected.

#### Scenario: Click row navigates
- **WHEN** a recruiter clicks a row in the completed assessments table
- **THEN** the browser navigates to `/results?submissionId=<uuid>` and that submission is auto-selected
