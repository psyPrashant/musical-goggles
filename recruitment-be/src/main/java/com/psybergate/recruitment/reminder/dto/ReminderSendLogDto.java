package com.psybergate.recruitment.reminder.dto;

import com.psybergate.recruitment.reminder.ReminderSendLog;
import com.psybergate.recruitment.reminder.ReminderSendType;

import java.time.Instant;
import java.util.UUID;

public record ReminderSendLogDto(
        UUID id,
        Instant sentAt,
        ReminderSendType sendType,
        UUID sentBy
) {
    public static ReminderSendLogDto from(ReminderSendLog log) {
        return new ReminderSendLogDto(log.getId(), log.getSentAt(), log.getSendType(), log.getSentBy());
    }
}
