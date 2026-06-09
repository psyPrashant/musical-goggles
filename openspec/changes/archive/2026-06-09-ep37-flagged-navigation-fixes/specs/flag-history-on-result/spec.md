## MODIFIED Requirements

### Requirement: Flag History panel on the assessment attempt/result page
The Results page detail panel SHALL include a "Flag History" section at the bottom when a submission is selected. The section SHALL list all flags ever raised for that submission (FLAGGED, UNDER_REVIEW, RESOLVED, DISMISSED). Each entry SHALL show: reason label, status badge, date raised, raised by (username), and resolution notes (when present). The section SHALL be hidden or show "No flags raised" when no flags exist for the submission.

#### Scenario: Submission with flags shows flag history
- **WHEN** a staff member selects a submission that has one or more flags
- **THEN** the Flag History section appears at the bottom of the detail panel listing each flag with reason, status, date, raised-by, and resolution notes

#### Scenario: Submission with no flags shows empty state
- **WHEN** a staff member selects a submission that has no flags
- **THEN** the Flag History section either shows "No flags raised" or is hidden entirely

#### Scenario: Resolved flag shows resolution notes
- **WHEN** a flag in the history has status RESOLVED and has resolution notes
- **THEN** the entry displays the resolution notes text

#### Scenario: Dismissed flag shows dismissed status
- **WHEN** a flag in the history has status DISMISSED
- **THEN** the entry shows a "Dismissed" status badge with appropriate colour coding

#### Scenario: Flag history loads when submission is selected
- **WHEN** a staff member clicks a submission in the left panel
- **THEN** the Flag History section loads flags for that submission (not a previously selected one)
