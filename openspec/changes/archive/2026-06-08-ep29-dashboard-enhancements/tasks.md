## 1. MG-150 Backend — Activity Event submissionId

- [x] 1.1 Add nullable `UUID submissionId` field to `ActivityEvent.java` record
- [x] 1.2 Update `DashboardServiceImpl.buildRecentActivity()` to pass `sub.getId()` for SUBMISSION_STARTED and SUBMISSION_COMPLETED events, `null` for INVITATION_SENT

## 2. MG-150 Frontend — Clickable Activity Items

- [x] 2.1 Add `submissionId?: string | null` to `ActivityEvent` interface in `dashboard.model.ts`
- [x] 2.2 Inject `Router` into `DashboardComponent`; add `navigateToResult(item: ActivityEvent)` method
- [x] 2.3 Wire `(click)` and conditional `cursor: pointer` style on activity items in the dashboard template

## 3. MG-150 Frontend — Results Page Deep-Link

- [x] 3.1 Inject `ActivatedRoute` into `ResultsComponent`
- [x] 3.2 After submissions load, read `snapshot.queryParamMap.get('submissionId')` and auto-select matching submission

## 4. MG-149 Backend — SubmissionSummaryResponse Enrichment

- [x] 4.1 Add `UUID assessmentId` and `String assessmentTitle` fields to `SubmissionSummaryResponse.java`
- [x] 4.2 Update `SubmissionServiceImpl.buildSummaries()` to batch-load assessment titles via `assessmentRepository.findAllById()` and populate the new fields
- [x] 4.3 Update `SubmissionServiceImpl.buildNotStartedSummaries()` likewise
- [x] 4.4 Add `listCompletedSubmissions()` method to `SubmissionServiceImpl` querying SUBMITTED and AUTO_SUBMITTED statuses
- [x] 4.5 Add `GET /api/submissions/completed` endpoint to `SubmissionController`

## 5. MG-149 Frontend — Completed Assessments Page

- [x] 5.1 Add `assessmentId: string` and `assessmentTitle: string` to `SubmissionSummary` interface in `marking.model.ts`
- [x] 5.2 Add `listCompletedSubmissions()` method to `MarkingService` calling `GET /api/submissions/completed`
- [x] 5.3 Create `features/completed-assessments/completed-assessments.component.ts` with signals, computed filtered list, assessment dropdown, pass/all toggle, and table
- [x] 5.4 Add `/completed-assessments` lazy route to `app.routes.ts`
- [x] 5.5 Add "Completed Assessments" nav link to `shell.component.ts` sidebar

## 6. MG-148 Frontend — Clickable Pipeline Cards

- [x] 6.1 Inject `MarkingService` into `DashboardComponent`; load all submissions on init into `submissions` signal
- [x] 6.2 Add `activePipelineStage = signal<string | null>(null)` and `togglePipeline(label)` method
- [x] 6.3 Add `pipelineCandidates` computed signal implementing the stage → submission filter mapping
- [x] 6.4 Update dashboard template: add `(click)` and active state to pipeline cards; add expandable candidate panel with "View Result" links
