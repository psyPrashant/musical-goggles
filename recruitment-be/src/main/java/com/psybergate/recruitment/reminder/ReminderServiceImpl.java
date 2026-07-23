package com.psybergate.recruitment.reminder;

import com.psybergate.recruitment.domain.CandidateInvitation;
import com.psybergate.recruitment.domain.CandidateSubmission;
import com.psybergate.recruitment.domain.SubmissionStatus;
import com.psybergate.recruitment.email.EmailService;
import com.psybergate.recruitment.repository.CandidateSubmissionRepository;
import com.psybergate.recruitment.repository.InvitationRepository;
import com.psybergate.recruitment.reminder.repository.ReminderSendLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ReminderServiceImpl implements ReminderService {

    @Value("${app.base-url}")
    private String baseUrl;

    private final InvitationRepository invitationRepository;
    private final CandidateSubmissionRepository submissionRepository;
    private final ReminderSendLogRepository reminderLogRepository;
    private final EmailService emailService;

    @Override
    public ReminderSendLog sendManualReminder(UUID invitationId, UUID sentByUserId) {
        CandidateInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        // Guard: don't remind if the candidate has already completed the assessment
        submissionRepository.findByInvitationId(invitation.getId()).ifPresent(s -> {
            if (isCompleted(s.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cannot send reminder — candidate has already completed this assessment");
            }
        });

        String link = buildLink(invitation);
        emailService.sendReminder(invitation.getCandidate(), invitation.getAssessment(),
                invitation.getExpiresAt(), link);

        ReminderSendLog log = new ReminderSendLog();
        log.setInvitation(invitation);
        log.setSendType(ReminderSendType.MANUAL);
        log.setSentBy(sentByUserId);
        return reminderLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReminderSendLog> getReminderHistory(UUID invitationId) {
        return reminderLogRepository.findByInvitation_IdOrderBySentAtDesc(invitationId);
    }

    @Override
    @Scheduled(cron = "0 0 8 * * *")
    public void sendAutomatedReminders() {
        Instant now = Instant.now();
        List<CandidateInvitation> candidates = invitationRepository.findSentWithReminderWindowAndIncomplete(now);

        for (CandidateInvitation invitation : candidates) {
            int daysBeforeDeadline = invitation.getAssessment().getReminderDaysBeforeDeadline();
            Instant reminderThreshold = invitation.getExpiresAt().minus(daysBeforeDeadline, ChronoUnit.DAYS);
            if (!now.isBefore(reminderThreshold)) {
                String link = buildLink(invitation);
                emailService.sendReminder(invitation.getCandidate(), invitation.getAssessment(),
                        invitation.getExpiresAt(), link);

                ReminderSendLog log = new ReminderSendLog();
                log.setInvitation(invitation);
                log.setSendType(ReminderSendType.AUTOMATED);
                reminderLogRepository.save(log);
            }
        }
    }

    private String buildLink(CandidateInvitation invitation) {
        return baseUrl + "/assessment/" + invitation.getAssessment().getId()
                + "/take?token=" + invitation.getInvitationToken();
    }

    private boolean isCompleted(SubmissionStatus status) {
        return status == SubmissionStatus.SUBMITTED || status == SubmissionStatus.AUTO_SUBMITTED;
    }
}
