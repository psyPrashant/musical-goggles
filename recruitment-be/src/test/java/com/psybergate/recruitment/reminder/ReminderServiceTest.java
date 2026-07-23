package com.psybergate.recruitment.reminder;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.email.EmailService;
import com.psybergate.recruitment.repository.CandidateSubmissionRepository;
import com.psybergate.recruitment.repository.InvitationRepository;
import com.psybergate.recruitment.reminder.repository.ReminderSendLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @Mock private InvitationRepository invitationRepository;
    @Mock private CandidateSubmissionRepository submissionRepository;
    @Mock private ReminderSendLogRepository reminderLogRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private ReminderServiceImpl service;

    private UUID invitationId;
    private UUID actorId;
    private CandidateInvitation invitation;

    private UUID submissionId;
    private CandidateSubmission submission;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "baseUrl", "http://localhost:4200");
        invitationId = UUID.randomUUID();
        submissionId = UUID.randomUUID();
        actorId = UUID.randomUUID();

        Candidate candidate = new Candidate();
        candidate.setFirstName("Jane");
        candidate.setLastName("Doe");
        candidate.setEmail("jane@test.com");

        Assessment assessment = new Assessment();
        assessment.setId(UUID.randomUUID());
        assessment.setTitle("Java Test");
        assessment.setTimeLimitMinutes(60);

        invitation = new CandidateInvitation();
        invitation.setId(invitationId);
        invitation.setCandidate(candidate);
        invitation.setAssessment(assessment);
        invitation.setInvitationToken("test-token-abc");
        invitation.setExpiresAt(Instant.now().plus(2, ChronoUnit.DAYS));

        submission = new CandidateSubmission();
        submission.setId(submissionId);
        submission.setInvitationId(invitationId);
        submission.setStatus(SubmissionStatus.IN_PROGRESS);
        submission.setStartedAt(Instant.now().minusSeconds(600));
    }

    @Test
    void sendManualReminder_noSubmissionYet_sendsEmailAndLogsManual() {
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));
        when(submissionRepository.findByInvitationId(invitationId)).thenReturn(Optional.empty());
        when(reminderLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReminderSendLog result = service.sendManualReminder(invitationId, actorId);

        verify(emailService).sendReminder(any(), any(), any(), any());
        assertThat(result.getSendType()).isEqualTo(ReminderSendType.MANUAL);
        assertThat(result.getSentBy()).isEqualTo(actorId);
    }

    @Test
    void sendManualReminder_inProgressSubmission_sendsEmailAndLogsManual() {
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));
        when(submissionRepository.findByInvitationId(invitationId)).thenReturn(Optional.of(submission));
        when(reminderLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReminderSendLog result = service.sendManualReminder(invitationId, actorId);

        verify(emailService).sendReminder(any(), any(), any(), any());
        assertThat(result.getSendType()).isEqualTo(ReminderSendType.MANUAL);
    }

    @Test
    void sendManualReminder_submittedSubmission_throwsBadRequest() {
        submission.setStatus(SubmissionStatus.SUBMITTED);
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));
        when(submissionRepository.findByInvitationId(invitationId)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.sendManualReminder(invitationId, actorId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already completed");

        verify(emailService, never()).sendReminder(any(), any(), any(), any());
        verify(reminderLogRepository, never()).save(any());
    }

    @Test
    void sendManualReminder_autoSubmittedSubmission_throwsBadRequest() {
        submission.setStatus(SubmissionStatus.AUTO_SUBMITTED);
        when(invitationRepository.findById(invitationId)).thenReturn(Optional.of(invitation));
        when(submissionRepository.findByInvitationId(invitationId)).thenReturn(Optional.of(submission));

        assertThatThrownBy(() -> service.sendManualReminder(invitationId, actorId))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void sendAutomatedReminders_withinWindow_sendsEmailAndLogsAutomated() {
        Assessment assessment = invitation.getAssessment();
        assessment.setReminderDaysBeforeDeadline(2);
        // expiresAt is 2 days from now → threshold = now, so now >= threshold → should send
        invitation.setExpiresAt(Instant.now().plus(2, ChronoUnit.DAYS));

        when(invitationRepository.findSentWithReminderWindowAndIncomplete(any()))
                .thenReturn(List.of(invitation));
        when(reminderLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.sendAutomatedReminders();

        verify(emailService).sendReminder(any(), any(), any(), any());
        verify(reminderLogRepository).save(argThat(log -> log.getSendType() == ReminderSendType.AUTOMATED
                && log.getSentBy() == null));
    }

    @Test
    void sendAutomatedReminders_outsideWindow_doesNotSend() {
        Assessment assessment = invitation.getAssessment();
        assessment.setReminderDaysBeforeDeadline(1);
        // expiresAt is 3 days from now, reminderDaysBeforeDeadline=1 → threshold is 2 days from now → still in future
        invitation.setExpiresAt(Instant.now().plus(3, ChronoUnit.DAYS));

        when(invitationRepository.findSentWithReminderWindowAndIncomplete(any()))
                .thenReturn(List.of(invitation));

        service.sendAutomatedReminders();

        verify(emailService, never()).sendReminder(any(), any(), any(), any());
        verify(reminderLogRepository, never()).save(any());
    }
}
