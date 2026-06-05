# Prompt Log

## MG-145 — Reorder questions when creating or editing an assessment

**OpenSpec propose prompt:**
```
MG-145: Reorder questions when creating or editing an assessment.

Context: This is a bug/missing feature in the assessment builder. Currently recruiters cannot change the order of questions once added to an assessment.

What's needed:
- Add up/down arrow controls (or drag-and-drop) to each question row in the assessment builder so recruiters can reorder questions
- The order must be persisted — the AssessmentQuestion entity needs an orderIndex field stored in the DB
- The frontend assessment-builder.component.ts renders question cards; each needs move-up/move-down buttons (or CDK drag-and-drop)
- On save, the ordered list of question IDs is sent to PUT /api/assessments/{id}
- The BE must store and return questions in orderIndex order
- Seed data and existing assessments should default to their existing insertion order

Keep the implementation minimal and consistent with existing patterns in the codebase (no new libraries unless drag-and-drop is already available via Angular CDK).
```

**OpenSpec apply prompt:**
```
mg-145-reorder-assessment-questions
```

---

## MG-147 — Prevent sending a completed assessment invite

**OpenSpec propose prompt:**
```
MG-147: Prevent sending a completed assessment invite to a candidate who has already completed it.

Context: This is a bug. Currently a recruiter can send the same assessment invite to a candidate who has already completed that assessment. This should not be allowed.

What's needed:
- FE: In candidates.component.ts, disable/hide the invite action for a candidate–assessment pair when the candidate's history shows that assessment as COMPLETED
- BE: In the invitation creation flow (InvitationController / invitation service), validate that no COMPLETED or active submission already exists for the candidate + assessment pair; reject with 409 Conflict if it does
- The check should be: if a CandidateSubmission exists for this candidate+assessment with status SUBMITTED or AUTO_SUBMITTED (i.e. completed), block the invite

Keep changes minimal. Do not affect the ability to re-invite for assessments that are merely IN_PROGRESS or NOT_STARTED.
```

**OpenSpec apply prompt:**
```
mg-147-prevent-duplicate-completed-invite
```
