package com.psybergate.recruitment.reminder;

import com.psybergate.recruitment.reminder.dto.ReminderSendLogDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invitations/{invitationId}/reminders")
@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @PostMapping
    public ResponseEntity<ReminderSendLogDto> sendReminder(
            @PathVariable UUID invitationId,
            Authentication auth) {
        UUID actorId = UUID.fromString(auth.getName());
        ReminderSendLog log = reminderService.sendManualReminder(invitationId, actorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ReminderSendLogDto.from(log));
    }

    @GetMapping
    public ResponseEntity<List<ReminderSendLogDto>> getReminderHistory(@PathVariable UUID invitationId) {
        List<ReminderSendLogDto> history = reminderService.getReminderHistory(invitationId)
                .stream()
                .map(ReminderSendLogDto::from)
                .toList();
        return ResponseEntity.ok(history);
    }
}
