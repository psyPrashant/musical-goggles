## Context

EP-02 delivered the Question Bank: `Question` entities (three types), `QuestionGroup`, and `Tag` with full REST API and Angular UI. EP-03 adds the `Assessment` aggregate on top of that foundation. An assessment is a curated, ordered list of questions that a recruiter selects from the bank, configured with metadata and a lifecycle status. The backend and frontend patterns established in EP-02 (JOINED inheritance, join table with display_order, Spring Data JPA, standalone Angular components) should be followed consistently here.

## Goals / Non-Goals

**Goals:**
- `Assessment` entity with title, description, time limit, and DRAFT/PUBLISHED status
- `AssessmentQuestion` join table linking assessments to questions with explicit `display_order`
- Full CRUD REST API for assessments, question add/remove sub-resource, and a publish transition endpoint
- Enforce max 1 `CODE_SUBMISSION` question per assessment at the API level
- Read-only candidate-perspective preview endpoint
- Angular UI: list, create/edit form, question builder (add/remove/reorder), and preview view

**Non-Goals:**
- Assessment versioning or change history
- Cloning or templating assessments
- Random question ordering or question pools/banks per assessment
- Weighted scoring configuration (belongs to EP-06)
- Sending assessments to candidates (belongs to EP-04)
- Time enforcement during taking (belongs to EP-05)

## Decisions

### 1 — `Assessment` as a standalone entity (not extending `Question`)

`Assessment` has no inheritance relationship with `Question`. It is a plain JPA `@Entity` with a `@OneToMany` to `AssessmentQuestion`. This is simpler and avoids any confusion with the existing question type hierarchy.

### 2 — `AssessmentQuestion` join table mirrors `QuestionGroupItem`

`assessment_questions(id, assessment_id, question_id, display_order)` with `display_order` always required (non-nullable). Unlike `question_group_items` where `display_order` is optional, assessments always have an explicit question order to ensure candidates see a deterministic sequence.

`display_order` uses gap integers (10, 20, 30, …) to allow insertions without renumbering. The service layer enforces this on add.

### 3 — DRAFT / PUBLISHED as a string enum column

`status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'` mapped to a Java `AssessmentStatus` enum. Transitions: DRAFT → PUBLISHED via `PUT /api/assessments/{id}/publish`. No reverse transition in this epic (un-publishing is EP-06 scope). This keeps the state machine minimal and testable.

### 4 — Max-one-CODE_SUBMISSION enforced in `AssessmentService`

`AssessmentService.addQuestion()` queries the current question list, counts `CODE_SUBMISSION` types, and throws a domain exception if the count is already ≥ 1 and the incoming question is also `CODE_SUBMISSION`. The controller translates this to HTTP 422. This is a service-layer rule (not a DB constraint) so the error message can be user-readable.

### 5 — REST API design

```
POST   /api/assessments                              → create (DRAFT)
GET    /api/assessments                              → list (summary: id, title, status, questionCount)
GET    /api/assessments/{id}                         → detail with ordered questions
PUT    /api/assessments/{id}                         → update metadata
DELETE /api/assessments/{id}                         → delete
PUT    /api/assessments/{id}/publish                 → transition DRAFT → PUBLISHED
POST   /api/assessments/{id}/questions               → add question (body: {questionId, displayOrder})
DELETE /api/assessments/{id}/questions/{questionId}  → remove question
GET    /api/assessments/{id}/preview                 → candidate-perspective view (questions only, no admin fields)
```

All endpoints: `@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")`.

### 6 — Angular: dedicated `AssessmentService` + reuse of `QuestionService`

A new `AssessmentService` in `src/app/core/assessment/` handles all assessment HTTP calls. The question picker in `AssessmentDetailComponent` calls the existing `QuestionService.getAll()` to browse the bank — no duplication. The preview component (`AssessmentPreviewComponent`) renders the same question layout that EP-05 will use for candidates, so it provides a design reference for that epic.

## Risks / Trade-offs

- **Display order gaps**: Inserting a question between two existing items requires the caller to supply a `displayOrder` in the gap. If no gap exists, the service should compact and re-space orders. Mitigation: document the gap convention; implement a `reorder` utility in the service.
- **Preview diverges from real taking experience**: EP-05 will build the true timed taking flow. If preview is too detailed now it may need rework. Mitigation: keep preview as a read-only render of questions — no timer logic, no submission state.
- **PUBLISHED assessments are mutable**: This epic does not prevent editing a published assessment's questions. Mitigation: enforce immutability in EP-04/05 when invitations are in play; document the current open behaviour.
