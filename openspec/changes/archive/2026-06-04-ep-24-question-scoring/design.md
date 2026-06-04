## Context

Questions currently carry no point-value metadata. The `Question` base entity has no score field, so `SubmissionServiceImpl` uses `COUNT(questions)` as the denominator when building score fractions and percentages. This means a 5-minute MCQ and a 90-minute coding challenge contribute equally to the total. EP-24 adds a `maxScore` field to the `Question` entity, surfaces it in the authoring UI, and propagates it through marking and results so the denominator is `SUM(question.maxScore)` instead of a raw count.

## Goals / Non-Goals

**Goals:**
- Staff can specify the point value of each question when creating or editing it (any type)
- `maxScore` defaults to 1 so every existing question and assessment is unaffected after migration
- MCQ auto-marking awards the question's `maxScore` for a correct answer instead of a fixed 1
- `ResultSummaryResponse.maxScore` and `SubmissionSummaryResponse.maxScore` use the weighted sum
- Candidate sees each question's point value during their assessment attempt

**Non-Goals:**
- Partial credit for MCQ (a correct MCQ still awards full `maxScore`; partial scoring is out of scope)
- Per-assessment override of question scores (the value lives on the question, not the join table)
- Changing the `manual-marking` API — staff already enter any integer score; only the displayed denominator changes

## Decisions

### 1. Field on `Question` base class, not `AssessmentQuestion` join table
**Decision:** Add `maxScore` to `Question`.

**Why:** A question's point value is an inherent property of the question, not a per-assessment override. Storing it on the join table would allow different weights per assessment but adds significant complexity for little benefit at this stage. The simpler model is correct for the current requirement.

**Alternative considered:** `AssessmentQuestion.maxScore` — rejected because it would require the authoring form to know which assessment the question is being added to, and the candidate payload would need to read the join table rather than the question directly.

### 2. Default value of 1, `NOT NULL`
**Decision:** `ALTER TABLE questions ADD COLUMN max_score INT NOT NULL DEFAULT 1`

**Why:** All existing questions are implicitly worth 1 point under the current count-based system. Setting the default to 1 makes the migration a no-op for all historical data. Making it `NOT NULL` keeps the domain simple.

### 3. `SUM(question.maxScore)` via JPQL in `AssessmentQuestionRepository`
**Decision:** Replace the `countGroupByAssessmentId` query with a new `sumMaxScoreGroupByAssessmentId` query.

**Current query (to remove):**
```java
@Query("SELECT aq.assessment.id, COUNT(aq) FROM AssessmentQuestion aq WHERE aq.assessment.id IN :ids GROUP BY aq.assessment.id")
List<Object[]> countGroupByAssessmentId(@Param("ids") Collection<UUID> ids);
```

**New query:**
```java
@Query("SELECT aq.assessment.id, SUM(aq.question.maxScore) FROM AssessmentQuestion aq WHERE aq.assessment.id IN :ids GROUP BY aq.assessment.id")
List<Object[]> sumMaxScoreGroupByAssessmentId(@Param("ids") Collection<UUID> ids);
```

**Why:** Keeping it as a single batch query avoids N+1. The JPQL navigates `aq.question.maxScore` which is valid via the `@ManyToOne Question question` on `AssessmentQuestion`.

### 4. MCQ auto-marking awards `question.maxScore`
**Decision:** Change `AnswerScore` creation in the auto-marker from `score: 1` (correct) to `score: question.maxScore`.

**Why:** If a question is worth 5 points, a correct MCQ should yield 5 points. This is the natural semantic. An incorrect MCQ still scores 0.

### 5. Candidate attempt payload includes `maxScore`
**Decision:** Include `maxScore` in whatever DTO the attempt endpoint returns per question.

**Why:** The candidate UI needs the value to render the point badge. No security concern — candidates may know a question's point value.

## Risks / Trade-offs

- **Score inflation on existing data**: Any existing assessment where a question is later edited to `maxScore > 1` will appear to have a lower historical percentage for old submissions. This is acceptable: the feature is additive and opt-in via explicit edits.
- **MCQ score change**: If a question previously had `maxScore = 1` and is bumped to `maxScore = 5`, any previously auto-marked submissions will still have `AnswerScore.score = 1` (written at submission time). This is correct historical data — it was worth 1 pt when answered. No re-scoring of old submissions is needed.
- **Unused `countGroupByAssessmentId` method**: The existing method will be deleted, not just replaced, to avoid confusion. No callers outside `buildSummaries()`.

## Migration Plan

1. Add Flyway migration: `ALTER TABLE questions ADD COLUMN max_score INT NOT NULL DEFAULT 1`
2. All existing questions get `max_score = 1` automatically — no data backfill required
3. Deploy backend: the new field is returned in `QuestionResponse`; old frontends ignore unknown fields
4. Deploy frontend: Points input appears on the question form with default 1

**Rollback:** Drop the `max_score` column and revert to the count-based queries. Existing `AnswerScore` records are unaffected.

## Open Questions

- Should `maxScore` be shown on the question list/card for staff? (Proposed: yes, small badge — same style as type/tag chips)
- Should the questions-answered stat (`X/Y answered`) in result detail keep Y = question count or change to sum(maxScore)? (Proposed: keep as question count — "answered" refers to number of questions, not points)
