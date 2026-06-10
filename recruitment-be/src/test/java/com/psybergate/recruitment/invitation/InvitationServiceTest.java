package com.psybergate.recruitment.invitation;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.email.EmailService;
import com.psybergate.recruitment.invitation.dto.InviteRequest;
import com.psybergate.recruitment.invitation.dto.InviteResponse;
import com.psybergate.recruitment.repository.*;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvitationServiceTest {

    @Mock private CandidateRepository candidateRepository;
    @Mock private AssessmentRepository assessmentRepository;
    @Mock private InvitationRepository invitationRepository;
    @Mock private CandidateSubmissionRepository submissionRepository;
    @Mock private JwtService jwtService;
    @Mock private EmailService emailService;

    @InjectMocks
    private InvitationServiceImpl service;

    private UUID candidateId;
    private UUID assessmentId;
    private Candidate candidate;
    private Assessment assessment;

    @BeforeEach
    void setUp() {
        candidateId = UUID.randomUUID();
        assessmentId = UUID.randomUUID();

        candidate = new Candidate();
        candidate.setId(candidateId);
        candidate.setFirstName("Jane");
        candidate.setLastName("Doe");
        candidate.setEmail("jane@example.com");

        assessment = new Assessment();
        assessment.setId(assessmentId);
        assessment.setTitle("Java Assessment");
        assessment.setStatus(AssessmentStatus.PUBLISHED);
        assessment.setTimeLimitMinutes(60);
    }

    // ── invite() guard conditions ─────────────────────────────────────────────

    @Test
    void invite_candidateNotFound_throws404() {
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void invite_blacklistedCandidate_throws409() {
        candidate.setBlacklisted(true);
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(e.getMessage()).contains("CANDIDATE_BLACKLISTED");
                });
    }

    @Test
    void invite_actionRequiredCandidate_throws409() {
        candidate.setActionRequired(true);
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(e.getMessage()).contains("CANDIDATE_ACTION_REQUIRED");
                });
    }

    @Test
    void invite_activeInviteExists_throws409() {
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.countActiveInvitationsByCandidate(candidateId)).thenReturn(1L);

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(e.getMessage()).contains("ACTIVE_INVITE_EXISTS");
                });
    }

    @Test
    void invite_assessmentNotFound_throws404() {
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.countActiveInvitationsByCandidate(candidateId)).thenReturn(0L);
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void invite_assessmentNotPublished_throws400() {
        assessment.setStatus(AssessmentStatus.DRAFT);
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.countActiveInvitationsByCandidate(candidateId)).thenReturn(0L);
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void invite_candidateAlreadyCompleted_throwsAssessmentAlreadyCompleted() {
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.countActiveInvitationsByCandidate(candidateId)).thenReturn(0L);
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(submissionRepository.existsByCandidateIdAndAssessmentIdAndStatusIn(
                eq(candidateId), eq(assessmentId), any())).thenReturn(true);

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(AssessmentAlreadyCompletedException.class);
    }

    @Test
    void invite_duplicatePendingInvite_throws409() {
        CandidateInvitation existing = new CandidateInvitation();
        existing.setStatus(InvitationStatus.PENDING);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.countActiveInvitationsByCandidate(candidateId)).thenReturn(0L);
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(submissionRepository.existsByCandidateIdAndAssessmentIdAndStatusIn(any(), any(), any())).thenReturn(false);
        when(invitationRepository.findByCandidate_IdAndAssessment_Id(candidateId, assessmentId))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(e.getMessage()).contains("DUPLICATE_INVITE");
                });
    }

    @Test
    void invite_duplicateSentInvite_throws409() {
        CandidateInvitation existing = new CandidateInvitation();
        existing.setStatus(InvitationStatus.SENT);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.countActiveInvitationsByCandidate(candidateId)).thenReturn(0L);
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(submissionRepository.existsByCandidateIdAndAssessmentIdAndStatusIn(any(), any(), any())).thenReturn(false);
        when(invitationRepository.findByCandidate_IdAndAssessment_Id(candidateId, assessmentId))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> {
                    assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(e.getMessage()).contains("DUPLICATE_INVITE");
                });
    }

    // ── invite() happy path ───────────────────────────────────────────────────

    @Test
    void invite_happyPath_savesInvitationWithCorrectFields() {
        setupHappyPathMocks();

        List<InvitationStatus> savedStatuses = new ArrayList<>();
        when(invitationRepository.save(any())).thenAnswer(inv -> {
            CandidateInvitation i = inv.getArgument(0);
            savedStatuses.add(i.getStatus());  // snapshot at call time
            if (i.getId() == null) i.setId(UUID.randomUUID());
            return i;
        });

        service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost");

        // First save: status must be PENDING (kills mutation that skips initial status)
        // Second save: status must be SENT (kills mutation that skips status update)
        assertThat(savedStatuses).containsExactly(InvitationStatus.PENDING, InvitationStatus.SENT);

        // Verify first save had the correct candidate and assessment
        verify(invitationRepository, atLeastOnce()).save(argThat(i ->
                candidate.equals(i.getCandidate()) && assessment.equals(i.getAssessment())));
    }

    @Test
    void invite_happyPath_returnsResponseWithLink() {
        setupHappyPathMocks();
        when(jwtService.generateCandidateToken(any(), any(), anyLong())).thenReturn("the-token");
        when(invitationRepository.save(any())).thenAnswer(inv -> {
            CandidateInvitation i = inv.getArgument(0);
            if (i.getId() == null) i.setId(UUID.randomUUID());
            return i;
        });

        InviteResponse response = service.invite(
                new InviteRequest(candidateId, assessmentId), "http://localhost");

        assertThat(response.invitationLink()).contains(assessmentId.toString());
        assertThat(response.token()).isEqualTo("the-token");
        assertThat(response.expiresAt()).isAfter(Instant.now());
    }

    @Test
    void invite_happyPath_emailSentWithCandidateAndAssessment() {
        setupHappyPathMocks();
        when(invitationRepository.save(any())).thenAnswer(inv -> {
            CandidateInvitation i = inv.getArgument(0);
            if (i.getId() == null) i.setId(UUID.randomUUID());
            return i;
        });

        service.invite(new InviteRequest(candidateId, assessmentId), "http://localhost");

        verify(emailService).sendInvitation(eq(candidate), eq(assessment), any(), any(), any());
    }

    // ── cancelInvitation() ────────────────────────────────────────────────────

    @Test
    void cancelInvitation_notFound_throws404() {
        UUID invId = UUID.randomUUID();
        when(invitationRepository.findById(invId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelInvitation(invId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void cancelInvitation_alreadyCancelled_throws400() {
        UUID invId = UUID.randomUUID();
        CandidateInvitation invitation = buildInvitation(invId, InvitationStatus.CANCELLED);
        when(invitationRepository.findById(invId)).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> service.cancelInvitation(invId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void cancelInvitation_completedStatus_throws400() {
        UUID invId = UUID.randomUUID();
        CandidateInvitation invitation = buildInvitation(invId, InvitationStatus.COMPLETED);
        when(invitationRepository.findById(invId)).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> service.cancelInvitation(invId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void cancelInvitation_sentStatus_savesAsCancelledAndSendsEmail() {
        UUID invId = UUID.randomUUID();
        CandidateInvitation invitation = buildInvitation(invId, InvitationStatus.SENT);
        when(invitationRepository.findById(invId)).thenReturn(Optional.of(invitation));
        when(invitationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.cancelInvitation(invId);

        verify(invitationRepository).save(argThat(i -> i.getStatus() == InvitationStatus.CANCELLED));
        verify(emailService).sendCancellation(eq(candidate), eq(assessment));
    }

    @Test
    void cancelInvitation_pendingStatus_savesAsCancelledAndSendsEmail() {
        UUID invId = UUID.randomUUID();
        CandidateInvitation invitation = buildInvitation(invId, InvitationStatus.PENDING);
        when(invitationRepository.findById(invId)).thenReturn(Optional.of(invitation));
        when(invitationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.cancelInvitation(invId);

        verify(invitationRepository).save(argThat(i -> i.getStatus() == InvitationStatus.CANCELLED));
        verify(emailService).sendCancellation(eq(candidate), eq(assessment));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void setupHappyPathMocks() {
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(invitationRepository.countActiveInvitationsByCandidate(candidateId)).thenReturn(0L);
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(submissionRepository.existsByCandidateIdAndAssessmentIdAndStatusIn(any(), any(), any())).thenReturn(false);
        when(invitationRepository.findByCandidate_IdAndAssessment_Id(candidateId, assessmentId))
                .thenReturn(Optional.empty());
        when(jwtService.generateCandidateToken(any(), any(), anyLong())).thenReturn("mock-token");
    }

    private CandidateInvitation buildInvitation(UUID id, InvitationStatus status) {
        CandidateInvitation inv = new CandidateInvitation();
        inv.setId(id);
        inv.setCandidate(candidate);
        inv.setAssessment(assessment);
        inv.setStatus(status);
        inv.setInvitationToken("tok-" + id);
        inv.setExpiresAt(Instant.now().plusSeconds(86400));
        return inv;
    }
}
