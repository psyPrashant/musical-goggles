## Context

Today, every candidate sitting the same assessment sees identical questions in a fixed order. Staff have no mechanism to introduce variance. The current `CandidateTakeServiceImpl.loadAssessment()` fetches all `AssessmentQuestion` rows ordered by `displayOrder` and returns them as-is. The `Assessment` entity has no randomisation fields.

## Goals / Non-Goals

**Goals:**
- Staff can enable randomisation and configure per-type quotas on an assessment.
- Each candidate receives a unique but structurally consistent random subset on first attempt start.
- The subset is snapshotted so that refreshing or resuming returns the same questions.
- Assessment preview surfaces the quota configuration so staff can verify before publishing.
- Existing assessments (`randomiseQuestions = false`) behave identically to today.

**Non-Goals:**
- Per-candidate manual overrides of the random selection.
- Randomising question *order* within the served subset (questions keep their relative `displayOrder`).
- Retrospective re-randomisation of an already-started attempt.

## Decisions

### 1. Snapshot table vs. in-memory re-randomisation

**Decision**: Snapshot the selected question IDs in a new `submission_question_snapshots` table on first load.

**Rationale**: Re-running the random draw on every request would give a different set each time and make marking, flag history, and results inconsistent. Persisting the selection once — keyed by submission — is the only safe approach.

**Alternative considered**: Storing a seeded random value on the submission and re-deriving the selection. Rejected because it couples the selection logic to a deterministic shuffle algorithm that must never change after deployment.

### 2. New entity `RandomisationQuota` vs. JSON column

**Decision**: New `RandomisationQuota` entity with its own table (`assessment_randomisation_quotas`).

**Rationale**: Keeps the schema relational and queryable; consistent with how `AssessmentQuestion` is modelled. JSON columns require DB-specific features and complicate validation.

### 3. Where to apply randomisation — service vs. repository

**Decision**: Apply randomisation logic in `CandidateTakeServiceImpl`, not in the repository query.

**Rationale**: Random sampling (`Collections.shuffle` + `subList`) is trivial in Java and keeps SQL simple. Pushing it to the DB (e.g. `ORDER BY RANDOM()`) would complicate the snapshot logic.

### 4. Quota UI placement in the builder

**Decision**: Add the randomisation toggle and quota inputs to **Step 3 (Settings)** of the assessment builder, not Step 1 or Step 2.

**Rationale**: The quota counts depend on how many questions of each type exist (Step 2), so the staff member needs to add questions first. Placing it in Step 3 (after question selection) gives the most natural flow and allows the UI to derive the max quota per type from the current question list.

## Risks / Trade-offs

- **Risk**: Staff sets a quota higher than the number of questions of that type available at the time a candidate starts.  
  **Mitigation**: Backend validates on start (`count ≤ available questions of that type`); return 400 with a clear message. Frontend enforces `max` on the number input.

- **Risk**: Flyway migration V21/V22 run in a live environment where assessments are in progress.  
  **Mitigation**: Both migrations are additive only (new column with DEFAULT, new tables). No data is altered. Safe for zero-downtime deploy.

- **Risk**: GROUP questions complicate per-type quota counting (a GROUP contains members of other types).  
  **Mitigation**: For quota purposes, treat a GROUP question as type `GROUP`. Staff must explicitly configure a quota for `GROUP` if they want groups randomised. Members of a drawn GROUP are always included in full.

## Migration Plan

1. `V21__add_assessment_randomisation.sql` — adds `randomise_questions` column and `assessment_randomisation_quotas` table.
2. `V22__add_submission_question_snapshot.sql` — adds `submission_question_snapshots` table.
3. Deploy backend — migrations auto-run via Flyway on startup.
4. Deploy frontend — new toggle and preview UI are feature-complete; no flag needed.
5. **Rollback**: Drop the two new tables and column. No existing data is touched by the migration, so rollback is safe.

## Open Questions

- None — all design decisions are resolved for this epic scope.
