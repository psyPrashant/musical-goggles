## MODIFIED Requirements

### Requirement: Recruiter can access a candidate-facing preview of an assessment from the assessments list
The assessments list view SHALL include a "Preview" action on each assessment row that navigates to the candidate-facing assessment preview page (`/assessments/:id/preview`). The preview page already exists; this requirement adds the shortcut from the list.

#### Scenario: Preview button navigates to assessment preview
- **WHEN** a recruiter clicks the "Preview" button on any assessment row in the assessments list
- **THEN** the recruiter is navigated to `/assessments/{id}/preview` and the candidate-facing preview is displayed

#### Scenario: Preview is available for both DRAFT and PUBLISHED assessments
- **WHEN** the assessments list shows a mix of DRAFT and PUBLISHED assessments
- **THEN** the Preview button is visible and functional for all assessments regardless of status

### Requirement: Assessment preview renders GROUP questions with their full sub-question list
The assessment preview page (`AssessmentPreviewComponent`) SHALL render GROUP questions by showing the group body as a preamble paragraph, followed by an ordered list of sub-questions. Each sub-question SHALL be rendered with its type badge and body text. MCQ sub-questions SHALL additionally render their answer options. The sub-question list SHALL use the same visual patterns as top-level question cards.

#### Scenario: GROUP question shows preamble and sub-questions
- **WHEN** a recruiter views the candidate-facing preview of an assessment containing a GROUP question
- **THEN** the GROUP card displays the group body as a preamble, followed by numbered sub-question entries each showing a type badge and question body

#### Scenario: MCQ sub-question within a GROUP shows answer options
- **WHEN** a GROUP question contains an MCQ sub-question
- **THEN** the MCQ sub-question entry in the preview displays its answer options labelled A, B, C… in the same style as standalone MCQ questions

#### Scenario: Non-GROUP questions are unaffected
- **WHEN** the assessment preview renders MCQ, TEXT, or CODE_SUBMISSION questions at the top level
- **THEN** their rendering is unchanged from before this change
