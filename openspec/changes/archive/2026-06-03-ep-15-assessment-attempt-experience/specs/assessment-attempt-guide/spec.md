## ADDED Requirements

### Requirement: Guide screen shown before assessment begins
The system SHALL display a guide/disclaimer screen when a candidate navigates to an assessment attempt. The guide screen SHALL show the assessment title, time limit, total question count, and a set of rules. The timer SHALL NOT start until the candidate clicks the Start button. Clicking Start SHALL transition the UI to the in-progress phase and begin the countdown.

#### Scenario: Candidate opens assessment link
- **WHEN** a candidate navigates to the assessment take URL
- **THEN** the guide screen is shown with the assessment title, time limit, and question count
- **AND** the countdown timer is not yet running
- **AND** a "Start Assessment" button is visible

#### Scenario: Candidate clicks Start
- **WHEN** the candidate clicks "Start Assessment" on the guide screen
- **THEN** the guide screen is replaced by the question view
- **AND** the countdown timer begins immediately

#### Scenario: Guide screen rules content
- **WHEN** the guide screen is displayed
- **THEN** it SHALL include the following rules:
  - The timer starts when you click Start and cannot be paused
  - Closing or refreshing the tab does not pause the timer
  - Submit your answers before the time runs out; the assessment auto-submits when time expires
  - You may give up the attempt at any time using the Give Up button

#### Scenario: Password-protected assessment shows guide after password entry
- **WHEN** an assessment requires a password and the candidate has entered the correct password
- **THEN** the guide screen is shown before any questions are revealed
- **AND** the timer has not yet started

#### Scenario: Returning candidate with in-progress submission skips guide
- **WHEN** a candidate navigates to an assessment that already has an `IN_PROGRESS` submission
- **THEN** the guide screen is skipped and the question view is shown immediately
- **AND** the remaining time is computed from `startedAt` and the time limit
