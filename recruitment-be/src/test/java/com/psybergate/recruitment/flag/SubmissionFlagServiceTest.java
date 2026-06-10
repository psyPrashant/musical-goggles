package com.psybergate.recruitment.flag;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.flag.dto.FlagAuditResponse;
import com.psybergate.recruitment.flag.dto.FlagListItemResponse;
import com.psybergate.recruitment.flag.dto.FlagResponse;
import com.psybergate.recruitment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
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

    // ── createFlag ────────────────────────────────────────────────────────────

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
        // verify all fields are set on the entity passed to save (kills setter-removal mutants)
        verify(flagRepository).save(argThat(f ->
                submissionId.equals(f.getSubmissionId()) &&
                f.getReason() == FlagReason.COPIED_ANSWERS &&
                f.getStatus() == FlagStatus.FLAGGED &&
                actorId.equals(f.getCreatedBy())));
    }

    @Test
    void createFlag_submissionNotFound_throws404() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createFlag(submissionId, FlagReason.TIMING_ANOMALY, actorId, "actor"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
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
    void createFlag_auditWrittenWithCreatedActionAndCorrectFlagId() {
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
        when(flagRepository.existsBySubmissionIdAndStatusIn(eq(submissionId), any())).thenReturn(false);

        UUID savedFlagId = UUID.randomUUID();
        SubmissionFlag saved = new SubmissionFlag();
        saved.setId(savedFlagId);
        saved.setSubmissionId(submissionId);
        saved.setReason(FlagReason.COPIED_ANSWERS);
        saved.setStatus(FlagStatus.FLAGGED);
        saved.setCreatedBy(actorId);
        when(flagRepository.save(any())).thenReturn(saved);

        service.createFlag(submissionId, FlagReason.COPIED_ANSWERS, actorId, "actor");

        verify(auditRepository).save(argThat(a ->
                savedFlagId.equals(a.getFlagId()) &&
                "CREATED".equals(a.getAction()) &&
                a.getFromStatus() == null &&
                a.getToStatus() == FlagStatus.FLAGGED &&
                actorId.equals(a.getActorUserId()) &&
                "actor".equals(a.getActorUsername())));
    }

    // ── transitionFlag ────────────────────────────────────────────────────────

    @Test
    void transitionFlag_flagNotFound_throws404() {
        UUID flagId = UUID.randomUUID();
        when(flagRepository.findById(flagId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.transitionFlag(submissionId, flagId, FlagStatus.UNDER_REVIEW,
                null, actorId, "actor"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void transitionFlag_ownershipMismatch_throws404() {
        UUID flagId = UUID.randomUUID();
        UUID differentSubmissionId = UUID.randomUUID();

        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(differentSubmissionId);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));

        assertThatThrownBy(() -> service.transitionFlag(submissionId, flagId, FlagStatus.UNDER_REVIEW,
                null, actorId, "actor"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
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
    void transitionFlag_dismissedWithBlankNotes_throws400() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(submissionId);
        flag.setStatus(FlagStatus.UNDER_REVIEW);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));

        assertThatThrownBy(() -> service.transitionFlag(submissionId, flagId, FlagStatus.DISMISSED,
                "   ", actorId, "actor"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
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

    @Test
    void transitionFlag_validResolveWithNotes_savesAndAudits() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(submissionId);
        flag.setStatus(FlagStatus.UNDER_REVIEW);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));
        when(flagRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FlagResponse response = service.transitionFlag(submissionId, flagId, FlagStatus.RESOLVED,
                "Resolved after review", actorId, "actor");

        assertThat(response.status()).isEqualTo(FlagStatus.RESOLVED);
        verify(flagRepository).save(argThat(f -> "Resolved after review".equals(f.getResolutionNotes())));
        verify(auditRepository).save(argThat(a ->
                a.getFromStatus() == FlagStatus.UNDER_REVIEW &&
                a.getToStatus() == FlagStatus.RESOLVED));
    }

    @Test
    void transitionFlag_validDismissWithNotes_savesAndAudits() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(submissionId);
        flag.setStatus(FlagStatus.UNDER_REVIEW);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));
        when(flagRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FlagResponse response = service.transitionFlag(submissionId, flagId, FlagStatus.DISMISSED,
                "Not credible", actorId, "actor");

        assertThat(response.status()).isEqualTo(FlagStatus.DISMISSED);
        verify(auditRepository).save(argThat(a ->
                a.getFromStatus() == FlagStatus.UNDER_REVIEW &&
                a.getToStatus() == FlagStatus.DISMISSED));
    }

    // ── getAuditTrail ─────────────────────────────────────────────────────────

    @Test
    void getAuditTrail_happyPath_returnsMappedList() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(submissionId);

        Instant occurredAt = Instant.now();
        SubmissionFlagAudit audit = new SubmissionFlagAudit();
        audit.setId(UUID.randomUUID());
        audit.setFlagId(flagId);
        audit.setAction("CREATED");
        audit.setFromStatus(null);
        audit.setToStatus(FlagStatus.FLAGGED);
        audit.setActorUserId(actorId);
        audit.setActorUsername("actor");
        audit.setOccurredAt(occurredAt);

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));
        when(auditRepository.findByFlagIdOrderByOccurredAtAsc(flagId)).thenReturn(List.of(audit));

        List<FlagAuditResponse> result = service.getAuditTrail(submissionId, flagId);

        assertThat(result).hasSize(1);
        FlagAuditResponse resp = result.get(0);
        assertThat(resp.action()).isEqualTo("CREATED");
        assertThat(resp.fromStatus()).isNull();
        assertThat(resp.toStatus()).isEqualTo(FlagStatus.FLAGGED);
        assertThat(resp.actorUserId()).isEqualTo(actorId);
        assertThat(resp.actorUsername()).isEqualTo("actor");
        assertThat(resp.occurredAt()).isEqualTo(occurredAt);
    }

    @Test
    void getAuditTrail_flagNotFound_throws404() {
        UUID flagId = UUID.randomUUID();
        when(flagRepository.findById(flagId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getAuditTrail(submissionId, flagId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void getAuditTrail_ownershipMismatch_throws404() {
        UUID flagId = UUID.randomUUID();
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(flagId);
        flag.setSubmissionId(UUID.randomUUID()); // different submission

        when(flagRepository.findById(flagId)).thenReturn(Optional.of(flag));

        assertThatThrownBy(() -> service.getAuditTrail(submissionId, flagId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    // ── getFlagsForCandidate ──────────────────────────────────────────────────

    @Test
    void getFlagsForCandidate_candidateNotFound_throws404() {
        UUID candidateId = UUID.randomUUID();
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getFlagsForCandidate(candidateId))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void getFlagsForCandidate_noSubmissions_returnsEmptyList() {
        UUID candidateId = UUID.randomUUID();
        Candidate candidate = new Candidate();
        candidate.setId(candidateId);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(submissionRepository.findByCandidateId(candidateId)).thenReturn(List.of());

        List<FlagListItemResponse> result = service.getFlagsForCandidate(candidateId);

        assertThat(result).isEmpty();
        verifyNoInteractions(flagRepository);
    }

    @Test
    void getFlagsForCandidate_withSubmissions_returnsEnrichedList() {
        UUID candidateId = UUID.randomUUID();
        UUID assessmentId = UUID.randomUUID();

        Candidate candidate = new Candidate();
        candidate.setId(candidateId);
        candidate.setFirstName("Jane");
        candidate.setLastName("Doe");

        CandidateSubmission sub = submissionFor(submissionId, candidateId, assessmentId);

        Assessment assessment = new Assessment();
        assessment.setId(assessmentId);
        assessment.setTitle("Java Test");

        SubmissionFlag flag = flagWithSubmission(submissionId, FlagReason.COPIED_ANSWERS);

        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(submissionRepository.findByCandidateId(candidateId)).thenReturn(List.of(sub));
        when(assessmentRepository.findAllById(any())).thenReturn(List.of(assessment));
        when(flagRepository.findAll()).thenReturn(List.of(flag));

        List<FlagListItemResponse> result = service.getFlagsForCandidate(candidateId);

        assertThat(result).hasSize(1);
        FlagListItemResponse item = result.get(0);
        assertThat(item.submissionId()).isEqualTo(submissionId);
        assertThat(item.candidateId()).isEqualTo(candidateId);
        assertThat(item.candidateName()).isEqualTo("Jane Doe");
        assertThat(item.assessmentName()).isEqualTo("Java Test");
        assertThat(item.reason()).isEqualTo(FlagReason.COPIED_ANSWERS);
    }

    // ── getAllFlags ───────────────────────────────────────────────────────────

    @Test
    void getAllFlags_noFlags_returnsEmptyList() {
        when(flagRepository.findAll()).thenReturn(List.of());

        List<FlagListItemResponse> result = service.getAllFlags(null, null, null, null);

        assertThat(result).isEmpty();
        verifyNoInteractions(submissionRepository);
    }

    @Test
    void getAllFlags_withReasonFilter_returnsOnlyMatchingFlagsWithCorrectContent() {
        UUID submissionId1 = UUID.randomUUID();
        UUID submissionId2 = UUID.randomUUID();
        UUID assessmentId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        SubmissionFlag matchingFlag = flagWithSubmission(submissionId1, FlagReason.COPIED_ANSWERS);
        SubmissionFlag nonMatchingFlag = flagWithSubmission(submissionId2, FlagReason.TIMING_ANOMALY);

        CandidateSubmission sub1 = submissionFor(submissionId1, candidateId, assessmentId);
        CandidateSubmission sub2 = submissionFor(submissionId2, candidateId, assessmentId);

        Assessment assessment = new Assessment();
        assessment.setId(assessmentId);
        assessment.setTitle("Java Assessment");

        Candidate candidate = new Candidate();
        candidate.setId(candidateId);
        candidate.setFirstName("Jane");
        candidate.setLastName("Doe");

        when(flagRepository.findAll()).thenReturn(List.of(matchingFlag, nonMatchingFlag));
        when(submissionRepository.findAllById(any())).thenReturn(List.of(sub1, sub2));
        when(assessmentRepository.findAllById(any())).thenReturn(List.of(assessment));
        when(candidateRepository.findAllById(any())).thenReturn(List.of(candidate));

        List<FlagListItemResponse> result = service.getAllFlags(FlagReason.COPIED_ANSWERS, null, null, null);

        assertThat(result).hasSize(1);
        FlagListItemResponse item = result.get(0);
        assertThat(item.reason()).isEqualTo(FlagReason.COPIED_ANSWERS);
        assertThat(item.candidateName()).isEqualTo("Jane Doe");
        assertThat(item.assessmentName()).isEqualTo("Java Assessment");
        assertThat(item.candidateId()).isEqualTo(candidateId);
    }

    @Test
    void getAllFlags_withAssessmentIdFilter_returnsOnlyFlagsForThatAssessment() {
        UUID subIdA = UUID.randomUUID();
        UUID subIdB = UUID.randomUUID();
        UUID assessmentA = UUID.randomUUID();
        UUID assessmentB = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        SubmissionFlag flagA = flagWithSubmission(subIdA, FlagReason.COPIED_ANSWERS);
        SubmissionFlag flagB = flagWithSubmission(subIdB, FlagReason.COPIED_ANSWERS);

        CandidateSubmission subA = submissionFor(subIdA, candidateId, assessmentA);
        CandidateSubmission subB = submissionFor(subIdB, candidateId, assessmentB);

        Assessment asmA = new Assessment(); asmA.setId(assessmentA); asmA.setTitle("Assessment A");
        Assessment asmB = new Assessment(); asmB.setId(assessmentB); asmB.setTitle("Assessment B");

        Candidate candidate = new Candidate();
        candidate.setId(candidateId);
        candidate.setFirstName("John");
        candidate.setLastName("Smith");

        when(flagRepository.findAll()).thenReturn(List.of(flagA, flagB));
        when(submissionRepository.findAllById(any())).thenReturn(List.of(subA, subB));
        when(assessmentRepository.findAllById(any())).thenReturn(List.of(asmA, asmB));
        when(candidateRepository.findAllById(any())).thenReturn(List.of(candidate));

        List<FlagListItemResponse> result = service.getAllFlags(null, assessmentA, null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).assessmentName()).isEqualTo("Assessment A");
    }

    @Test
    void getAllFlags_withDateRangeFilter_excludesFlagsOutsideRange() {
        UUID sub1Id = UUID.randomUUID();
        UUID sub2Id = UUID.randomUUID();
        UUID sub3Id = UUID.randomUUID();
        UUID assessmentId = UUID.randomUUID();
        UUID candidateId = UUID.randomUUID();

        LocalDate fromDate = LocalDate.of(2026, 1, 10);
        LocalDate toDate   = LocalDate.of(2026, 1, 20);

        SubmissionFlag flagInRange = flagWithSubmission(sub1Id, FlagReason.COPIED_ANSWERS);
        flagInRange.setCreatedAt(LocalDate.of(2026, 1, 15).atStartOfDay().toInstant(ZoneOffset.UTC));

        SubmissionFlag flagBefore = flagWithSubmission(sub2Id, FlagReason.TIMING_ANOMALY);
        flagBefore.setCreatedAt(LocalDate.of(2026, 1, 5).atStartOfDay().toInstant(ZoneOffset.UTC));

        SubmissionFlag flagAfter = flagWithSubmission(sub3Id, FlagReason.COPIED_ANSWERS);
        flagAfter.setCreatedAt(LocalDate.of(2026, 1, 25).atStartOfDay().toInstant(ZoneOffset.UTC));

        CandidateSubmission sub1 = submissionFor(sub1Id, candidateId, assessmentId);
        CandidateSubmission sub2 = submissionFor(sub2Id, candidateId, assessmentId);
        CandidateSubmission sub3 = submissionFor(sub3Id, candidateId, assessmentId);

        Assessment assessment = new Assessment();
        assessment.setId(assessmentId);
        assessment.setTitle("Test Assessment");

        Candidate candidate = new Candidate();
        candidate.setId(candidateId);
        candidate.setFirstName("Jane");
        candidate.setLastName("Doe");

        when(flagRepository.findAll()).thenReturn(List.of(flagInRange, flagBefore, flagAfter));
        when(submissionRepository.findAllById(any())).thenReturn(List.of(sub1, sub2, sub3));
        when(assessmentRepository.findAllById(any())).thenReturn(List.of(assessment));
        when(candidateRepository.findAllById(any())).thenReturn(List.of(candidate));

        List<FlagListItemResponse> result = service.getAllFlags(null, null, fromDate, toDate);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).submissionId()).isEqualTo(sub1Id);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private SubmissionFlag flagWithSubmission(UUID submissionId, FlagReason reason) {
        SubmissionFlag flag = new SubmissionFlag();
        flag.setId(UUID.randomUUID());
        flag.setSubmissionId(submissionId);
        flag.setReason(reason);
        flag.setStatus(FlagStatus.FLAGGED);
        flag.setCreatedBy(actorId);
        flag.setCreatedAt(Instant.now());
        return flag;
    }

    private CandidateSubmission submissionFor(UUID submissionId, UUID candidateId, UUID assessmentId) {
        CandidateSubmission sub = new CandidateSubmission();
        sub.setId(submissionId);
        sub.setCandidateId(candidateId);
        sub.setAssessmentId(assessmentId);
        return sub;
    }
}
