# assessment-question-reorder Specification

## Purpose
Allows recruiters to reorder questions in the assessment builder using move-up and move-down controls. Order is persisted via a dedicated batch reorder API endpoint.

## Requirements

### Requirement: Recruiter can reorder questions in the assessment builder by dragging
The assessment builder SHALL display a drag handle on each question card. A recruiter SHALL be able to drag a question card to a new position in the list using the handle. The reordered sequence SHALL be persisted when the recruiter saves the assessment.

#### Scenario: Dragging a question to a new position reorders the list
- **WHEN** a recruiter drags a question card's handle to a different position in the list
- **THEN** the question moves to the target position and the list updates immediately

#### Scenario: Reordered questions are persisted on save
- **WHEN** a recruiter reorders questions in the builder and then saves the assessment
- **THEN** the saved assessment returns questions in the new order from `GET /api/assessments/{id}`

### Requirement: API accepts a batch display-order update for assessment questions
The system SHALL expose `PUT /api/assessments/{id}/questions/order` accepting a list of `{questionId, displayOrder}` pairs. The endpoint SHALL update the `display_order` of each listed question in the given assessment atomically. All provided `questionId` values MUST belong to the assessment; any unrecognised questionId SHALL cause the entire request to be rejected with HTTP 422.

#### Scenario: Reorder endpoint updates display order of all listed questions
- **WHEN** an Admin or Recruiter calls `PUT /api/assessments/{id}/questions/order` with a valid ordered list of all question IDs in the assessment
- **THEN** each question's `display_order` is updated and the response is HTTP 200 with the updated assessment detail

#### Scenario: Reorder endpoint rejects unknown question IDs
- **WHEN** an Admin or Recruiter calls `PUT /api/assessments/{id}/questions/order` with a `questionId` that does not belong to the assessment
- **THEN** the response is HTTP 422 and no order changes are persisted
