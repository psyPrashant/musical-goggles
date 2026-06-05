## ADDED Requirements

### Requirement: Assessment dropdown filter on Results page
The Results page header SHALL include a dropdown that allows the recruiter to filter the submission list by assessment. The dropdown SHALL be populated from the unique assessments present in the currently loaded submissions. Selecting an assessment SHALL narrow the visible list to submissions for that assessment only, composable with the existing status filter.

#### Scenario: Default state shows all submissions
- **WHEN** the Results page loads
- **THEN** the assessment dropdown SHALL default to "All Assessments"
- **AND** all submissions SHALL be visible (subject to any active status filter)

#### Scenario: Selecting an assessment filters the list
- **WHEN** the recruiter selects a specific assessment from the dropdown
- **THEN** only submissions whose `assessmentId` matches the selection SHALL appear in the list

#### Scenario: Assessment filter composes with status filter
- **WHEN** both an assessment and a status filter are active
- **THEN** only submissions matching BOTH the selected assessment AND the selected status SHALL appear

#### Scenario: Submission count reflects active filters
- **WHEN** any filter is active
- **THEN** the submission count shown in the page sub-header SHALL reflect the number of currently visible (filtered) submissions

#### Scenario: Dropdown options derived from loaded submissions
- **WHEN** the submission list is loaded
- **THEN** the assessment dropdown options SHALL be derived from the unique `assessmentId`/`assessmentTitle` pairs present in the submissions
- **AND** each assessment SHALL appear in the dropdown at most once regardless of how many submissions it has

#### Scenario: Clearing the assessment filter restores full list
- **WHEN** the recruiter selects "All Assessments" from the dropdown
- **THEN** the assessment filter SHALL be cleared and all submissions SHALL be visible again (subject to any active status filter)
