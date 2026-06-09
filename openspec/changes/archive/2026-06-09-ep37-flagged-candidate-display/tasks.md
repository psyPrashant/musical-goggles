## 1. MG-178 — Backend: expose activeFlagStatus on candidate list

- [ ] 1.1 In `CandidateServiceImpl`, when building `CandidateResponse`, query the candidate's open flags (FLAGGED/UNDER_REVIEW) and set `activeFlagStatus` to the status of the most recent open flag, or `null` if none
- [ ] 1.2 Add `FlagStatus activeFlagStatus` field to `CandidateResponse` record (nullable)
- [ ] 1.3 Add `activeFlagStatus?: FlagStatus | null` to the `Candidate` FE model in `candidate.model.ts`

## 2. MG-178 — Frontend: block invite for flagged candidates

- [ ] 2.1 In `candidates.component.ts` invite modal, add a computed/derived `inviteWarning` that checks `inviteCandidate().activeFlagStatus` and `inviteCandidate().actionRequired`
- [ ] 2.2 Show the flagged warning: "This candidate has been flagged and cannot be sent a new assessment at this time." when `activeFlagStatus` is FLAGGED/UNDER_REVIEW and `actionRequired = false`
- [ ] 2.3 Show the awaiting warning: "This candidate has been flagged. Awaiting response from candidate. A new assessment cannot be sent until resolved." when `activeFlagStatus` active and `actionRequired = true`
- [ ] 2.4 Disable the invite submit button when any warning is shown (flag or blacklist)

## 3. MG-179 — Action Required indicator

- [ ] 3.1 In `candidates.component.ts` flag history panel: add an "Action Req." badge on flag entries where `f.candidateActionRequired = true`
- [ ] 3.2 In `flagged-submissions.component.ts` flag row: add a small "⚠ Action Req." sub-badge next to the status badge when `f.candidateActionRequired = true`
- [ ] 3.3 Add styles for the action-required badge (warning colour, small, pill-shaped)

## 4. MG-180 — Flag + blacklist icons on candidate assessment history

- [ ] 4.1 In `candidates.component.ts` `openAssessmentHistory()`: call `flagSvc.getCandidateFlags(c.id)` and store result in `historyCandidateFlags` signal (if not already loaded for this candidate)
- [ ] 4.2 In the history modal template: for each row, show ⚑ if `historyCandidateFlags().some(f => f.submissionId === entry.submissionId)`
- [ ] 4.3 In the history modal template: show ⊘ on every row if `historyCandidate().blacklisted`
- [ ] 4.4 Add inline styles for ⚑ (warning/flag colour) and ⊘ (danger/grey colour)

## 5. MG-181 — Flagged page deduplication

- [ ] 5.1 In `flagged-submissions.component.ts`: add `flagHistoryMap` signal (`Map<string, FlagListItem[]>`) built from the raw `flags` list grouped by `submissionId`
- [ ] 5.2 Add `deduplicatedFlags` computed signal: for each `submissionId`, pick the flag with the latest `createdAt`; apply existing filters on top of deduplicated list
- [ ] 5.3 Update `filtered()` to use `deduplicatedFlags` as input instead of raw `flags`
- [ ] 5.4 Add `openHistorySubmissionId` signal (`string | null`) for tracking which row's history panel is open
- [ ] 5.5 Add document icon button to each row; toggle `openHistorySubmissionId` on click
- [ ] 5.6 Add inline history panel below the row when `openHistorySubmissionId() === f.submissionId`, listing all flags from `flagHistoryMap().get(f.submissionId)` in chronological order
- [ ] 5.7 Style the inline history panel (compact, indented, showing reason/status/date per entry)

## 6. MG-182 — Backend: expose candidateBlacklisted on submission summary

- [ ] 6.1 Add `boolean candidateBlacklisted` to `SubmissionSummaryResponse` record
- [ ] 6.2 In `MarkingServiceImpl` (or wherever the submissions list is built): populate `candidateBlacklisted` from the candidate's `blacklisted` field via the invitation→candidate join
- [ ] 6.3 Add `candidateBlacklisted: boolean` to `SubmissionSummary` FE model in `marking.model.ts`

## 7. MG-182 — Frontend: blacklist display and tag reflow on results page

- [ ] 7.1 In `results.component.ts` submissions list template: show ⊘ inline next to the candidate name when `s.candidateBlacklisted`
- [ ] 7.2 In the result detail header: show a "Blacklisted" tag next to the candidate name when the selected submission's `candidateBlacklisted` is true
- [ ] 7.3 Reflow tags in the submissions list: move status badge, flag badge, and pending marker to a second row (`div.sub-tags`) below the name row; leave ⊘ inline with the name
- [ ] 7.4 Update `.sub-name-row` and `.sub-info` CSS to support the two-row layout

## 8. Tests & verification

- [ ] 8.1 Update `candidates.component.spec.ts` — verify invite submit is disabled for flagged candidates and correct warning text shown
- [ ] 8.2 Update `flagged-submissions.component.spec.ts` — verify deduplication logic (one row per submission, latest flag selected)
- [ ] 8.3 Run `npm test` and confirm all tests pass
- [ ] 8.4 Run `npx tsc --noEmit` to confirm no type errors
