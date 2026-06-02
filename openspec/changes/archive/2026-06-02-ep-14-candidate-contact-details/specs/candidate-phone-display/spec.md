## ADDED Requirements

### Requirement: Cell phone number is included in all candidate responses
The system SHALL include a `cellPhone` field (nullable string) in every `CandidateResponse` object returned by `GET /api/candidates`, `GET /api/candidates/{id}`, and `PUT /api/candidates/{id}`. The field SHALL be `null` when no phone number has been stored for that candidate.

#### Scenario: Candidate with a phone number set
- **WHEN** `GET /api/candidates` is called
- **AND** one candidate has a `cell_phone` value stored in the database
- **THEN** that candidate's response object includes `cellPhone` equal to the stored value

#### Scenario: Candidate with no phone number
- **WHEN** `GET /api/candidates/{id}` is called for a candidate with no phone on record
- **THEN** the response includes `"cellPhone": null`

### Requirement: Candidates table displays a Phone column
The candidates list UI SHALL display a "Phone" column that shows each candidate's cell phone number. When a candidate has no phone on record the column SHALL display a dash (`—`).

#### Scenario: Candidate with phone shown in the table
- **WHEN** the candidates list loads
- **AND** a candidate has a non-null `cellPhone` in the response
- **THEN** the Phone column for that row shows the phone number

#### Scenario: Candidate without phone shown in the table
- **WHEN** the candidates list loads
- **AND** a candidate has `cellPhone: null` in the response
- **THEN** the Phone column for that row shows `—`
