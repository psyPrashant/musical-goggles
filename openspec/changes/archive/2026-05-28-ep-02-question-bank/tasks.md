## 1. Backend â€” Domain Model & Migrations (MG-19)

- [x] 1.1 Create base `Question` entity: `id`, `title`, `body`, `type` (enum: MCQ/TEXT/CODE_SUBMISSION), `createdBy`, `createdAt`, `updatedAt` â€” use JPA `@Inheritance(JOINED)`
- [x] 1.2 Create `McqQuestion` entity extending `Question` â€” maps to `mcq_questions` table
- [x] 1.3 Create `QuestionOption` entity: `id`, `mcqQuestionId`, `text`, `isCorrect`
- [x] 1.4 Create `TextQuestion` entity extending `Question` â€” maps to `text_questions` table (no extra columns needed)
- [x] 1.5 Create `CodeSubmissionQuestion` entity extending `Question` â€” maps to `code_submission_questions` table with optional `languageHint` column
- [x] 1.6 Write Flyway migration `V4__create_question_tables.sql` (base + 3 type tables + options table)
- [x] 1.7 Create `QuestionGroup` entity: `id`, `name`, `description`, `isStructured`
- [x] 1.8 Create `QuestionGroupItem` entity: `id`, `groupId`, `questionId`, `displayOrder` (nullable)
- [x] 1.9 Write Flyway migration `V5__create_question_groups.sql`
- [x] 1.10 Create `Tag` entity: `id`, `name` (unique, lowercase)
- [x] 1.11 Create `QuestionTag` join entity: `questionId`, `tagId`
- [x] 1.12 Write Flyway migration `V6__create_tags.sql`

## 2. Backend â€” Question CRUD API (MG-19)

- [x] 2.1 Create `QuestionRepository` (Spring Data JPA) with custom query for tag filter
- [x] 2.2 Create `QuestionService`: `create`, `findAll(filters)`, `findById`, `update`, `delete`
- [x] 2.3 Implement cascade delete: removing a question deletes its `QuestionGroupItem` records
- [x] 2.4 Create `QuestionController` with `POST`, `GET` (list + `?type=&?tag=`), `GET /{id}`, `PUT /{id}`, `DELETE /{id}`
- [x] 2.5 Annotate all endpoints with `@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")`
- [x] 2.6 Create request/response DTOs and `QuestionMapper` (entity â†” DTO)
- [x] 2.7 Add MCQ validation: must have â‰¥ 2 options and exactly 1 marked correct â€” return HTTP 400 otherwise
- [x] 2.8 Write integration tests: create MCQ/Text/Code questions; list with filters; update; delete with group cleanup

## 3. Backend â€” Question Groups API (MG-20, MG-21)

- [x] 3.1 Create `QuestionGroupRepository` and `QuestionGroupItemRepository`
- [x] 3.2 Create `QuestionGroupService`: `create`, `findAll`, `findById` (with questions), `update`, `delete`, `addQuestion`, `removeQuestion`
- [x] 3.3 Implement uniqueness check on group `name` â€” return HTTP 409 on duplicate
- [x] 3.4 Implement idempotent add: if question already in group, return 200 without creating duplicate
- [x] 3.5 Enforce `displayOrder` required when adding question to structured group â€” return HTTP 400 otherwise
- [x] 3.6 Create `QuestionGroupController` with full CRUD + `/questions` sub-resource endpoints
- [x] 3.7 Annotate all endpoints with `@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")`
- [x] 3.8 Write integration tests: create group; add/remove questions; structured ordering; idempotent add

## 4. Backend â€” Tags API (MG-22)

- [x] 4.1 Create `TagRepository` with `findByNameIgnoreCase` and `findAllInUse` (join to question_tags)
- [x] 4.2 Create `TagService`: `findOrCreate(name)` (normalises to lowercase), `listAllInUse`, `cleanupOrphans` (called on question delete)
- [x] 4.3 Create `TagController` with `GET /api/tags` returning alphabetically sorted in-use tags
- [x] 4.4 Wire tag normalisation into `QuestionService.create/update`
- [x] 4.5 Write integration tests: create question with tags; filter by tag; tag list; orphan cleanup on delete

## 5. Frontend â€” Question Bank UI (MG-19)

- [x] 5.1 Create `QuestionsComponent` (standalone) at `/questions` â€” paginated list with type icon, title, tags, and action buttons
- [x] 5.2 Add tag filter chip bar and type filter dropdown to the list view
- [x] 5.3 Create `QuestionFormComponent` (shared create/edit) with dynamic sections per type (MCQ options editor, code language input)
- [x] 5.4 Create route `/questions/new` (create) and `/questions/:id/edit` (edit) using `QuestionFormComponent`
- [x] 5.5 Implement MCQ options sub-form: add/remove options, mark one as correct
- [x] 5.6 Add tag autocomplete input (calls `GET /api/tags`)
- [x] 5.7 Wire up delete with a confirmation dialog
- [x] 5.8 Write Vitest unit tests for `QuestionFormComponent` validation (MCQ requires correct option)

## 6. Frontend â€” Question Groups UI (MG-20, MG-21)

- [x] 6.1 Create `QuestionGroupsComponent` at `/question-groups` â€” list with name, question count, structured badge
- [x] 6.2 Create `QuestionGroupDetailComponent` at `/question-groups/:id` â€” shows group questions with drag-to-reorder for structured groups
- [x] 6.3 Create group create/edit form (name, description, isStructured toggle)
- [x] 6.4 Implement "Add question to group" panel (searchable question picker)
- [x] 6.5 For structured groups: implement display order via drag-and-drop or numeric input, call `PUT` to persist order
- [x] 6.6 Wire remove question from group button
- [x] 6.7 Write Vitest tests for group detail component: question list renders, structured badge shown when applicable

