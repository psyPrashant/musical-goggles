## Context

The backend uses Flyway for schema migrations and a Spring `ApplicationRunner` (`DevDataSeeder`, `@Profile("dev")`) to seed the admin user at startup. Flyway runs **before** application runners, meaning V11 executes before the admin user exists. All `questions.created_by` and `assessments.created_by` columns are `NOT NULL` FKs to `users.id`.

V10 (GROUP question type) is already merged to main. The `questions` table accepts `type IN ('MCQ', 'TEXT', 'CODE_SUBMISSION', 'GROUP')`, the `group_questions` sub-table exists, and `group_question_members` is available.

The business rule in `AssessmentServiceImpl` limits each assessment to at most one top-level `CODE_SUBMISSION` question. V11 bypasses the Java layer (direct SQL INSERT), so the migration itself must enforce this limit by design.

## Goals / Non-Goals

**Goals:**
- Seed 19 questions, 6 tags, and 3 assessments on every clean `docker compose up`
- Work on all developer machines with no manual steps
- Be fully idempotent — restarting the app must not produce duplicate-key errors

**Non-Goals:**
- Seeding candidate, invitation, submission, or marking data
- Providing production-ready data (this is explicitly a dev-only dataset)
- Handling multi-tenant or role-specific visibility rules

## Decisions

**Decision 1: Deterministic admin user UUID inserted by V11**

`DevDataSeeder` calls `userRepository.save(admin)` which auto-generates the UUID. Since it runs after Flyway, V11 cannot rely on the seeder having already run.

Fix: V11 inserts `('00000000-0000-0000-0000-000000000001', 'admin@recruitment.dev', 'ADMIN')` with `ON CONFLICT (id) DO NOTHING`. DevDataSeeder uses `findByEmail` — when it finds the row it skips creation, preserving the BCrypt password hash from its own encode step. The seeder then updates the row's password_hash when it first runs.

*Alternative considered*: A subquery `(SELECT id FROM users WHERE email = '...')` — rejected because V11 would fail on a truly empty DB if no user exists yet.

**Decision 2: All UUIDs are hard-coded (v4 format, deterministic)**

Every question, option, tag, assessment, and assessment_question row uses a hand-crafted UUID in the `00aaaaaa-...` namespace. Combined with `ON CONFLICT (id) DO NOTHING`, this guarantees idempotency across re-runs.

*Alternative considered*: `gen_random_uuid()` — rejected because non-deterministic UUIDs make the migration non-idempotent.

**Decision 3: GROUP questions reuse members from the MCQ/TEXT/CODE pools**

Rather than creating extra "throwaway" questions only for group membership, the group members are drawn from the main pool of seeded questions (MCQ q3, TEXT q1, MCQ q6, CODE q1). This keeps the total question count at 19 and avoids bloat.

**Decision 4: No `question_tags` for GROUP questions themselves**

GROUP questions act as scenario wrappers; tagging their sub-questions is sufficient for filtering. Avoids over-tagging.

## Risks / Trade-offs

- **UUID collisions with real data**: Using a reserved `00...0001` UUID for the admin user is safe in dev but would clash if someone creates a real user with that ID in prod. Mitigation: The seed migration only runs in dev profile (it's in the `db/migration` folder, but the data is dev-only by convention; if prod isolation is needed, a separate Flyway location can be configured).
- **Assessment composition is hand-crafted**: The `display_order` values and question assignments are fixed; adding more seed questions later requires manually updating `assessment_questions`. Acceptable trade-off for a seed file.

## Migration Plan

1. Add `V11__seed_dev_data.sql` to `recruitment-be/src/main/resources/db/migration/`
2. Rebuild Docker images: `docker compose build backend`
3. Start fresh: `docker compose down -v && docker compose up -d`
4. Verify: log in, open Question Bank (19 questions), Assessments (3 entries)
5. Restart without `-v` → no errors (idempotency check)
