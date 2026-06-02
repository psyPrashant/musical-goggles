package com.psybergate.recruitment.flag;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.flag.dto.FlagResponse;
import com.psybergate.recruitment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissionFlagServiceTest {

    @Mock private SubmissionFlagRepository flagRepository;
    @Mock private SubmissionFlagAuditRepository auditRepository;
    @Mock private CandidateSubmissionRepository submissionRepository;
    @Mock private CandidateRepository candidateRepository;
    @Mock private AssessmentRepository assessmentRepository;

    @InjectMocks
    private SubmissionFlagServiceImpl service;

    private UUID submissionId;
    private UUID actorId;
    private CandidateSubmission submission;

    @BeforeEach
    void setUp() {
        submissionId = UUID.randomUUID();
        actorId = UUID.randomUUID();
        submission = new CandidateSubmission();
        submission.setId(submissionId);
    }

    @Test
    void createFlag_happyPath_returnsFlagWithFlaggedStatus() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
        when(flagRepository.existsBySubmissionIdAndStatusIn(eq(submissionId), any())).thenReturn(false);

        SubmissionFlag saved = new SubmissionFlag();
        saved.setId(UUID.randomUUID());
        saved.setSubmissionId(submissionId);
        saved.setReason(FlagReason.COPIED_ANSWERS);
        saved.setStatus(FlagStatus.FLAGGED);
        saved.setCreatedBy(actorId);
        when(flagRepository.save(any())).thenReturn(saved);

        FlagResponse response = service.createFlag(submissionId, FlagReason.COPIED_ANSWERS, actorId, "actor");

        assertThat(response.status()).isEqualTo(FlagStatus.FLAGGED);
        assertThat(response.reason()).isEqualTo(FlagReason.COPIED_ANSWERS);
        verify(auditRepository).save(any(SubmissionFlagAudit.class));
    }

    @Test
    void createFlag_duplicateOpenFlag_throws409() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
        when(flagRepository.existsBySubmissionIdAndStatusIn(eq(submissionId), any())).thenReturn(true);

        assertThatThrownBy(() -> service.createFlag(submissionId, FlagReason.TIMING_ANOMALY, actorId, "actor"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("open flag");
    }

    @Test
    void transitionFlag_invalidTransition_throws422() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(submissionId);
        flag.setStatus(FlagStatus.FLAGGED);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));

        // FLAGGED → RESOLVED is not allowed (must go through UNDER_REVIEW)
        assertThatThrownBy(() -> service.transitionFlag(submissionId, flagId, FlagStatus.RESOLVED,
                "notes", actorId, "actor"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid transition");
    }

    @Test
    void transitionFlag_resolveWithoutNotes_throws400() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(submissionId);
        flag.setStatus(FlagStatus.UNDER_REVIEW);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));

        assertThatThrownBy(() -> service.transitionFlag(submissionId, flagId, FlagStatus.RESOLVED,
                null, actorId, "actor"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Resolution notes");
    }

    @Test
    void transitionFlag_validTransitionUnderReview_savesAndWritesAudit() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(submissionId);
        flag.setStatus(FlagStatus.FLAGGED);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));
        when(flagRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.transitionFlag(submissionId, flagId, FlagStatus.UNDER_REVIEW, null, actorId, "actor");

        verify(auditRepository).save(argThat(a ->
                a.getAction().equals("STATUS_CHANGED") &&
                a.getFromStatus() == FlagStatus.FLAGGED &&
                a.getToStatus() == FlagStatus.UNDER_REVIEW));
    }
}
