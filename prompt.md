# Prompts Used — EP-30 Flagged Page Actions

## Session: 2026-06-05

### Jira / Setup
```
Connect to the musical goggles jira board and look for epic 30 in the current sprint.
Pull main.
Move the epic to in progress and assign it to me.
Create a new branch and implement the stories using the open spec workflow.
Move each story as you progress, and assign it to me.
Run open spec when needed.
Append prompts used to prompt.md.
Give a review of changes made for me to approve.
Don't push until I approve the review.
```

### OpenSpec Propose (opsx:propose)
```
EP-30 Flagged Page Actions — implement all 4 issues on the flagged submissions page:

MG-151 (Bug): Fix row click navigation. The flagged page passes queryParams
{submission: f.submissionId} but results.component.ts reads
route.snapshot.queryParamMap.get('submissionId'). Fix: change results.component.ts
to use 'submission' instead of 'submissionId'.

MG-152 (Story): Add "Contact Candidate" action to the flagged page actions dropdown.
When clicked, opens a small inline form/modal to compose a message (subject + body
pre-filled, editable). On send, calls a new backend endpoint
POST /api/candidates/{candidateId}/contact that sends an email via Spring Mail.
Also sets an "action required" flag on the candidate (new boolean field actionRequired
on Candidate) and blocks further assessment invitations for that candidate while the
flag is active. FlagListItem needs candidateId added. Backend: new field on Candidate
entity + DTO, new endpoint on CandidateController, new service method, migration.

MG-153 (Story): Add "Blacklist" action to the flagged page actions dropdown.
Toggling blacklist sets blacklisted: boolean on the Candidate. Removing from blacklist
requires ADMIN role (recruiter can blacklist, only admin can un-blacklist). Backend:
new blacklisted boolean field on Candidate entity + DTO, new endpoint
PATCH /api/candidates/{id}/blacklist (body: {blacklisted: boolean}), role check for
un-blacklist. Frontend: CandidateService.setBlacklist(), FlagListItem needs
candidateId and candidateBlacklisted fields.

MG-154 (Story): Add "Resolve Flag" action to the flagged page actions dropdown.
Opens an inline form for resolution notes (required). Transitions the flag:
FLAGGED -> UNDER_REVIEW -> RESOLVED in one user action (two-step pattern).
After resolve, row is removed from the list.

All actions live in a new actions dropdown on each row of
flagged-submissions.component.ts. Dropdown options: "View Result", "Contact
Candidate", "Blacklist"/"Unblacklist", "Resolve Flag", "Dismiss". Show relevant
options based on flag status and user role.
```

### OpenSpec Apply (opsx:apply)
```
ep30-flagged-page-actions
```

---

# Prompts Used — EP-37 Flagged Submissions & Assessment Attempt Navigation Fixes

## Session: 2026-06-09

### Jira / Setup
```
Connect to the musical goggles jira board and look for epic 37 in the current sprint.
Pull main.
Move the epic to in progress and assign it to me.
Create a new branch and implement the stories using the open spec workflow.
Move each story as you progress, and assign it to me.
Run open spec when needed.
Append prompts used to prompt.md.
Give a review of changes made for me to approve.
Run docker rebuild images and deploy.
Don't push until I approve the review.
```

---

# Prompts Used — EP-37 Extension: Flagged Candidate Display (MG-178 to MG-182)

## Session: 2026-06-09

### Story creation + Jira
```
Add new stories for the following and then implement as before:
- For a candidate with a flagged assessment: should not be able to send invite...
- The flagged page should only show the latest flagged status per assessment...
- A resolved blacklisted assessment should have the no symbol on results page...
- The results list tags need to be reformatted to avoid tags being cut off...
```

### OpenSpec Fast-Forward (openspec-ff-change)
```
EP-37 extension — flagged candidate display and invite restrictions (MG-178 to MG-182).
- MG-178: Block invites for flagged candidates; contextual warnings.
- MG-179: Action Required state surfaced in flag history and flagged-submissions rows.
- MG-180: ⚑ and ⊘ icons on candidate assessment history entries.
- MG-181: Flagged page deduplication (one row per submission); document icon for history.
- MG-182: Results page ⊘ and Blacklisted tag; tags reflowed below name.
```

---

### OpenSpec Fast-Forward (openspec-ff-change)
```
EP-37: Flagged Submissions & Assessment Attempt Navigation Fixes. Four issues:

1. MG-174 (Bug): Resolved/dismissed flags disappear from list after action.
   Fix: retain rows, update status in-place, add status filter (default: all).
   Root: filtered() computed filters out non-FLAGGED statuses; resolve/dismiss
   handlers remove via filter() instead of map().

2. MG-175 (Bug): Clicking flagged row passes ?submission= but results.component
   reads queryParamMap.get('submissionId') — wrong key, submission never auto-selects.
   Fix: change results.component.ts to read 'submission'.

3. MG-176 (Story): Add Flag History panel to results/attempt page showing all flags
   for the selected submission (FLAGGED, RESOLVED, DISMISSED) with reason, status,
   date, raised-by. Load via flagSvc.getCandidateFlags(candidateId) filtered by
   submissionId.

4. MG-177 (Bug): Candidate history uses [attr.href] causing full page reload.
   Fix: inject Router, replace with router.navigate().
```

---

# Prompts Used — ACTION_REQUIRED flag status

## Session: 2026-06-09

```
add action required enum to status, change status from flagged to action required
```

```
don't show flagged status when status is action required
```

---

# Prompts Used — EP-35 (already implemented)

## Session: 2026-06-09

```
look at epic 35 and implement what is not yet implemented. ensure no duplication of
code or features. follow the same process as before.
```

Result: Both stories (MG-169, MG-170) were already fully implemented via EP-30/EP-37.
Closed all three issues in Jira as Done. No code changes made.

---

# Prompts Used — Flag history on candidates page improvements

## Session: 2026-06-09

```
flag history on candidates page should indicate the same assessment - expand row,
maybe. assessment should link to the assessment on results page.
```

---

# Prompts Used — Merge, archive, PR

## Session: 2026-06-09

```
pull from main and resolve conflicts. rerun tests.
```

```
archive specs and recommit
```

```
also append prompts to prompt.md
```
