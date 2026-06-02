package com.psybergate.recruitment.reminder;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.*;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class ReminderControllerIntegrationTest extends AbstractIntegrationTest {

    @MockitoBean JavaMailSender mailSender;

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CandidateRepository candidateRepository;
    @Autowired AssessmentRepository assessmentRepository;
    @Autowired InvitationRepository invitationRepository;
    @Autowired CandidateSubmissionRepository submissionRepository;
    @Autowired ReminderSendLogRepository reminderLogRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private User recruiter;
    private Candidate candidate;
    private Assessment assessment;
    private CandidateInvitation invitation;
    private CandidateSubmission inProgressSubmission;
    private String recruiterToken;

    @BeforeEach
    void setUp() {
        recruiter = new User();
        recruiter.setEmail("reminder-recruiter@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        recruiterToken = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);

        candidate = new Candidate();
        candidate.setFirstName("Reminder");
        candidate.setLastName("Tester");
        candidate.setEmail("reminder-candidate@integration.dev");
        candidate.setCreatedBy(recruiter);
        candidate = candidateRepository.save(candidate);

        assessment = new Assessment();
        assessment.setTitle("Reminder Test Assessment");
        assessment.setDescription("Test");
        assessment.setTimeLimitMinutes(60);
        assessment.setCreatedBy(recruiter);
        assessment = assessmentRepository.save(assessment);

        invitation = new CandidateInvitation();
        invitation.setCandidate(candidate);
        invitation.setAssessment(assessment);
        invitation.setInvitationToken("reminder-test-token-" + UUID.randomUUID());
        invitation.setStatus(InvitationStatus.SENT);
        invitation.setExpiresAt(Instant.now().plusSeconds(86_400));
        invitation = invitationRepository.save(invitation);

        inProgressSubmission = new CandidateSubmission();
        inProgressSubmission.setCandidateId(candidate.getId());
        inProgressSubmission.setAssessmentId(assessment.getId());
        inProgressSubmission.setInvitationId(invitation.getId());
        inProgressSubmission.setStatus(SubmissionStatus.IN_PROGRESS);
        inProgressSubmission.setStartedAt(Instant.now().minusSeconds(600));
        inProgressSubmission = submissionRepository.save(inProgressSubmission);
    }

    @AfterEach
    void tearDown() {
        reminderLogRepository.deleteAll();
        submissionRepository.deleteAll();
        invitationRepository.deleteAll();
        assessmentRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.findByEmail("reminder-recruiter@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void sendReminder_incompleteSubmission_returns201() throws Exception {
        mockMvc.perform(post("/api/invitations/{id}/reminders", invitation.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sendType").value("MANUAL"))
                .andExpect(jsonPath("$.sentBy").value(recruiter.getId().toString()));
    }

    @Test
    void sendReminder_completedSubmission_returns400() throws Exception {
        // Update the existing in-progress submission to SUBMITTED (avoids duplicate invitation_id)
        inProgressSubmission.setStatus(SubmissionStatus.SUBMITTED);
        inProgressSubmission.setSubmittedAt(Instant.now());
        submissionRepository.save(inProgressSubmission);

        mockMvc.perform(post("/api/invitations/{id}/reminders", invitation.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getReminderHistory_noHistory_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/invitations/{id}/reminders", invitation.getId())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getReminderHistory_afterSend_returnsSingleEntry() throws Exception {
        mockMvc.perform(post("/api/invitations/{id}/reminders", invitation.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/invitations/{id}/reminders", invitation.getId())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sendType").value("MANUAL"));
    }

    @Test
    void sendReminder_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/invitations/{id}/reminders", invitation.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
