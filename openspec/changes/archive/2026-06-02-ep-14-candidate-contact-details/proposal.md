## Why

Recruiters need a direct phone contact channel for candidates alongside email. Currently the Candidate model only stores email, leaving no structured way to record or surface a cell phone number on the platform.

## What Changes

- Add optional `cellPhone` field to the `Candidate` entity and database table
- Expose `cellPhone` in candidate API responses (`GET` and `PUT`)
- Extend the inline edit form to allow recruiters to set or update a candidate's cell phone number
- Display cell phone number in the candidates list table
- Populate test cell phone values in dev seed data

## Capabilities

### New Capabilities
- `candidate-phone-display`: Read-only display of a candidate's cell phone number in the candidates list table; `cellPhone` included in all candidate response objects

### Modified Capabilities
- `candidate-edit`: `PUT /api/candidates/{id}` extended to accept optional `cellPhone`; inline edit form gains an optional phone input field

## Impact

- **Backend**: `Candidate` JPA entity, `CandidateRequest` DTO (optional field + format validation), `CandidateResponse` DTO, `CandidateServiceImpl` mapping, new Flyway migration (`ALTER TABLE candidates ADD COLUMN cell_phone VARCHAR(30)`)
- **Frontend**: `candidate.model.ts` interfaces, `candidates.component.ts` (table column + inline edit field)
- **Seed data**: `V12__seed_dev_data.sql` updated with placeholder phone numbers for existing test candidates
- **No breaking changes** — `cellPhone` is nullable; existing records unaffected
