## ADDED Requirements

### Requirement: Browser warns candidate before leaving an active assessment
The system SHALL register a `beforeunload` event listener while a candidate has an assessment in the in-progress phase. The browser SHALL display its native leave-confirmation dialog if the candidate attempts to close the tab, close the browser, or navigate away. The listener SHALL be removed when the assessment is submitted, given up, or the component is destroyed.

#### Scenario: Candidate attempts to close the tab during attempt
- **WHEN** an assessment is in the in-progress phase
- **AND** the candidate triggers a tab close or browser navigation away
- **THEN** the browser shows its native "Leave site?" confirmation dialog

#### Scenario: No warning after submission
- **WHEN** an assessment has been submitted or given up
- **AND** the candidate attempts to navigate away
- **THEN** no browser leave-confirmation dialog is shown

#### Scenario: No warning on guide screen
- **WHEN** the assessment is on the guide screen (timer not yet started)
- **AND** the candidate navigates away
- **THEN** no browser leave-confirmation dialog is shown

### Requirement: Give Up button ends the attempt early
The system SHALL display a "Give Up" button during an active in-progress assessment attempt. Clicking it SHALL open a confirmation modal. Confirming SHALL submit the assessment as auto-submitted and transition the UI to the submitted/success screen. Cancelling SHALL return the candidate to the question view without any state change.

#### Scenario: Candidate clicks Give Up
- **WHEN** a candidate clicks "Give Up" during an active attempt
- **THEN** a confirmation modal appears asking the candidate to confirm they want to end the attempt

#### Scenario: Candidate confirms Give Up
- **WHEN** the candidate confirms the Give Up modal
- **THEN** the system calls `POST /api/take/submit` with `autoSubmitted=true`
- **AND** the assessment transitions to the submitted success screen
- **AND** the beforeunload listener is removed

#### Scenario: Candidate cancels Give Up
- **WHEN** the candidate clicks Cancel in the Give Up modal
- **THEN** the modal closes and the assessment continues from where it was
- **AND** no submit request is made

### Requirement: Submit guard warns when zero questions answered
The system SHALL detect when a candidate attempts to submit an assessment without having answered any questions. In that case, the confirmation modal SHALL display a stronger warning indicating that no questions have been answered. The candidate SHALL still be able to confirm and submit.

#### Scenario: Submit with zero answers answered
- **WHEN** a candidate clicks Submit and has answered zero questions
- **THEN** the submit confirmation modal shows a prominent warning: "You have not answered any questions"
- **AND** the candidate can still confirm and proceed with submission

#### Scenario: Submit with at least one answer
- **WHEN** a candidate clicks Submit and has answered at least one question
- **THEN** the standard submit confirmation modal is shown without the zero-answer warning
