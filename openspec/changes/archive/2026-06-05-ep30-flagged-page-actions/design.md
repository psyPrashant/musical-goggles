## Context

The flagged submissions page (`flagged-submissions.component.ts`) is a recruiter/admin-facing list of flagged candidate submissions. Currently it supports filters, a "Dismiss" button, and row-click navigation to the results page. The row-click navigation is broken due to a query-param key mismatch between the flagged page (`submission`) and the results component (`submissionId`). Three new workflow actions are needed: Contact Candidate, Blacklist, and Resolve Flag. The `Candidate` entity currently has no `blacklisted` or `actionRequired` fields.

## Goals / Non-Goals

**Goals:**
- Fix the navigation bug so clicking a flagged row opens the correct submission in results.
- Add an actions dropdown replacing the bare "Dismiss" button.
- Implement Contact Candidate: email via Spring Mail + set `actionRequired` flag.
- Implement Blacklist: role-restricted toggle with `blacklisted` field on Candidate.
- Implement Resolve Flag: inline notes form → RESOLVED transition.
- Extend `FlagListItem` / `FlagListItemResponse` with `candidateId`, `candidateBlacklisted`, `candidateActionRequired`.

**Non-Goals:**
- Removing from blacklist via a separate approval workflow UI (admin can unblacklist but there is no pending-approval queue).
- Email templates stored in the database.
- Pagination or batch actions on the flagged list.

## Decisions

### 1. Fix navigation in results.component.ts, not flagged-submissions.component.ts
The existing spec (`flagged-attempt-navigation/spec.md`) specifies `?submission=` as the canonical param name, and the flagged page already implements it correctly. The bug is in `results.component.ts` which reads `submissionId`. Fix the consumer to match the spec.

*Alternative*: Update both files and the spec to use `submissionId`. Rejected — more blast radius, no benefit.

### 2. Actions dropdown is inline (no separate component file)
The dropdown is implemented directly inside `flagged-submissions.component.ts` using Angular's `@if`/signals pattern, consistent with the existing codebase style (all features use inline templates). No separate `actions-dropdown.component.ts`.

*Alternative*: Extract to a separate component. Rejected — adds file overhead without benefit at this scale.

### 3. Blacklist un-blacklist is role-checked server-side
`PATCH /api/candidates/{id}/blacklist` accepts `{ blacklisted: boolean }`. When `blacklisted: false`, the endpoint checks `hasRole('ADMIN')` via Spring Security `@PreAuthorize`. Recruiters receive 403 if they try to un-blacklist.

### 4. Contact Candidate sends email synchronously
The contact endpoint calls `JavaMailSender.send()` directly (same pattern as invitation emails). No async queue. If mail fails, the endpoint returns 500 and the frontend shows an error without setting `actionRequired`.

### 5. FlagListItem enriched at query time
`FlagListItemResponse` adds `candidateId`, `candidateBlacklisted`, `candidateActionRequired` fields. The JPQL query in `SubmissionFlagServiceImpl` is extended with a JOIN on `Candidate`. No new API endpoint needed.

### 6. DB migration adds two nullable-with-default columns
`action_required BOOLEAN NOT NULL DEFAULT false` and `blacklisted BOOLEAN NOT NULL DEFAULT false` on `candidates`. Flyway migration V{next}__add_candidate_flags.sql.

## Risks / Trade-offs

- **Email delivery failure hides action** → Mitigation: frontend shows error toast; `actionRequired` is only set after successful email send (server-side, in a single transaction-like flow).
- **Two-step flag transition for Resolve** → same pattern as Dismiss, tested; no new risk.
- **Role check on unblacklist** → If auth context is unavailable in tests, mock `hasRole`. Use `@WithMockUser(roles="RECRUITER")` in BE tests.

## Migration Plan

1. Apply Flyway migration (auto-applied on Spring Boot start).
2. Deploy backend — new endpoints, enriched FlagListItem.
3. Deploy frontend — fixes navigation bug, adds dropdown.
4. No rollback complexity; new columns have defaults, old clients unaffected.

## Open Questions

- None — all decisions resolved above.
