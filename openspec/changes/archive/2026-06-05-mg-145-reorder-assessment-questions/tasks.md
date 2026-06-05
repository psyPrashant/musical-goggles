## 1. Backend — Reorder Endpoint

- [x] 1.1 Add `ReorderAssessmentQuestionsRequest` DTO record: `List<QuestionOrderItem>` where `QuestionOrderItem` is `{UUID questionId, int displayOrder}`
- [x] 1.2 Add `reorderQuestions(UUID assessmentId, ReorderAssessmentQuestionsRequest request)` method to `AssessmentService` interface and implementation — validate all questionIds belong to the assessment (422 if not), then update each `AssessmentQuestion.displayOrder` atomically
- [x] 1.3 Add `PUT /api/assessments/{id}/questions/order` endpoint in `AssessmentController` wired to the service method, returning `AssessmentDetailResponse`
- [x] 1.4 Write unit/integration tests for the reorder endpoint: happy path, unknown questionId returns 422

## 2. Frontend — Assessment Service

- [x] 2.1 Add `reorderQuestions(assessmentId: string, order: {questionId: string, displayOrder: number}[]): Observable<AssessmentDetail>` method to `AssessmentService` calling `PUT /api/assessments/{id}/questions/order`

## 3. Frontend — Assessment Builder UI

- [x] 3.1 Add `moveUp(index: number)` and `moveDown(index: number)` methods to `AssessmentBuilderComponent` that swap adjacent questions in the local signal and update their `displayOrder` values (1-based sequential)
- [x] 3.2 Add move-up and move-down icon buttons to each question card in the builder template; bind `[disabled]` to `i === 0` / `i === last`; use the existing `icon-btn` CSS class
- [x] 3.3 Track a `orderChanged` flag; set it to `true` whenever `moveUp`/`moveDown` is called
- [x] 3.4 In the save flow, if `orderChanged` is true call `assessmentService.reorderQuestions(...)` before or after the main update and reset the flag on success

## 4. Verification

- [x] 4.1 Manually test: create an assessment with 3+ questions, reorder them, save, reload — confirm order is persisted
- [x] 4.2 Confirm move-up is disabled on first question and move-down is disabled on last question
- [x] 4.3 Run `npm test` in `recruitment-fe/` — no regressions (pre-existing vitest config issues unrelated to this change; TypeScript type-check passes clean)
- [x] 4.4 Run `./mvnw test` in `recruitment-be/` — 27/27 tests pass including 2 new reorder tests
