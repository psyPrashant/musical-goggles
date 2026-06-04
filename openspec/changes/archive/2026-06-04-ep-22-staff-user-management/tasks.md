## 1. Database Migration

- [x] 1.1 Create `V17__add_name_to_users.sql` — add `first_name` and `last_name` as nullable, backfill existing rows by role, then alter to NOT NULL
- [x] 1.2 Verify migration applies cleanly against local dev database with no errors

## 2. Backend — Domain & Repository

- [x] 2.1 Add `firstName` and `lastName` fields to `User.java` with `@Column(nullable = false, length = 100)`
- [x] 2.2 Add `findByRoleIn(List<Role> roles)` to `UserRepository.java`
- [x] 2.3 Update `DevDataSeeder.java` to set `firstName = "Admin"` and `lastName = "User"` when creating the seed admin user

## 3. Backend — Staff Package

- [x] 3.1 Create `StaffResponse.java` record — fields: `id`, `firstName`, `lastName`, `email`, `role`, `createdAt` (no password)
- [x] 3.2 Create `StaffRequest.java` record — fields: `@NotBlank firstName`, `@NotBlank lastName`, `@Email @NotBlank email`, `String password`, `@NotNull Role role`
- [x] 3.3 Create `StaffService.java` interface — `findAll()`, `create(StaffRequest)`, `update(UUID, StaffRequest)`
- [x] 3.4 Implement `StaffServiceImpl.java` — `findAll` queries ADMIN+RECRUITER roles only; `create` validates role≠CANDIDATE, checks email uniqueness (409), hashes password; `update` loads or throws 404, validates role, checks email uniqueness excluding self, re-hashes password only if non-blank
- [x] 3.5 Create `StaffController.java` — `@RestController @RequestMapping("/api/staff") @PreAuthorize("hasRole('ADMIN')")` with `GET`, `POST`, `PUT /{id}` endpoints

## 4. Backend — Verification

- [x] 4.1 Confirm `GET /api/staff` with admin JWT returns staff list with no `passwordHash` field
- [x] 4.2 Confirm `POST /api/staff` creates a user whose password works at `POST /api/auth/login`
- [x] 4.3 Confirm `GET /api/staff` with recruiter JWT returns HTTP 403
- [x] 4.4 Confirm duplicate email on `POST /api/staff` returns HTTP 409
- [x] 4.5 Confirm `PUT /api/staff/{id}` with blank password retains existing credentials

## 5. Frontend — Model & Service

- [x] 5.1 Create `core/staff/staff.model.ts` — `StaffMember` interface and `StaffRequest` interface
- [x] 5.2 Create `core/staff/staff.service.ts` — `listStaff()`, `createStaff(req)`, `updateStaff(id, req)` using `inject(HttpClient)`

## 6. Frontend — Staff Component

- [x] 6.1 Create `features/staff/staff.component.ts` as a standalone Angular component
- [x] 6.2 Implement signals: `staff`, `search`, `showDialog`, `editTarget`, dialog form fields (`dFirst`, `dLast`, `dEmail`, `dPassword`, `dRole`), `dSaving`, `dError`
- [x] 6.3 Implement `filtered` computed signal — case-insensitive filter on full name and email
- [x] 6.4 Implement `ngOnInit` — load staff list via `StaffService.listStaff()`
- [x] 6.5 Implement table template — grid columns `Name | Email | Role | Added | (edit)`, role badge (ADMIN = accent, RECRUITER = neutral)
- [x] 6.6 Implement inline add/edit dialog — form fields, password label changes for edit mode, Cancel + Save buttons
- [x] 6.7 Implement `save()` — client-side validation (blank fields, password required on create), call create or update, update `staff` signal on success, show 409 error message inline

## 7. Frontend — Routing & Navigation

- [x] 7.1 Add `{ path: 'staff', loadComponent: () => import('./features/staff/staff.component').then(m => m.StaffComponent) }` to `app.routes.ts` inside the Shell children
- [x] 7.2 Inject `AuthService` into `shell.component.ts` (if not already injected) and add `@if (auth.role() === 'ADMIN')` guarded "Staff" nav link with appropriate icon

## 8. Frontend — Verification

- [x] 8.1 Log in as Admin — confirm "Staff" link appears in sidebar and `/staff` loads the list
- [x] 8.2 Log in as Recruiter — confirm "Staff" link is absent from sidebar
- [x] 8.3 Add a new Recruiter via the dialog — confirm row appears in table and login works with the set password
- [x] 8.4 Edit the Recruiter's name — confirm table updates without page reload
- [x] 8.5 Edit with blank password — confirm existing credentials still work after save
- [x] 8.6 Type in search box — confirm list filters reactively by name and email
- [x] 8.7 Attempt to submit dialog with blank First Name — confirm submission is blocked
