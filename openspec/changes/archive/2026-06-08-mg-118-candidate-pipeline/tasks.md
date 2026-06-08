## 1. Template Restructure

- [x] 1.1 Remove the `<div class="stat-row">` block (all 4 stat cards) from `dashboard.component.ts`
- [x] 1.2 Move the Candidate Pipeline `<div class="card no-pad">` block to be the first child of `<div class="content">`, before the mid-grid

## 2. Component Cleanup

- [x] 2.1 Delete the `avgScoreDisplay` computed property (no longer has consumers after stat cards are removed)

## 3. Test Updates

- [x] 3.1 Remove any assertions in `dashboard.component.spec.ts` that query for stat card labels or values (Total Assessments, Active Candidates, Pending Reviews, Average Score)
- [x] 3.2 Verify pipeline-related test assertions still pass in the new layout position
- [x] 3.3 Run `npm test` in `recruitment-fe/` and confirm all dashboard tests pass

## 4. Verification

- [x] 4.1 Start the dev server (`npm start`) and confirm the pipeline appears directly below the page header
- [x] 4.2 Confirm the summary stat cards are absent from the dashboard
- [x] 4.3 Confirm the Recent Assessments and Recent Activity grid renders below the pipeline
