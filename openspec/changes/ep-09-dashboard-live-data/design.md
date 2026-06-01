## Context

`DashboardComponent` makes one real API call (`listAssessments()`) and hardcodes everything else. The platform already has `InvitationRepository`, `CandidateSubmissionRepository`, and `AnswerScoreRepository` with enough data to compute all four stat cards and the pipeline. No new domain tables are needed.

Current hardcoded values (to be replaced):
- Active Candidates: `24`
- Pending Reviews: `7`
- Average Score: `73%`
- `activity` array: 5 static strings
- `pipeline` array: `[4, 3, 7, 10]`

## Goals / Non-Goals

**Goals:**
- Single endpoint `GET /api/dashboard/stats` returning all dashboard data in one call
- Frontend replaces all hardcoded values with signal-driven live data
- Stats reflect the current DB state within one page load (no caching)

**Non-Goals:**
- Real-time push updates (WebSocket / SSE)
- Per-recruiter scoped stats (show all candidates for now)
- Historical trend charts
- Pagination of the activity feed

## Decisions

**Decision 1: Single aggregation endpoint rather than multiple fine-grained endpoints**

One `GET /api/dashboard/stats` call reduces FE complexity and latency. The dashboard is a read-only summary view; a single response with all data fits the use case. The backend assembles the response from multiple repository queries in one service method.

*Alternatives considered:* Separate endpoints per stat — more flexible but requires 4–6 parallel calls from the FE and more boilerplate.

**Decision 2: `averageScore` computed over last 30 days, null when no data**

A rolling 30-day window gives a meaningful "current performance" view rather than an all-time average skewed by old data. Returning `null` (not 0) when there are no scored answers lets the UI display "—" rather than a misleading zero.

*Alternatives considered:* All-time average — not representative of current performance. Last 7 days — too narrow for low-volume recruitment.

**Decision 3: Recent activity derived from existing tables, not a separate event log**

Joining the last 10 rows from `candidate_invitations` (status SENT) and `candidate_submissions` (status SUBMITTED or IN_PROGRESS), sorted by `created_at` desc, gives meaningful activity without adding an audit-log table.

*Alternatives considered:* Dedicated `activity_events` table — overkill for the current scale; the derived query is sufficient and has no migration overhead.

**Decision 4: Pipeline counts include in-progress submissions**

- **Invited**: PENDING/SENT invitations not yet started
- **In Progress**: `candidate_submissions` with status `IN_PROGRESS`
- **Pending Review**: SUBMITTED submissions with at least one unscored answer
- **Completed**: SUBMITTED submissions fully scored (all answers have an `answer_score`)

*Alternatives considered:* Count by invitation status only — misses the in-progress and review stages.

## Risks / Trade-offs

- **N+1 queries for "pending review" and "completed" counts:** Counting submissions with/without scores requires a JOIN. Mitigation: use a single JPQL COUNT query with EXISTS / NOT EXISTS subqueries to keep it to one DB round trip per stat.
- **Performance at scale:** Aggregation queries over large tables may be slow. Mitigation: add DB indexes on `candidate_submissions.status` and `answer_scores.candidate_answer_id` (already indexed via FK in V9 migration) if performance degrades in production.

## Migration Plan

1. Deploy backend (new controller + service + DTOs) — no DB changes.
2. Deploy frontend (`DashboardService` + component update) — backward compatible.
3. Verify: open dashboard with known DB state (e.g. 0 invitations) and confirm stats read `0`, not `24`.
