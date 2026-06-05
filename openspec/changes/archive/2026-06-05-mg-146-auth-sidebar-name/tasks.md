## 1. Backend — Extend Login Response

- [x] 1.1 Add `firstName` and `lastName` fields to `LoginResponse.java` record
- [x] 1.2 Pass `user.getFirstName()` and `user.getLastName()` in `AuthServiceImpl.login()` return value

## 2. Frontend — AuthService Name Signals

- [x] 2.1 Extend `LoginResponse` interface in `auth.service.ts` with `firstName: string` and `lastName: string`
- [x] 2.2 Add private `_firstName` and `_lastName` signals seeded from `sessionStorage`
- [x] 2.3 In `login()` tap, persist `firstName`/`lastName` to `sessionStorage` and set signals
- [x] 2.4 In `logout()`, remove `firstName`/`lastName` from `sessionStorage` and null the signals
- [x] 2.5 Expose `readonly firstName`, `readonly lastName`, and `readonly displayName` computed signals

## 3. Frontend — Shell Component Dynamic Bindings

- [x] 3.1 Replace hardcoded avatar initials `"AU"` with an expression deriving initials from `auth.firstName()` and `auth.lastName()`
- [x] 3.2 Replace hardcoded `"Admin User"` with `{{ auth.displayName() }}`
- [x] 3.3 Replace hardcoded `"Administrator"` role label with a formatted version of `auth.role()` (e.g. title-case)

## 4. Frontend — Tests

- [x] 4.1 Update existing `login()` test to include `firstName` and `lastName` in the flushed response
- [x] 4.2 Assert `sessionStorage` stores `firstName` and `lastName` after login
- [x] 4.3 Add test: `displayName()` returns full name from `firstName` + `lastName` signals
- [x] 4.4 Update `logout()` test to assert `firstName`/`lastName` are cleared from `sessionStorage`
