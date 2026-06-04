## MODIFIED Requirements

### Requirement: GROUP question total marks shown in preview heading
The question bank GROUP preview SHALL display the total mark allocation above the sub-question list.

#### Scenario: GROUP preview shows total
- **GIVEN** an admin user expands the preview of a GROUP question in the question bank
- **THEN** a "X pts total" label is displayed above the sub-question list

### Requirement: Sub-question mark allocation visible in question bank preview
Each sub-question within a GROUP SHALL display its individual mark allocation in the question bank preview.

#### Scenario: Sub-question pts badge in question bank
- **GIVEN** an admin user expands the preview of a GROUP question
- **THEN** each sub-question header shows its `maxScore` formatted as "1 pt" or "X pts"

### Requirement: Sub-question mark allocation visible during candidate assessment
Each sub-question within a GROUP SHALL display its individual mark allocation when a candidate is taking an assessment.

#### Scenario: Sub-question pts badge in assessment take view
- **GIVEN** a candidate is taking an assessment and the current question is a GROUP
- **THEN** each sub-question header shows its `maxScore` formatted as "1 pt" or "X pts"
- **AND** the GROUP-level total in the question meta bar remains unchanged
