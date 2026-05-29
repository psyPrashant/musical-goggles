## Context

The Question Bank must support three structurally different question types in a single `questions` table (discriminator pattern) or separate tables (table-per-type). Groups add a many-to-many relationship between questions and collections, with optional ordering. Tags are a lightweight, free-form categorisation system. All data access is role-gated (Admin or Recruiter only). The Angular frontend needs list, filter, and form views.

## Goals / Non-Goals

**Goals:**
- Polymorphic question model covering MCQ (with options), Text, and Code Submission
- Question Group as a named, reusable container with optional display ordering
- Free-form tagging with server-side filter-by-tag support
- Full CRUD REST API for each entity
- Angular UI for the question bank (list, create/edit, group management, tag filter)

**Non-Goals:**
- Rich text or media in question bodies — plain text only for Sprint 1
- Question versioning or audit history
- AI-assisted question generation
- Bulk import of questions
- Nested or hierarchical groups (flat groups only)

## Decisions

### 1 — Single table per question type (table-per-concrete-class) over a single polymorphic `questions` table
Each question type has a distinct structure. MCQ needs an `options` collection; Code Submission may need a `language` hint; Text has no extra fields. Using three separate tables (`mcq_questions`, `text_questions`, `code_submission_questions`) keeps each table simple and avoids nullable columns.

A base `questions` table holds shared fields (`id`, `title`, `body`, `created_by`, `created_at`, `updated_at`, `type_discriminator`). Each type table has a FK to `questions.id`.

Alternative considered: Single `questions` table with nullable columns per type — rejected because MCQ options require a child table regardless, so the complexity saving is minimal.

Alternative considered: JPA `@Inheritance(strategy = JOINED)` — this IS the table-per-concrete-class approach; use this in the JPA mapping.

### 2 — Question Groups use a join table with explicit `display_order`
`question_group_items(group_id, question_id, display_order)` handles the many-to-many with ordering in one table. `display_order` is `NULL` for unordered groups (MG-20) and a non-null integer for structured groups (MG-21). The frontend sends `display_order` when adding questions to a structured group.

### 3 — Tags as a normalised `tags` table with `question_tags` join table
Tags are stored normalised to avoid string duplication and allow efficient filter queries. The API supports filtering: `GET /api/questions?tag=Java`. The frontend provides a tag chip/autocomplete input.

Tag names are case-insensitive and stored lowercase. Creating a question with a new tag creates the tag record automatically.

### 4 — REST API design
```
POST   /api/questions                    → create question
GET    /api/questions                    → list (supports ?tag=, ?type=, ?groupId=)
GET    /api/questions/{id}              → get one
PUT    /api/questions/{id}              → update
DELETE /api/questions/{id}              → delete

POST   /api/question-groups             → create group
GET    /api/question-groups             → list groups
GET    /api/question-groups/{id}        → get group with questions
PUT    /api/question-groups/{id}        → update group metadata
DELETE /api/question-groups/{id}        → delete group
POST   /api/question-groups/{id}/questions  → add question to group (with optional display_order)
DELETE /api/question-groups/{id}/questions/{questionId}  → remove question from group

GET    /api/tags                        → list all tags (for autocomplete)
```

All endpoints require `ADMIN` or `RECRUITER` role.

### 5 — Angular question form is a single component with dynamic sections per type
A shared `QuestionFormComponent` renders common fields (title, body, tags) and conditionally renders type-specific sections (MCQ options editor, code language selector) based on a `type` form control. This avoids three separate form components with duplicated validation.

## Risks / Trade-offs

- **Polymorphic JPA complexity**: `@Inheritance(JOINED)` can produce awkward queries. Mitigation: keep the base entity light; use projections in list queries to avoid joining all type tables unnecessarily.
- **Display order consistency**: Allowing gaps in `display_order` integers (e.g., 10, 20, 30) avoids reordering all records when inserting between items. Mitigation: document the "gap" convention in the design and enforce it in the service layer.
- **Tag proliferation**: Free-form tags can become noisy (e.g., "Java", "java", "JAVA"). Mitigation: normalize to lowercase on write.
