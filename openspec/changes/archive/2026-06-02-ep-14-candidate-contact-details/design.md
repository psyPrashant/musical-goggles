## Context

The `Candidate` entity currently holds `firstName`, `lastName`, and `email`. Recruiters need a cell phone number to contact candidates directly. The field must be optional — existing candidates have no phone on record and bulk-migrating data is out of scope.

## Goals / Non-Goals

**Goals:**
- Add nullable `cell_phone` column to the `candidates` table via a Flyway migration
- Expose `cellPhone` in all candidate API responses
- Allow recruiters to set/update a candidate's phone via `PUT /api/candidates/{id}`
- Display the phone number in the candidates list UI
- Populate test phone values in dev seed data

**Non-Goals:**
- Phone number normalisation or formatting on write (stored as-entered)
- SMS or call integration
- Candidate self-service phone update (candidate portal is out of scope for this EP)
- Phone uniqueness enforcement

## Decisions

### Nullable column with no default
`ALTER TABLE candidates ADD COLUMN cell_phone VARCHAR(30)` — nullable, no default. All existing rows get `NULL` automatically. No backfill needed because the field is purely additive and optional in the UI.

**Alternative considered:** NOT NULL with a sentinel default (e.g. `''`). Rejected — an empty string is not semantically the same as "phone not provided" and would complicate null checks in the FE.

### Optional DTO field with loose format validation
`CandidateRequest` gains `@Pattern(regexp = "^[+\\d\\s()\\-]{7,20}$") String cellPhone` (nullable). Validation fires only when the field is non-null. Strict E.164 rejected — South African numbers come in multiple formats (`+27 82 …`, `082 …`, `(082) …`).

**Alternative considered:** `@Pattern` matching E.164 strictly. Rejected — too restrictive for the recruiter data-entry workflow.

### V12 migration for phone, separate V12 seed patch
The next available migration version is V12. A dedicated `V12__add_cell_phone_to_candidates.sql` keeps the schema change atomic. The existing dev-seed migration (`V11__seed_dev_data.sql`, already shipped) will not be modified; phone values for seed candidates are applied via an `UPDATE` statement in a new `V12__seed_dev_data_phone.sql`.

Wait — seed data lives at `db/seed/` (separate from `db/migration/`). Seed migrations follow the same Flyway versioning but are in a separate path. Check the current highest seed version (`V11__seed_dev_data.sql`) and use `V12` for the phone seed patch.

## Risks / Trade-offs

- **Loose validation** → invalid phone strings can be stored. Acceptable for now; a normalisation pass is a future concern.
- **No FE phone validation** → rely on backend `@Pattern` returning 400 and showing a form error. Simple and consistent with existing email validation.
- **Seed migration version collision** → if EP-12 or EP-13 (in progress by other devs) use V12 for their migrations, this branch will conflict. Coordinate version numbers at merge time.
