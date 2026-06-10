## Why

Five related improvements tighten the flagged-candidate workflow: recruiters need to be blocked from inviting flagged candidates, flag and blacklist state needs to surface in candidate history and the results list, the flagged page should show one row per assessment (not per flag event), and results-panel tags overflow their container. All changes build on the flag infrastructure already in place from EP-30 and EP-37.

## What Changes

- **Invite blocking for flagged candidates** — invite modal checks candidate flag state and shows a contextual warning ("flagged" or "awaiting response") and disables submission.
- **Action Required indicator** — flag entries in the candidates page flag history show an "Action Required" badge when `candidateActionRequired = true`; flagged-submissions rows gain the same visual indicator.
- **Flag + blacklist icons on candidate assessment history** — history rows show ⚑ when the submission was flagged and ⊘ when the candidate is blacklisted.
- **Flagged page deduplication** — one row per submission (latest flag); document icon reveals full flag history inline.
- **Results page blacklist indicator + tag reflow** — ⊘ inline next to blacklisted names in submissions list; "Blacklisted" tag in detail header; all other tags moved below the name to prevent cutoff.

## Capabilities

### New Capabilities
- `flagged-candidate-invite-block`: Invite modal blocks and warns when candidate has an active flag.
- `action-required-indicator`: "Action Required" state surfaces on flag history entries and flagged-submissions rows.
- `candidate-history-flag-icons`: ⚑ and ⊘ icons on candidate assessment history rows.
- `flagged-page-deduplication`: One row per submission on flagged page; document icon shows full flag history.
- `results-blacklist-display`: ⊘ in submissions list and "Blacklisted" tag in result detail; tags reformatted below name.

### Modified Capabilities
- `candidate-assessment-history`: Icons added to history rows.
- `flagged-submissions-list`: Deduplication and document icon added.

## Impact

- **Backend**: `CandidateResponse` needs `activeFlagStatus: FlagStatus | null` (derived from candidate's open flags). `SubmissionSummaryResponse` needs `candidateBlacklisted: boolean`.
- **Frontend**: `candidates.component.ts`, `flagged-submissions.component.ts`, `results.component.ts`, `candidate.model.ts`, `marking.model.ts`
- No new API endpoints required.
