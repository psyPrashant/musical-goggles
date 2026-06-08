## Why

The flagged submissions page is missing key workflow actions, and row-click navigation is broken. Recruiters need to act on flagged candidates directly from the list — contact them, blacklist them, or resolve the flag — without navigating away to the results page first.

## What Changes

- **Bug fix**: Results page reads query param `submissionId` but flagged page (and existing spec) sets `submission`. Fix `results.component.ts` to read `snapshot.queryParamMap.get('submission')`.
- **Actions dropdown**: Replace bare "Dismiss" button with a dropdown offering: View Result, Contact Candidate, Blacklist / Unblacklist, Resolve Flag, Dismiss.
- **Contact Candidate**: New backend endpoint `POST /api/candidates/{id}/contact` (Spring Mail). Sets `actionRequired: true` on the candidate, blocking new invitations while active. `FlagListItem` gains `candidateId`.
- **Blacklist**: New `blacklisted` boolean on `Candidate` entity/DTO. New endpoint `PATCH /api/candidates/{id}/blacklist`. Recruiter can set blacklisted; only ADMIN can unset. `FlagListItem` gains `candidateId` and `candidateBlacklisted`.
- **Resolve Flag**: One-click "Resolve" action with required resolution notes. Transitions FLAGGED → UNDER_REVIEW → RESOLVED (same two-step pattern as dismiss). Row removed from list on success.
- **DB migration**: Add `action_required` and `blacklisted` columns to `candidates` table.

## Capabilities

### New Capabilities

- `flagged-page-contact-candidate`: Contact a candidate directly from the flagged list, sending an email and setting an action-required block.
- `flagged-page-blacklist`: Blacklist or un-blacklist a candidate from the flagged list, with role-based un-blacklist restriction.
- `flagged-page-resolve-flag`: Resolve a flag with resolution notes directly from the flagged list.
- `flagged-page-actions-dropdown`: Unified actions dropdown on each flagged-submission row.

### Modified Capabilities

- `flagged-attempt-navigation`: Results page must read query param `submission` (not `submissionId`) to match existing spec and flagged page implementation.
- `flagged-attempt-actions`: Dismiss action is now one item in a broader actions dropdown; behaviour unchanged.

## Impact

- **Frontend**: `flagged-submissions.component.ts`, `results.component.ts`, `candidate.model.ts`, `candidate.service.ts`, `flag.model.ts` (FlagListItem), new actions-dropdown inline component.
- **Backend**: `Candidate` entity + `CandidateResponse` DTO, `CandidateController` (2 new endpoints), `CandidateService` + `CandidateServiceImpl`, `FlagListItemResponse`, `SubmissionFlagController` (FlagListItem projection).
- **DB**: New migration adding `action_required BOOLEAN NOT NULL DEFAULT false` and `blacklisted BOOLEAN NOT NULL DEFAULT false` to `candidates`.
- **Email**: Uses existing Spring Mail configuration.
