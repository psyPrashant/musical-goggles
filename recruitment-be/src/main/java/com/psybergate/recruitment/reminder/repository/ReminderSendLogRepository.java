package com.psybergate.recruitment.reminder.repository;

import com.psybergate.recruitment.reminder.ReminderSendLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReminderSendLogRepository extends JpaRepository<ReminderSendLog, UUID> {
    List<ReminderSendLog> findByInvitation_IdOrderBySentAtDesc(UUID invitationId);
}
