## REMOVED Requirements

### Requirement: Code submission limit warning in assessment builder
**Reason**: The one-CODE_SUBMISSION-per-assessment limit was lifted in MG-119. The `codeSubmissionLimitReached` signal and its associated warning paragraph are dead code.
**Migration**: Remove the `codeSubmissionLimitReached` signal, its setter, and the warning `<p class="limit-warning">` from `AssessmentDetailComponent`. No user-facing migration needed.
