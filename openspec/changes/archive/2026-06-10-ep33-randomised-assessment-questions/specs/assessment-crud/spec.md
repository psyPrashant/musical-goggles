## MODIFIED Requirements

### Requirement: Assessment request includes randomisation fields
`AssessmentRequest` (used for both create and update) MUST accept `randomiseQuestions` (boolean, default `false`) and `randomisationQuotas` (list of `{questionType, count}`, may be empty). The API MUST persist these fields and return them in `AssessmentDetail` and `AssessmentPreview` responses.

#### Scenario: Create assessment without randomisation fields (backwards compatibility)
- **WHEN** a client POSTs an `AssessmentRequest` without `randomiseQuestions` or `randomisationQuotas`
- **THEN** the assessment is created with `randomiseQuestions = false` and an empty quota list

#### Scenario: Create assessment with randomisation fields
- **WHEN** a client POSTs an `AssessmentRequest` with `randomiseQuestions = true` and `randomisationQuotas = [{MCQ, 3}]`
- **THEN** the created assessment detail includes `randomiseQuestions = true` and `randomisationQuotas = [{MCQ, 3}]`

#### Scenario: Update assessment clears quotas when randomisation is disabled
- **WHEN** staff PUTs an `AssessmentRequest` with `randomiseQuestions = false` on a previously randomised assessment
- **THEN** the assessment is updated with `randomiseQuestions = false` and `randomisationQuotas` is cleared
