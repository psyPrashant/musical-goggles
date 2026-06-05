## ADDED Requirements

### Requirement: Recruiter can reorder questions in the assessment builder using move-up and move-down controls
The assessment builder SHALL display a move-up button and a move-down button on each question card in the questions list. Clicking move-up SHALL swap the question with the one above it; clicking move-down SHALL swap the question with the one below it. The first question's move-up button SHALL be disabled; the last question's move-down button SHALL be disabled. The reordered sequence SHALL be persisted when the recruiter saves the assessment.

#### Scenario: Move-up swaps question with the one above
- **WHEN** a recruiter clicks the move-up button on a question card that is not the first in the list
- **THEN** the question moves one position up and the previously higher question moves one position down, updating the displayed order immediately

#### Scenario: Move-down swaps question with the one below
- **WHEN** a recruiter clicks the move-down button on a question card that is not the last in the list
- **THEN** the question moves one position down and the previously lower question moves one position up, updating the displayed order immediately

#### Scenario: Move-up is disabled for the first question
- **WHEN** a recruiter views the assessment builder with at least one question
- **THEN** the move-up button on the first question card is disabled

#### Scenario: Move-down is disabled for the last question
- **WHEN** a recruiter views the assessment builder with at least one question
- **THEN** the move-down button on the last question card is disabled

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
