## 1. Database Migration

- [x] 1.1 Create `V13__reminder_notifications.sql` — add `reminder_days_before INTEGER` (nullable) column to `assessments` table (MG-82)
- [x] 1.2 Create `reminder_send_log` table in the same migration — columns: `id UUID PK`, `invitation_id UUID NOT NULL FK → candidate_invitations`, `sent_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `send_type VARCHAR(20) NOT NULL CHECK IN ('AUTOMATED','MANUAL')`, `sent_by UUID nullable FK → users` (MG-85)

## 2. Backend Domain

- [x] 2.1 Add `ReminderSendType` enum (`AUTOMATED`, `MANUAL`) in domain package (MG-82/83)
- [x] 2.2 Add `ReminderSendLog` JPA entity mapping `reminder_send_log` — fields: `id`, `invitation` (ManyToOne CandidateInvitation), `sentAt`, `sendType`, `sentBy` (nullable UUID) (MG-85)
- [x] 2.3 Add `reminderDaysBeforeDeadline` (Integer, nullable) field to `Assessment` entity with `@Column("reminder_days_before")` (MG-82)

## 3. Repositories

- [x] 3.1 Create `ReminderSendLogRepository` extending `JpaRepository<ReminderSendLog, UUID>` with `findByInvitationIdOrderBySentAtDesc(UUID invitationId)` (MG-85)
- [x] 3.2 Add query to `InvitationRepository`: find SENT invitations for assessments with a non-null `reminderDaysBeforeDeadline` whose `expiresAt` falls within the reminder window and no completed submission (MG-82)

## 4. Email Service

- [x] 4.1 Add `sendReminder(Candidate candidate, Assessment assessment, Instant expiresAt, String invitationLink)` method to `EmailService` interface and implement in `EmailServiceImpl` — plain-text email including candidate name, assessment title, formatted deadline, and access link (MG-84)

## 5. Reminder Service

- [x] 5.1 Create `ReminderService` interface with `sendManualReminder(UUID invitationId, UUID sentByUserId)` and `sendAutomatedReminders()` (MG-82/83)
- [x] 5.2 Implement `ReminderServiceImpl` — `sendManualReminder`: guard against completed submissions, build invitation link from token, call `emailService.sendReminder()`, persist `ReminderSendLog` with MANUAL type (MG-83)
- [x] 5.3 Implement `sendAutomatedReminders()` in `ReminderServiceImpl` with `@Scheduled(cron = "0 0 8 * * *")` — query eligible invitations, send email for each, persist log with AUTOMATED type (MG-82)
- [x] 5.4 Add `@EnableScheduling` annotation to `RecruitmentApplication` (MG-82)

## 6. REST API

- [x] 6.1 Create `ReminderSendLogDto` record — fields: `id`, `sentAt`, `sendType`, `sentBy` (nullable UUID) (MG-85)
- [x] 6.2 Create `ReminderController` with `POST /api/invitations/{invitationId}/reminders` (manual send, returns 201 + dto) and `GET /api/invitations/{invitationId}/reminders` (history, returns list) — secured to RECRUITER/ADMIN roles (MG-83/85)

## 7. Backend Tests

- [x] 7.1 Unit test `ReminderServiceImpl.sendManualReminder` — verify guard for completed submissions and verify log is saved (MG-83)
- [x] 7.2 Unit test `sendAutomatedReminders` — verify eligible invitations trigger email sends and log entries (MG-82)
- [x] 7.3 Integration/controller test for `POST /api/invitations/{id}/reminders` and `GET /api/invitations/{id}/reminders` (MG-83/85)

## 8. Frontend — Send Reminder Action

- [x] 8.1 Add `sendReminder(invitationId: string)` method to the API service calling `POST /api/invitations/{id}/reminders` (MG-83)
- [x] 8.2 Add "Send Reminder" button to `results.component.ts` submission detail panel — hidden/disabled when submission status is SUBMITTED or AUTO_SUBMITTED (MG-83)
- [x] 8.3 Wire confirmation dialog (reuse existing flag dialog pattern) before dispatching the send reminder API call; show success toast on confirm (MG-83)

## 9. Frontend — Reminder History

- [x] 9.1 Add `getReminderHistory(invitationId: string)` method to the API service calling `GET /api/invitations/{id}/reminders` (MG-85)
- [x] 9.2 Add read-only "Reminder History" section to `results.component.ts` — load on submission detail open, refresh after a successful manual send (MG-85)
- [x] 9.3 Display each log entry with: send type badge (Automated / Manual), sender ("System" or recruiter name), and formatted timestamp; show "No reminders sent yet" for empty state (MG-85)
