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
