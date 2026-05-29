## 1. Backend — Domain Model & Migrations (MG-23)

- [x] 1.1 Create `Assessment` entity: `id`, `title`, `description`, `timeLimitMinutes`, `status` (enum: DRAFT/PUBLISHED), `createdBy`, `createdAt`, `updatedAt`
- [x] 1.2 Create `AssessmentStatus` enum: `DRAFT`, `PUBLISHED`
- [x] 1.3 Create `AssessmentQuestion` entity: `id`, `assessmentId`, `questionId`, `displayOrder` (non-nullable) — `@ManyToOne` to `Assessment` and `Question`
- [x] 1.4 Write Flyway migration `V2__create_assessments.sql` (`assessments` table with status default `'DRAFT'`)
- [x] 1.5 Write Flyway migration `V3__create_assessment_questions.sql` (`assessment_questions` table with FK to `assessments` and `questions`)

## 2. Backend — Assessment CRUD API (MG-23)

- [x] 2.1 Create `AssessmentRepository` (Spring Data JPA)
- [x] 2.2 Create `AssessmentService` interface and `AssessmentServiceImpl`: `create`, `findAll`, `findById`, `update`, `delete`, `publish`
- [x] 2.3 Implement `publish()`: check status is DRAFT, set to PUBLISHED; throw `ConflictException` if already PUBLISHED
- [x] 2.4 Create `AssessmentController` with `POST`, `GET` (list), `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `PUT /{id}/publish`
- [x] 2.5 Annotate all endpoints with `@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")`
- [x] 2.6 Create `AssessmentRequest`, `AssessmentSummaryResponse`, `AssessmentDetailResponse`, `AssessmentQuestionItemResponse` (entity ↔ DTO via service mapping)
- [x] 2.7 Add validation: `title` required, `timeLimitMinutes` must be positive — return HTTP 400 otherwise
- [x] 2.8 Implement cascade delete: deleting an assessment removes its `AssessmentQuestion` records (via `orphanRemoval = true`)
- [x] 2.9 Write integration tests: create, list, get detail, update, delete, publish (including 409 on re-publish), 403 for candidate role

## 3. Backend — Question Sub-Resource API (MG-24, MG-25)

- [x] 3.1 Create `AssessmentQuestionRepository` with query `findByAssessmentIdAndQuestionId` and `countCodeSubmissionInAssessment`
- [x] 3.2 Implement `AssessmentService.addQuestion(assessmentId, questionId, displayOrder)`:
  - Verify question exists (throw 404 if not)
  - Idempotent: if already linked, update `displayOrder` and return
  - Enforce max-one-CODE_SUBMISSION rule: if incoming question type is `CODE_SUBMISSION` and one already exists → throw domain exception (mapped to HTTP 422)
  - Save and return updated assessment detail
- [x] 3.3 Implement `AssessmentService.removeQuestion(assessmentId, questionId)`: throw 404 if not linked
- [x] 3.4 Add `POST /api/assessments/{id}/questions` and `DELETE /api/assessments/{id}/questions/{questionId}` to `AssessmentController`
- [x] 3.5 Create `AddAssessmentQuestionRequest` DTO with `questionId` and `displayOrder` (both required); validate
- [x] 3.6 Map domain exception for CODE_SUBMISSION limit to HTTP 422 via `ResponseStatusException(UNPROCESSABLE_ENTITY)`
- [x] 3.7 Write integration tests: add MCQ/TEXT/CODE question; idempotent add updates order; reject second CODE_SUBMISSION (422); remove question leaves bank intact; remove non-linked question (404); questions returned in displayOrder

## 4. Backend — Preview Endpoint (MG-26)

- [x] 4.1 Create `AssessmentPreviewResponse` DTO: title, description, timeLimitMinutes, ordered list of `PreviewQuestionDto` (body, type, options without `isCorrect`, languageHint)
- [x] 4.2 Implement `AssessmentService.getPreview(assessmentId)`: build preview DTO, strip `isCorrect` from MCQ options
- [x] 4.3 Add `GET /api/assessments/{id}/preview` to `AssessmentController` with `@PreAuthorize`
- [x] 4.4 Write integration tests: preview DRAFT assessment, preview PUBLISHED assessment, MCQ options have no `isCorrect` field, CODE_SUBMISSION includes languageHint, 404 for unknown assessment, 403 for candidate role

## 5. Frontend — Assessment List & Form (MG-23)

- [x] 5.1 Create `AssessmentService` at `src/app/core/assessment/assessment.service.ts` (HTTP calls for all assessment endpoints)
- [x] 5.2 Create `AssessmentsComponent` (standalone) at `/assessments` — list with title, status badge, question count, and action buttons (edit, delete, open builder, publish)
- [x] 5.3 Create `AssessmentFormComponent` (shared create/edit) at `/assessments/new` and `/assessments/:id/edit` — fields: title, description, timeLimitMinutes; validation mirrors API rules
- [x] 5.4 Add Publish button to list view; call `PUT /api/assessments/{id}/publish`; handle 409 gracefully
- [x] 5.5 Wire delete with confirmation dialog
- [x] 5.6 Register routes in `app.routes.ts` (lazy-loaded)
- [x] 5.7 Write Vitest unit tests for `AssessmentFormComponent` validation (title required, timeLimitMinutes positive)

## 6. Frontend — Assessment Builder (MG-24, MG-25)

- [x] 6.1 Create `AssessmentDetailComponent` at `/assessments/:id` — shows assessment metadata and ordered question list
- [x] 6.2 Add "Add question" panel: searchable question picker using existing `QuestionService.listQuestions()`, filterable by type
- [x] 6.3 Implement add-question call: user enters `displayOrder`; call `POST /api/assessments/{id}/questions`
- [x] 6.4 Display warning when CODE_SUBMISSION limit is reached; disable add button for CODE_SUBMISSION type questions when limit is already hit
- [x] 6.5 Implement remove-question button per row; call `DELETE /api/assessments/{id}/questions/{questionId}`
- [x] 6.6 Write Vitest tests: question list renders in order; CODE_SUBMISSION add button disabled when limit reached

## 7. Frontend — Assessment Preview (MG-26)

- [x] 7.1 Create `AssessmentPreviewComponent` at `/assessments/:id/preview` — read-only candidate view: title, time limit, ordered questions
- [x] 7.2 Render MCQ questions with options (no correct-answer highlight); TEXT questions with body; CODE_SUBMISSION with body and language hint badge
- [x] 7.3 Add "Preview" link/button from `AssessmentDetailComponent` that navigates to the preview route
- [x] 7.4 Write Vitest tests: preview renders all three question types correctly; MCQ options do not show correct marker
