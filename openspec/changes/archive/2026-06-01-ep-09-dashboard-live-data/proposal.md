## Why

The dashboard displays four hardcoded stats (active candidates: 24, pending reviews: 7, average score: 73%, and a static pipeline with totals of 24) and a hardcoded recent-activity list. This creates a false impression of platform activity and makes the dashboard useless as an operational view. All data needed to populate these stats accurately already exists in the database.

## What Changes

- Add `GET /api/dashboard/stats` endpoint returning live aggregated stats: active candidates, pending reviews, average score, pipeline stage counts, and recent activity events.
- Replace all hardcoded values in `DashboardComponent` with signals wired to the new endpoint.
- Add a `DashboardService` in the frontend core layer.

## Capabilities

### New Capabilities

- `dashboard-stats`: Backend aggregation endpoint and frontend integration providing live dashboard statistics — active candidates, pending reviews, average score, candidate pipeline, and recent activity.

### Modified Capabilities

_(none — DashboardComponent currently has no testable API contract)_

## Impact

**Backend**
- New: `recruitment-be/.../dashboard/DashboardController.java`
- New: `recruitment-be/.../dashboard/DashboardService.java` + `DashboardServiceImpl.java`
- New: `recruitment-be/.../dashboard/dto/DashboardStats.java`, `PipelineStats.java`, `ActivityEvent.java`
- Touches existing repositories: `InvitationRepository`, `CandidateSubmissionRepository`, `AnswerScoreRepository`

**Frontend**
- New: `recruitment-fe/src/app/core/dashboard/dashboard.service.ts`
- Modified: `recruitment-fe/src/app/features/dashboard/dashboard.component.ts`
