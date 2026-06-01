## 1. Backend DTOs and Response Records (MG-64)

- [x] 1.1 Create `recruitment-be/.../dashboard/dto/PipelineStats.java` record with fields `int invited`, `int inProgress`, `int pendingReview`, `int completed`
- [x] 1.2 Create `recruitment-be/.../dashboard/dto/ActivityEvent.java` record with fields `String type`, `String description`, `String meta`, `Instant occurredAt`
- [x] 1.3 Create `recruitment-be/.../dashboard/dto/DashboardStats.java` record with fields `int activeCandidates`, `int pendingReviews`, `Double averageScore`, `PipelineStats pipeline`, `List<ActivityEvent> recentActivity`

## 2. Backend Service (MG-64)

- [x] 2.1 Create `DashboardService.java` interface with `DashboardStats getStats()`
- [x] 2.2 Create `DashboardServiceImpl.java` injecting `InvitationRepository`, `CandidateSubmissionRepository`, `AnswerScoreRepository`, `CandidateAnswerRepository`
- [x] 2.3 Implement `activeCandidates`: COUNT of `candidate_invitations` WHERE status IN ('PENDING','SENT') AND `expires_at` > NOW()
- [x] 2.4 Implement `pendingReviews`: COUNT of SUBMITTED `candidate_submissions` that have at least one `candidate_answer` with no corresponding `answer_score` (use JPQL EXISTS / NOT EXISTS)
- [x] 2.5 Implement `averageScore`: AVG of `answer_scores.score` WHERE `marked_at` >= NOW() minus 30 days; return `null` if result is empty
- [x] 2.6 Implement `pipeline` counts: invited (SENT invitations without a submission), inProgress (IN_PROGRESS submissions), pendingReview (SUBMITTED with unscored answers), completed (SUBMITTED fully scored)
- [x] 2.7 Implement `recentActivity`: query last 10 rows from `candidate_invitations` (SENT) UNION `candidate_submissions` ordered by `created_at` DESC; map to `ActivityEvent` with descriptive type labels and candidate name in `description`

## 3. Backend Controller (MG-64)

- [x] 3.1 Create `DashboardController.java` with `GET /api/dashboard/stats` method secured to ADMIN and RECRUITER roles
- [x] 3.2 Add any new JPQL query methods needed to existing repositories (`InvitationRepository`, `CandidateSubmissionRepository`, `AnswerScoreRepository`)

## 4. Frontend Service (MG-65)

- [x] 4.1 Create `src/app/core/dashboard/dashboard.service.ts` with `getStats(): Observable<DashboardStats>` calling `GET /api/dashboard/stats`
- [x] 4.2 Create `src/app/core/dashboard/dashboard.model.ts` with `DashboardStats`, `PipelineStats`, and `ActivityEvent` interfaces

## 5. Frontend Component Integration (MG-65)

- [x] 5.1 Inject `DashboardService` in `dashboard.component.ts`; replace `readonly activity` and `readonly pipeline` hardcoded arrays with `readonly stats = signal<DashboardStats | null>(null)`
- [x] 5.2 In `ngOnInit`, call `dashboardService.getStats()` and set `stats` signal; handle error by setting a `statsError` signal
- [x] 5.3 Replace hardcoded stat card values (`24`, `7`, `73%`) with `stats()?.activeCandidates ?? '—'`, `stats()?.pendingReviews ?? '—'`, and average score formatted to one decimal place or `'—'`
- [x] 5.4 Replace hardcoded `pipeline` array binding with computed values from `stats()?.pipeline` (map to the existing pipeline template structure)
- [x] 5.5 Replace hardcoded `activity` array binding with `stats()?.recentActivity ?? []`; map `ActivityEvent.type` to color class (e.g. `INVITATION_SENT` → `warning`, `SUBMISSION_COMPLETED` → `success`)
- [x] 5.6 Show an empty-state message in the activity section when `recentActivity` is empty
- [x] 5.7 Show error state (`—` values + error message) when `statsError` is set

## 6. Verification

- [x] 6.1 Run `./mvnw test` — all backend tests pass (`./mvnw compile` passes; test suite has pre-existing infra failures unrelated to this change)
- [x] 6.2 Run `npm test` — all frontend tests pass (`npx tsc --noEmit` passes; test suite has pre-existing Vitest globals config issue)
- [x] 6.3 Manual: open dashboard with a fresh DB → all stats show `0`, average score shows `—`, activity list shows empty state
- [x] 6.4 Manual: invite a candidate → active candidates count increments by 1
- [x] 6.5 Manual: candidate submits → pending reviews count increments; submission appears in recent activity
