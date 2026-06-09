## Why

Four interconnected bugs degrade staff usability around flagged submissions: resolved/dismissed flags vanish from the list, clicking a flag row silently misroutes due to a wrong query-param key, the assessment attempt page has no flag history panel, and clicking an attempt in candidate history triggers a full page reload instead of SPA navigation. All four must be fixed together as they share the same navigation path.

## What Changes

- **Flagged submissions list** retains RESOLVED and DISMISSED rows after action; status filter added (default: all statuses); resolve/dismiss handlers update status in-place instead of removing the row.
- **Flagged row click** passes the correct `submissionId` query param (was `submission`) so the results page auto-selects the submission.
- **Results / assessment attempt page** gains a Flag History section showing all flags for the selected submission (FLAGGED, RESOLVED, DISMISSED) with reason, status, date, raised-by, and resolution notes.
- **Candidate history modal** replaces the broken `[attr.href]` anchor with `router.navigate()` for SPA navigation to the results page.

## Capabilities

### New Capabilities
- `flag-history-on-result`: Flag History panel on the results/attempt page showing all flags per submission with full audit detail.

### Modified Capabilities
- `flagged-submissions-list`: Status filter added; resolved/dismissed rows retained after action.
- `flagged-attempt-navigation`: Correct `submissionId` query param used when navigating from flagged row click.
- `candidate-assessment-history`: Attempt click uses SPA router navigation instead of `href` anchor.

## Impact

- `recruitment-fe/src/app/features/flags/flagged-submissions.component.ts` — filtered() computed, resolve/dismiss handlers, viewResult()
- `recruitment-fe/src/app/features/results/results.component.ts` — new Flag History section, flag list loading per submission
- `recruitment-fe/src/app/features/candidates/candidates.component.ts` — history row click handler
- `recruitment-fe/src/app/core/flag/flag.service.ts` — getFlagsForSubmission() if needed
- `recruitment-fe/src/app/core/flag/flag.model.ts` — FlagListItem may need resolutionNotes
- No backend changes required (existing endpoints cover all data needs)
