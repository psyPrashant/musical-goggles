## Why

New developers joining the project start with a completely empty database — no questions, no assessments, and only a bare admin user. This makes it impossible to explore the platform's core flow (build assessment → invite candidate → take → mark) without manually creating test data first. A Flyway seed migration running automatically at startup removes that friction entirely.

## What Changes

- Add `V11__seed_dev_data.sql` — an idempotent Flyway migration that populates a diverse question bank (MCQ, TEXT, CODE_SUBMISSION, and GROUP), relevant tags, and three sample assessments ready for immediate use.
- The migration runs automatically via Flyway when the backend starts; no extra steps required on any developer machine.
- `DevDataSeeder` continues to set the admin password at runtime; V11 only inserts the user row with a deterministic UUID so `created_by` FK constraints are satisfied before the seeder runs.

## Capabilities

### New Capabilities

- `dev-seed-data`: A repeatable, idempotent dev dataset — 19 questions across four types, 6 tags, and 3 sample assessments — seeded by Flyway V11.

### Modified Capabilities

_(none — this is a purely additive data migration with no behavioural change)_

## Impact

**Backend — new file:**
- `recruitment-be/src/main/resources/db/migration/V11__seed_dev_data.sql`

**No code changes.** No frontend changes. No existing migration modified.
