## 1. Database Migration

- [x] 1.1 Create `V12__add_cell_phone_to_candidates.sql` in `db/migration/` — `ALTER TABLE candidates ADD COLUMN cell_phone VARCHAR(30)`
- [x] 1.2 Create `V12__seed_dev_data_phone.sql` in `db/seed/` — `UPDATE` each of the 8 seed candidates to set a placeholder cell phone value

## 2. Backend — Domain & Repository

- [x] 2.1 Add `@Column(name = "cell_phone") private String cellPhone` to `Candidate.java`

## 3. Backend — DTOs

- [x] 3.1 Add optional `@Pattern(regexp = "^[+\\d\\s()\\-]{7,20}$") String cellPhone` field to `CandidateRequest` record (nullable, no `@NotBlank`)
- [x] 3.2 Add `String cellPhone` field to `CandidateResponse` record

## 4. Backend — Service

- [x] 4.1 Update `CandidateServiceImpl.create()` to map `request.cellPhone()` onto the new entity field
- [x] 4.2 Update `CandidateServiceImpl.update()` to map `request.cellPhone()` onto the entity field
- [x] 4.3 Update `CandidateServiceImpl.toResponse()` to include `c.getCellPhone()` in the `CandidateResponse` constructor call

## 5. Backend — Tests

- [x] 5.1 Add unit test: create candidate with phone → response includes phone
- [x] 5.2 Add unit test: create candidate without phone → response has `cellPhone = null`
- [x] 5.3 Add unit test: update candidate sets phone; update with `null` clears phone
- [x] 5.4 Add unit test: `PUT` with invalid phone format returns 400
- [x] 5.5 Run `./mvnw test` and confirm all candidate tests pass

## 6. Frontend — Model

- [x] 6.1 Add `cellPhone?: string | null` to the `Candidate` interface in `candidate.model.ts`
- [x] 6.2 Add `cellPhone?: string | null` to the `CandidateRequest` interface (or equivalent request type)

## 7. Frontend — Candidates List

- [x] 7.1 Add a "Phone" column to the candidates table in `candidates.component.ts`; display `candidate.cellPhone ?? '—'`
- [x] 7.2 Add an optional phone input field to the inline edit row; pre-populate with `candidate.cellPhone`
- [x] 7.3 Include `cellPhone` (or `null` when cleared) in the `PUT` request payload on save
- [x] 7.4 Update the displayed row value after a successful save to reflect the new phone

## 8. Frontend — Tests

- [x] 8.1 Add/update component spec: phone column renders value when set, dash when null
- [x] 8.2 Add/update component spec: save with phone calls PUT with `cellPhone` in body
- [x] 8.3 Add/update component spec: clearing phone field sends `cellPhone: null`
- [x] 8.4 Run `npm test` and confirm all candidate component tests pass
