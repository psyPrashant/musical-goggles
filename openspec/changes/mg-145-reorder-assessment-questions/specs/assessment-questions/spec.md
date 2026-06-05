## MODIFIED Requirements

### Requirement: Question order within an assessment is configurable
The ordered list of questions returned by `GET /api/assessments/{id}` SHALL be sorted ascending by `displayOrder`. The display order of questions SHALL be updatable via `PUT /api/assessments/{id}/questions/order`, which accepts a list of `{questionId, displayOrder}` pairs and updates all orders atomically. The legacy mechanism of re-adding a question with a different `displayOrder` via the idempotent `POST /api/assessments/{id}/questions` SHALL continue to work for backward compatibility.

#### Scenario: Questions are returned in displayOrder sequence
- **WHEN** an authenticated Admin or Recruiter calls `GET /api/assessments/{id}` for an assessment with multiple questions
- **THEN** the questions array in the response is sorted ascending by their `displayOrder`

#### Scenario: Batch reorder updates the display order atomically
- **WHEN** an Admin or Recruiter calls `PUT /api/assessments/{id}/questions/order` with a valid list of all question IDs and new display orders
- **THEN** the questions are returned in the new order on the next `GET /api/assessments/{id}`
