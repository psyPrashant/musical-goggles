## Context

Four bugs share the same navigation path: flagged submissions → results/attempt page. The flagged submissions list actively removes rows after resolve/dismiss (client-side filter + signal mutation), a wrong query-param key (`submission` sent, `submissionId` expected) silently breaks auto-selection on the results page, the results page has no flag history section, and the candidate history modal uses a plain `href` anchor causing full page reloads in the Angular SPA.

All changes are frontend-only. All required backend endpoints already exist.

## Goals / Non-Goals

**Goals:**
- Retain RESOLVED/DISMISSED flags in the flagged submissions list with correct status badges
- Add a status filter dropdown to the flagged page (default: all statuses)
- Fix the query-param mismatch so navigating from a flagged row auto-selects the submission
- Add a Flag History panel to the results/attempt detail panel showing all flags per submission
- Fix candidate history click-through to use `router.navigate()` instead of `href`

**Non-Goals:**
- Backend changes (all endpoints already exist)
- Pagination of the flags list
- Changes to the flag audit trail section already present on the results page

## Decisions

### MG-174 — retain flags after status transition
**Decision:** In `submitResolve` and `dismissFlag`, replace `flags.update(list => list.filter(...))` with `flags.update(list => list.map(...))` updating the item's status in-place. Remove the `f.status !== 'FLAGGED' && f.status !== 'UNDER_REVIEW'` guard from the `filtered()` computed. Add a `filterStatus` signal and a status `<select>` in the filter row.

**Alternative considered:** Re-fetch the full list from the API after each action. Rejected — creates unnecessary network round-trips and flicker; local signal mutation is sufficient.

### MG-175 — query-param key mismatch
**Decision:** Fix the results component (`ngOnInit`) to read the `submission` query param (not `submissionId`). The existing spec for `flagged-attempt-navigation` already mandates `?submission=`, and both senders (flagged-submissions component and candidate history) use `submission`. Changing the reader is less disruptive than changing all senders.

**Alternative:** Change senders to use `submissionId`. Rejected — requires touching two components and contradicts the existing spec.

### MG-176 — flag history panel on results page
**Decision:** After `selectSubmission()` loads the result detail, call `flagSvc.getCandidateFlags(candidateId)` filtered by `submissionId`, or call `flagSvc.getAuditTrail()` per flag. Use `getCandidateFlags(candidateId)` — it returns all flags for the candidate and we filter client-side by `submissionId`. Display in a collapsible section at the bottom of the detail panel.

**Alternative:** `GET /api/flags?submissionId=...` — this endpoint does not currently accept `submissionId` as a filter. Rejected for now; `getCandidateFlags()` covers the requirement without BE changes.

### MG-177 — SPA navigation from candidate history
**Decision:** Replace `[attr.href]="'/results?submission=' + entry.submissionId"` with a `(click)` handler calling `router.navigate(['/results'], { queryParams: { submission: entry.submissionId } })`. Inject `Router` into `CandidatesComponent`.

**Alternative:** Use `[routerLink]` and `[queryParams]` on the anchor. Valid, but the element is a `<div>`, not an `<a>`, so `(click)` with router.navigate is cleaner and consistent with other navigation patterns in the codebase.

## Risks / Trade-offs

- **Flag history performance:** `getCandidateFlags()` returns all flags for a candidate; a candidate with many flags across many assessments will return unnecessary data. Mitigation: filter client-side by `submissionId`; acceptable given current data volume. A dedicated `GET /api/submissions/{id}/flags` endpoint would be cleaner long-term.
- **Flagged list grows unbounded:** With RESOLVED/DISMISSED rows now visible, the list will grow over time. Mitigation: status filter lets staff hide resolved entries. Pagination is out of scope.
- **Query-param key change:** Any bookmark or external link using `?submissionId=` will stop auto-selecting. Mitigation: acceptable — this was a bug, not a documented interface.
