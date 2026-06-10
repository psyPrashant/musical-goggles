## 1. Fix Completed Page Navigation

- [ ] 1.1 In `CompletedAssessmentsComponent.viewResult()`, change query param from `submissionId` to `submission`
- [ ] 1.2 Also pass `assessmentId: s.assessmentId` in the same `navigate()` call

## 2. Fix Results Page Query Param Handling

- [ ] 2.1 In `ResultsComponent.ngOnInit()`, read `assessmentId` query param and call `assessmentFilter.set()` before the subscription resolves
- [ ] 2.2 Confirm that the existing `submission` param read already works (it does — just verify no regression)

## 3. Verify

- [ ] 3.1 Check `SubmissionSummary` model includes `assessmentId` field (already present — confirm)
- [ ] 3.2 Manual smoke test: click a row on Completed page → Results page opens with correct submission selected and assessment filter set
