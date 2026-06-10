package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateHistoryItemResponse;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateHistoryServiceTest {

    @Mock private CandidateRepository candidateRepository;
    @Mock private UserRepository userRepository;
    @Mock private InvitationRepository invitationRepository;
    @Mock private CandidateSubmissionRepository submissionRepository;
    @Mock private CandidateAnswerRepository answerRepository;
    @Mock private AnswerScoreRepository scoreRepository;

    @InjectMocks private CandidateServiceImpl service;

    private UUID candidateId;
    private Candidate candidate;

    @BeforeEach
    void setUp() {
        candidateId = UUID.randomUUID();
        candidate = new Candidate();
        candidate.setId(candidateId);
        candidate.setFirstName("Test");
        candidate.setLastName("User");
        candidate.setEmail("test@example.com");
    }

    @Test
    void getAssessmentHistory_candidateNotFound_throws404() {
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getAssessmentHistory(candidateId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Candidate not found");
    }

    @Test
    void getAssessmentHistory_noInvitations_returnsEmpty() {
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)).thenReturn(List.of());

        List<CandidateHistoryItemResponse> result = service.getAssessmentHistory(candidateId);
        assertThat(result).isEmpty();
    }

    @Test
    void getAssessmentHistory_pendingInvitation_returnsPendingStatus() {
        Assessment assessment = buildAssessment();
        CandidateInvitation invitation = buildInvitation(assessment, Instant.now().plusSeconds(86400));

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId))
                .thenReturn(List.of(invitation));
        when(submissionRepository.findByInvitationId(invitation.getId())).thenReturn(Optional.empty());

        List<CandidateHistoryItemResponse> result = service.getAssessmentHistory(candidateId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo("PENDING");
        assertThat(result.get(0).totalScore()).isNull();
        assertThat(result.get(0).submissionId()).isNull();
    }

    @Test
    void getAssessmentHistory_cancelledInvitation_returnsCANCELLED() {
        Assessment assessment = buildAssessment();
        CandidateInvitation invitation = buildInvitation(assessment, Instant.now().plusSeconds(86400));
        invitation.setStatus(InvitationStatus.CANCELLED);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId))
                .thenReturn(List.of(invitation));
        when(submissionRepository.findByInvitationId(invitation.getId())).thenReturn(Optional.empty());

        List<CandidateHistoryItemResponse> result = service.getAssessmentHistory(candidateId);

        assertThat(result).hasSize(1);
        // kills mutation removing the CANCELLED check (which would fall through to EXPIRED/PENDING)
        assertThat(result.get(0).status()).isEqualTo("CANCELLED");
    }

    @Test
    void getAssessmentHistory_expiredInvitation_returnsExpiredStatus() {
        Assessment assessment = buildAssessment();
        CandidateInvitation invitation = buildInvitation(assessment, Instant.now().minusSeconds(1));

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId))
                .thenReturn(List.of(invitation));
        when(submissionRepository.findByInvitationId(invitation.getId())).thenReturn(Optional.empty());

        List<CandidateHistoryItemResponse> result = service.getAssessmentHistory(candidateId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo("EXPIRED");
    }

    @Test
    void getAssessmentHistory_completedAndScored_returnsTotalScore() {
        Assessment assessment = buildAssessment();
        CandidateInvitation invitation = buildInvitation(assessment, Instant.now().plusSeconds(86400));
        CandidateSubmission submission = buildSubmission(invitation);

        CandidateAnswer answer = new CandidateAnswer();
        answer.setId(UUID.randomUUID());
        answer.setSubmissionId(submission.getId());

        AnswerScore score = new AnswerScore();
        score.setCandidateAnswerId(answer.getId());
        score.setScore(8);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId))
                .thenReturn(List.of(invitation));
        when(submissionRepository.findByInvitationId(invitation.getId())).thenReturn(Optional.of(submission));
        when(answerRepository.findBySubmissionId(submission.getId())).thenReturn(List.of(answer));
        when(scoreRepository.findByCandidateAnswerIdIn(Set.of(answer.getId()))).thenReturn(List.of(score));

        List<CandidateHistoryItemResponse> result = service.getAssessmentHistory(candidateId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).status()).isEqualTo("SUBMITTED");
        assertThat(result.get(0).totalScore()).isEqualTo(8);
        assertThat(result.get(0).markingStatus()).isEqualTo("FULLY_MARKED");
    }

    @Test
    void getAssessmentHistory_completedUnscored_returnsPendingReview() {
        Assessment assessment = buildAssessment();
        CandidateInvitation invitation = buildInvitation(assessment, Instant.now().plusSeconds(86400));
        CandidateSubmission submission = buildSubmission(invitation);

        CandidateAnswer answer = new CandidateAnswer();
        answer.setId(UUID.randomUUID());
        answer.setSubmissionId(submission.getId());

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId))
                .thenReturn(List.of(invitation));
        when(submissionRepository.findByInvitationId(invitation.getId())).thenReturn(Optional.of(submission));
        when(answerRepository.findBySubmissionId(submission.getId())).thenReturn(List.of(answer));
        when(scoreRepository.findByCandidateAnswerIdIn(Set.of(answer.getId()))).thenReturn(List.of());

        List<CandidateHistoryItemResponse> result = service.getAssessmentHistory(candidateId);

        assertThat(result.get(0).markingStatus()).isEqualTo("PENDING_REVIEW");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Assessment buildAssessment() {
        Assessment a = new Assessment();
        a.setId(UUID.randomUUID());
        a.setTitle("Java Developer Assessment");
        return a;
    }

    private CandidateInvitation buildInvitation(Assessment assessment, Instant expiresAt) {
        CandidateInvitation inv = new CandidateInvitation();
        inv.setId(UUID.randomUUID());
        inv.setCandidate(candidate);
        inv.setAssessment(assessment);
        inv.setInvitationToken("tok-" + UUID.randomUUID());
        inv.setExpiresAt(expiresAt);
        return inv;
    }

    private CandidateSubmission buildSubmission(CandidateInvitation invitation) {
        CandidateSubmission sub = new CandidateSubmission();
        sub.setId(UUID.randomUUID());
        sub.setCandidateId(candidateId);
        sub.setAssessmentId(invitation.getAssessment().getId());
        sub.setInvitationId(invitation.getId());
        sub.setStatus(SubmissionStatus.SUBMITTED);
        sub.setStartedAt(Instant.now().minusSeconds(3600));
        sub.setSubmittedAt(Instant.now());
        return sub;
    }
}
