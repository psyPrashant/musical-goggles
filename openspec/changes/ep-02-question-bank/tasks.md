## 1. Backend — Domain Model & Migrations (MG-19)

- [ ] 1.1 Create base `Question` entity: `id`, `title`, `body`, `type` (enum: MCQ/TEXT/CODE_SUBMISSION), `createdBy`, `createdAt`, `updatedAt` — use JPA `@Inheritance(JOINED)`
- [ ] 1.2 Create `McqQuestion` entity extending `Question` — maps to `mcq_questions` table
- [ ] 1.3 Create `QuestionOption` entity: `id`, `mcqQuestionId`, `text`, `isCorrect`
- [ ] 1.4 Create `TextQuestion` entity extending `Question` — maps to `text_questions` table (no extra columns needed)
- [ ] 1.5 Create `CodeSubmissionQuestion` entity extending `Question` — maps to `code_submission_questions` table with optional `languageHint` column
- [ ] 1.6 Write Flyway migration `V4__create_question_tables.sql` (base + 3 type tables + options table)
- [ ] 1.7 Create `QuestionGroup` entity: `id`, `name`, `description`, `isStructured`
- [ ] 1.8 Create `QuestionGroupItem` entity: `id`, `groupId`, `questionId`, `displayOrder` (nullable)
- [ ] 1.9 Write Flyway migration `V5__create_question_groups.sql`
- [ ] 1.10 Create `Tag` entity: `id`, `name` (unique, lowercase)
- [ ] 1.11 Create `QuestionTag` join entity: `questionId`, `tagId`
- [ ] 1.12 Write Flyway migration `V6__create_tags.sql`

## 2. Backend — Question CRUD API (MG-19)

- [ ] 2.1 Create `QuestionRepository` (Spring Data JPA) with custom query for tag filter
- [ ] 2.2 Create `QuestionService`: `create`, `findAll(filters)`, `findById`, `update`, `delete`
- [ ] 2.3 Implement cascade delete: removing a question deletes its `QuestionGroupItem` records
- [ ] 2.4 Create `QuestionController` with `POST`, `GET` (list + `?type=&?tag=`), `GET /{id}`, `PUT /{id}`, `DELETE /{id}`
- [ ] 2.5 Annotate all endpoints with `@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")`
- [ ] 2.6 Create request/response DTOs and `QuestionMapper` (entity ↔ DTO)
- [ ] 2.7 Add MCQ validation: must have ≥ 2 options and exactly 1 marked correct — return HTTP 400 otherwise
- [ ] 2.8 Write integration tests: create MCQ/Text/Code questions; list with filters; update; delete with group cleanup

## 3. Backend — Question Groups API (MG-20, MG-21)

- [ ] 3.1 Create `QuestionGroupRepository` and `QuestionGroupItemRepository`
- [ ] 3.2 Create `QuestionGroupService`: `create`, `findAll`, `findById` (with questions), `update`, `delete`, `addQuestion`, `removeQuestion`
- [ ] 3.3 Implement uniqueness check on group `name` — return HTTP 409 on duplicate
- [ ] 3.4 Implement idempotent add: if question already in group, return 200 without creating duplicate
- [ ] 3.5 Enforce `displayOrder` required when adding question to structured group — return HTTP 400 otherwise
- [ ] 3.6 Create `QuestionGroupController` with full CRUD + `/questions` sub-resource endpoints
- [ ] 3.7 Annotate all endpoints with `@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")`
- [ ] 3.8 Write integration tests: create group; add/remove questions; structured ordering; idempotent add

## 4. Backend — Tags API (MG-22)

- [ ] 4.1 Create `TagRepository` with `findByNameIgnoreCase` and `findAllInUse` (join to question_tags)
- [ ] 4.2 Create `TagService`: `findOrCreate(name)` (normalises to lowercase), `listAllInUse`, `cleanupOrphans` (called on question delete)
- [ ] 4.3 Create `TagController` with `GET /api/tags` returning alphabetically sorted in-use tags
- [ ] 4.4 Wire tag normalisation into `QuestionService.create/update`
- [ ] 4.5 Write integration tests: create question with tags; filter by tag; tag list; orphan cleanup on delete

## 5. Frontend — Question Bank UI (MG-19)

- [ ] 5.1 Create `QuestionsComponent` (standalone) at `/questions` — paginated list with type icon, title, tags, and action buttons
- [ ] 5.2 Add tag filter chip bar and type filter dropdown to the list view
- [ ] 5.3 Create `QuestionFormComponent` (shared create/edit) with dynamic sections per type (MCQ options editor, code language input)
- [ ] 5.4 Create route `/questions/new` (create) and `/questions/:id/edit` (edit) using `QuestionFormComponent`
- [ ] 5.5 Implement MCQ options sub-form: add/remove options, mark one as correct
- [ ] 5.6 Add tag autocomplete input (calls `GET /api/tags`)
- [ ] 5.7 Wire up delete with a confirmation dialog
- [ ] 5.8 Write Vitest unit tests for `QuestionFormComponent` validation (MCQ requires correct option)

## 6. Frontend — Question Groups UI (MG-20, MG-21)

- [ ] 6.1 Create `QuestionGroupsComponent` at `/question-groups` — list with name, question count, structured badge
- [ ] 6.2 Create `QuestionGroupDetailComponent` at `/question-groups/:id` — shows group questions with drag-to-reorder for structured groups
- [ ] 6.3 Create group create/edit form (name, description, isStructured toggle)
- [ ] 6.4 Implement "Add question to group" panel (searchable question picker)
- [ ] 6.5 For structured groups: implement display order via drag-and-drop or numeric input, call `PUT` to persist order
- [ ] 6.6 Wire remove question from group button
- [ ] 6.7 Write Vitest tests for group detail component: question list renders, structured badge shown when applicable
