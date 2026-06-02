package com.psybergate.recruitment.reminder;

import java.util.List;
import java.util.UUID;

public interface ReminderService {
    ReminderSendLog sendManualReminder(UUID invitationId, UUID sentByUserId);
    List<ReminderSendLog> getReminderHistory(UUID invitationId);
    void sendAutomatedReminders();
}
