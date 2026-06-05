## ADDED Requirements

### Requirement: Pipeline cards are clickable
Each pipeline stage card on the staff dashboard SHALL be clickable and toggle an inline candidate panel.

#### Scenario: Click opens panel
- **WHEN** a recruiter clicks a pipeline stage card (Invited, In Progress, Pending Review, Completed, or Flagged)
- **THEN** an expanded panel appears below the pipeline grid listing the candidates in that stage

#### Scenario: Click same card closes panel
- **WHEN** the currently active pipeline stage card is clicked again
- **THEN** the panel closes

#### Scenario: Click different card switches panel
- **WHEN** a different pipeline stage card is clicked while a panel is already open
- **THEN** the panel updates to show candidates for the newly selected stage

### Requirement: Pipeline candidate panel shows summarised candidate info
The expanded candidate panel SHALL display a row per candidate showing their name, score percentage (where available), and a "View Result" link.

#### Scenario: Candidate row with score
- **WHEN** the panel is open for Completed stage and a candidate has a scored submission
- **THEN** the row shows the candidate name and score as a percentage (e.g. "72%")

#### Scenario: Candidate row without score
- **WHEN** the panel is open for Invited or In Progress stage where no score exists
- **THEN** the row shows the candidate name and a dash or omits the score

#### Scenario: View Result navigates
- **WHEN** the recruiter clicks "View Result" on a candidate row
- **THEN** the browser navigates to `/results?submissionId=<uuid>` for that candidate's submission

#### Scenario: Empty panel state
- **WHEN** the panel is opened for a stage with zero candidates
- **THEN** a message "No candidates in this stage" is displayed

### Requirement: Pipeline stage to submission mapping
The candidate panel SHALL derive stage membership from the submission list using these rules:

- **Invited**: submission status = NOT_STARTED
- **In Progress**: submission status = IN_PROGRESS
- **Pending Review**: submission status = SUBMITTED or AUTO_SUBMITTED AND markedCount < totalAnswers
- **Completed**: submission status = SUBMITTED or AUTO_SUBMITTED AND markedCount >= totalAnswers
- **Flagged**: flagStatus = FLAGGED or UNDER_REVIEW (any submission status)

#### Scenario: Invited stage candidates
- **WHEN** the Invited card is clicked
- **THEN** the panel lists candidates whose submission status is NOT_STARTED

#### Scenario: Flagged stage candidates
- **WHEN** the Flagged card is clicked
- **THEN** the panel lists candidates whose flagStatus is FLAGGED or UNDER_REVIEW
