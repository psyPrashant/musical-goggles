## 1. Backend — DTO Changes (MG-116, MG-117)

- [x] 1.1 Add `maxScore: int` and `answeredCount: int` to `ResultSummaryResponse` record
- [x] 1.2 Add `totalScore: int` and `maxScore: int` to `SubmissionSummaryResponse` record

## 2. Backend — Repository (MG-115)

- [x] 2.1 Add `countGroupByAssessmentId` JPQL query to `AssessmentQuestionRepository`

## 3. Backend — Service (MG-115, MG-116, MG-117)

- [x] 3.1 Update `getResult()` in `SubmissionServiceImpl` — track `answeredCount` in loop, pass `aqList.size()` as `maxScore` and `answeredCount` to constructor
- [x] 3.2 Update `buildSummaries()` — batch-load question counts per assessment; sum scores per submission; pass `totalScore` and `maxScore` to `SubmissionSummaryResponse` constructor
- [x] 3.3 Update `buildNotStartedSummaries()` — pass `totalScore=0`, `maxScore=0`

## 4. Frontend — Model (MG-115, MG-116, MG-117)

- [x] 4.1 Add `maxScore: number` and `answeredCount: number` to `ResultSummary` interface
- [x] 4.2 Add `totalScore: number` and `maxScore: number` to `SubmissionSummary` interface

## 5. Frontend — Results Component (MG-116)

- [x] 5.1 Update detail header score display: change `{{ result()!.totalScore }}` / `pts` to `{{ result()!.totalScore }}/{{ result()!.maxScore }}`

## 6. Frontend — Results Component (MG-117)

- [x] 6.1 Add `answered-stat` element showing `{{ result()!.answeredCount }}/{{ result()!.maxScore }} answered` below the marking badge
- [x] 6.2 Add `.answered-stat` CSS style

## 7. Frontend — Results Component (MG-115)

- [x] 7.1 Add `sub-score` span to list item showing percentage via `scorePercent(s)` helper
- [x] 7.2 Add `scorePercent(s: SubmissionSummary): string` method — returns `—` when `maxScore <= 0` or `markedCount < totalAnswers`; otherwise `Math.round(totalScore / maxScore * 100) + '%'`
- [x] 7.3 Add `.sub-score` CSS style
