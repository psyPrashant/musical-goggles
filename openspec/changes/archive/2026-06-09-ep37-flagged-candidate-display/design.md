## Context

EP-30 and EP-37 established flagging, blacklisting, and basic flag display. This change adds the remaining UX layer: preventing recruiters from bypassing flag state when inviting, surfacing flag/blacklist state in candidate history and results, deduplicating the flagged page, and fixing tag overflow.

Two small backend additions are required. All other changes are frontend.

## Goals / Non-Goals

**Goals:**
- Block invite submission for candidates with active flags; show correct contextual warning.
- Add "Action Required" badge to flag history entries and flagged-submissions rows.
- Add ⚑ / ⊘ icons to candidate assessment history rows.
- Deduplicate flagged-submissions list to one row per submission (latest flag shown); document icon reveals history.
- Add ⊘ and "Blacklisted" tag to results page; reflow tags below the candidate name.

**Non-Goals:**
- Server-side invite blocking (client-side guard is sufficient for now).
- Pagination of flagged-submissions list.
- Changes to flag transition logic.

## Decisions

### MG-178 — Invite blocking: derive active flag from existing candidate data
**Decision:** Add `activeFlagStatus: FlagStatus | null` to `CandidateResponse` and `Candidate` FE model. Populate in `CandidateServiceImpl` by checking if the candidate has any FLAGGED or UNDER_REVIEW flag. The invite modal reads `c.activeFlagStatus` and `c.actionRequired` to pick the correct warning and disable the submit button.

**Why not derive from loaded flags client-side?** Flags are only loaded per-candidate on demand (flag history panel). The candidate list shows all candidates — eagerly loading flags for all would be N+1 requests.

### MG-179 — Action Required indicator: purely presentational
**Decision:** `candidateActionRequired` is already on `FlagListItem`. No data changes needed. Add an "Action Req." badge to:
1. The flag history panel in `candidates.component.ts` — on each entry where `f.candidateActionRequired`.
2. The flagged-submissions row — small icon/badge next to the status badge.

### MG-180 — Flag icons on history: correlate using loaded flags
**Decision:** The candidates page already loads candidate flags via `flagSvc.getCandidateFlags()` when the flag history panel is opened. This same flags array is available as a signal. When the history modal opens, also load candidate flags (if not already loaded). Correlate by `submissionId` in the template: if `candidateFlags().some(f => f.submissionId === entry.submissionId)` → show ⚑. Blacklist ⊘ is derived from `historyCandidate().blacklisted`.

### MG-181 — Flagged page deduplication: computed signal
**Decision:** Add a `deduplicatedFlags` computed signal that groups the raw `flags` signal by `submissionId` and selects the entry with the latest `createdAt`. Store the full set of flags for each submission in a `Map<submissionId, FlagListItem[]>` signal. The document icon button opens/closes an inline history panel using a `openHistoryId` signal (similar to `openDropdownId`).

All existing functionality (status filter, action dropdown, row click) operates on the deduplicated primary row.

### MG-182 — Results blacklist + tag reflow: requires BE change
**Decision:** Add `candidateBlacklisted: boolean` to `SubmissionSummaryResponse` in the BE, populated from the candidate's `blacklisted` field via the invitation/candidate join already done in `MarkingServiceImpl`. Add the same field to `SubmissionSummary` FE model.

Tag reflow: change `.sub-name-row` CSS from a single flex row to a two-row layout — first row: avatar + name + ⊘ (inline), second row: badges (flex-wrap). This prevents badges overflowing the fixed-width list item.

## Risks / Trade-offs

- **BE changes are minimal but required** for MG-178 and MG-182. Both are additive fields on existing DTOs.
- **Flag history load on history modal open (MG-180):** If the flag history panel hasn't been opened for a candidate before, flags won't be loaded when the history modal opens. Fix: trigger `flagSvc.getCandidateFlags()` when the history modal opens (load on demand, cache in signal).
- **Deduplication client-side (MG-181):** If a submission has many flag events the raw list is large. Acceptable at current scale.
