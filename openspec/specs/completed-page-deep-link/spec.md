## ADDED Requirements

### Requirement: Completed page row navigates to specific submission
Clicking a row on the Completed Assessments page SHALL navigate to the Results page (`/results`) with query params `submission=<submissionId>` and `assessmentId=<assessmentId>`, causing the Results page to auto-select that submission and pre-filter the list to that assessment.

#### Scenario: Click row navigates with correct query params
- **WHEN** a recruiter clicks any row on the Completed Assessments page
- **THEN** the browser navigates to `/results?submission=<submissionId>&assessmentId=<assessmentId>` for that row's submission

#### Scenario: Results page auto-selects the submission on arrival
- **WHEN** the Results page loads with `?submission=<submissionId>` in the URL
- **THEN** the matching submission is selected in the left panel and its detail is loaded in the right panel

#### Scenario: Results page pre-sets assessment filter on arrival
- **WHEN** the Results page loads with `?assessmentId=<assessmentId>` in the URL
- **THEN** the assessment dropdown filter is set to that assessment, narrowing the submissions list

#### Scenario: Results page with no query params is unaffected
- **WHEN** a recruiter navigates directly to `/results` with no query params
- **THEN** all submissions are shown unfiltered and no submission is pre-selected
