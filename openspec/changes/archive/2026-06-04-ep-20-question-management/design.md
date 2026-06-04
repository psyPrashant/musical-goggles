## Context

The codebase has two independent changes. The code-question limit was introduced in EP-10 as a safeguard and is now explicitly being lifted. Difficulty tagging is a new additive feature — no existing data needs migrating since all existing questions will default to `null` (no difficulty set).

## Goals / Non-Goals

**Goals**
- Remove the one-CODE_SUBMISSION-per-assessment limit end-to-end (backend guard + any frontend error messaging tied to the 422).
- Add an optional `difficulty` enum (EASY / MEDIUM / HARD) to all question types.
- Display difficulty as a badge in the question bank list.
- Include difficulty in API request/response shapes.

**Non-Goals**
- Filtering the question bank or assessment builder by difficulty (future work).
- Making difficulty mandatory (it remains optional).
- Backfilling difficulty on existing questions.

## Decisions

### 1. Difficulty as a dedicated column, not a tag

**Decision**: Add a `difficulty` VARCHAR column to the `questions` table rather than using the existing free-form tag system.

**Rationale**: Difficulty is a bounded, first-class concept (exactly three values) that should be typed and validated at the DB level. Free-form tags are intended for domain labels like "Java" or "Algorithms". Mixing them would make filtering ambiguous.

**Alternative considered**: Reserve a special `difficulty:easy` tag convention — rejected because it bypasses DB constraints and complicates queries.

### 2. Nullable column — no default

**Decision**: `difficulty` is nullable; existing and new questions may omit it.

**Rationale**: Forcing a default (e.g., MEDIUM) would misrepresent unclassified questions. Staff can set it when they know the difficulty.

### 3. Remove guard entirely (not raise limit)

**Decision**: Delete the `countCodeSubmissionInAssessment` guard and its repository method rather than changing the threshold.

**Rationale**: The product decision is that there should be no limit. Raising to 2 or 5 would require a future change again. Clean removal is simpler and aligns with the stated requirement.

## Risks / Trade-offs

- **Risk**: Assessments with many code questions may be hard to complete in time-limited sessions.
  → **Mitigation**: This is a recruiter responsibility; the system enforces no cap.
- **Risk**: Nullable difficulty means the badge is conditionally rendered — component must handle null gracefully.
  → **Mitigation**: Simply omit the badge when difficulty is null; no placeholder needed.

## Migration Plan

1. Add Flyway migration `V15__add_difficulty_to_questions.sql` with `ALTER TABLE questions ADD COLUMN difficulty VARCHAR(10) CHECK (difficulty IN ('EASY','MEDIUM','HARD'))`.
2. Deploy backend — existing rows unaffected (column is nullable, no migration of data needed).
3. Deploy frontend — difficulty selector shown in form; badge shown on cards where set.
4. **Rollback**: Drop column (no data loss since feature is additive).

## Open Questions

None — the scope is well-defined by the two Jira issues.
