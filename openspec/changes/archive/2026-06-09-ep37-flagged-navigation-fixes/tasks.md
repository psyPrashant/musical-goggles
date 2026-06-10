## 1. MG-174 — Retain resolved/dismissed flags in the list

- [ ] 1.1 Add `filterStatus` signal (`FlagStatus | ''`) to `FlaggedSubmissionsComponent`
- [ ] 1.2 Add status filter `<select>` to the filter row (All / Flagged / Under Review / Resolved / Dismissed)
- [ ] 1.3 Remove the `f.status !== 'FLAGGED' && f.status !== 'UNDER_REVIEW'` guard from the `filtered()` computed — replace with `filterStatus`-based filter
- [ ] 1.4 In `submitResolve` success handler: replace `flags.update(list => list.filter(...))` with `flags.update(list => list.map(...))` setting `status: 'RESOLVED'` in-place
- [ ] 1.5 In `dismissFlag` success handler: replace filter-out with map-update setting `status: 'DISMISSED'` in-place
- [ ] 1.6 Verify status badge styles for RESOLVED and DISMISSED are present and readable

## 2. MG-175 — Fix query-param key mismatch

- [ ] 2.1 In `results.component.ts` `ngOnInit`, change `queryParamMap.get('submissionId')` to `queryParamMap.get('submission')`
- [ ] 2.2 Confirm `viewResult()` in `flagged-submissions.component.ts` still passes `{ submission: flag.submissionId }` (no change needed if already correct)

## 3. MG-176 — Flag History panel on the results page

- [ ] 3.1 Add `submissionFlags` signal (`FlagListItem[]`) to `ResultsComponent`
- [ ] 3.2 In `selectSubmission()`, after loading the result detail, call `flagSvc.getCandidateFlags(candidateId)` and filter client-side by `submissionId`, storing into `submissionFlags`
- [ ] 3.3 Add Flag History section to the detail panel template below the existing audit trail, listing each flag with: reason label, status badge, date raised, raised-by, and resolution notes
- [ ] 3.4 Show "No flags raised" when `submissionFlags()` is empty
- [ ] 3.5 Clear `submissionFlags` signal when a new submission is selected to avoid stale data

## 4. MG-177 — SPA navigation from candidate history

- [ ] 4.1 Inject `Router` into `CandidatesComponent`
- [ ] 4.2 Replace `[attr.href]="'/results?submission=' + entry.submissionId"` anchor with a `(click)` handler calling `router.navigate(['/results'], { queryParams: { submission: entry.submissionId } })`
- [ ] 4.3 Ensure the history modal closes (or stays open) appropriately after navigation — close it before navigating

## 5. Tests & verification

- [ ] 5.1 Update `flagged-submissions.component.spec.ts` — verify resolved/dismissed flags remain in the list after action
- [ ] 5.2 Update `flagged-submissions.component.spec.ts` — verify status filter correctly shows/hides rows
- [ ] 5.3 Update `candidates.component.spec.ts` — verify history row click calls `router.navigate` with correct params
- [ ] 5.4 Run `npm test` and confirm all tests pass
