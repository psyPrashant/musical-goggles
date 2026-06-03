package com.psybergate.recruitment.dashboard;

import com.psybergate.recruitment.dashboard.dto.DashboardStats;
import com.psybergate.recruitment.domain.FlagStatus;
import com.psybergate.recruitment.domain.SubmissionStatus;
import com.psybergate.recruitment.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private InvitationRepository invitationRepository;
    @Mock private CandidateSubmissionRepository submissionRepository;
    @Mock private AnswerScoreRepository answerScoreRepository;
    @Mock private CandidateRepository candidateRepository;
    @Mock private SubmissionFlagRepository flagRepository;

    @InjectMocks
    private DashboardServiceImpl service;

    private void stubDefaults() {
        when(invitationRepository.countByStatusInAndExpiresAtAfter(any(), any())).thenReturn(0L);
        when(submissionRepository.countPendingReviews(any())).thenReturn(0L);
        when(answerScoreRepository.averageScoreSince(any())).thenReturn(null);
        when(invitationRepository.countInvitedWithoutSubmission()).thenReturn(0L);
        when(submissionRepository.countByStatus(SubmissionStatus.IN_PROGRESS)).thenReturn(0L);
        when(submissionRepository.countCompleted(any())).thenReturn(0L);
        when(invitationRepository.findRecentSent(any())).thenReturn(List.of());
        when(submissionRepository.findRecentByStatusIn(any(), any())).thenReturn(List.of());
        when(candidateRepository.findAllById(any())).thenReturn(List.of());
    }

    @Test
    void getStats_withOpenFlags_returnsCorrectFlaggedCount() {
        stubDefaults();
        when(flagRepository.countDistinctSubmissionIdByStatusIn(
                argThat((Collection<FlagStatus> c) ->
                        c.contains(FlagStatus.FLAGGED) && c.contains(FlagStatus.UNDER_REVIEW))))
                .thenReturn(3L);

        DashboardStats stats = service.getStats();

        assertThat(stats.pipeline().flagged()).isEqualTo(3);
    }

    @Test
    void getStats_withNoOpenFlags_flaggedIsZero() {
        stubDefaults();
        when(flagRepository.countDistinctSubmissionIdByStatusIn(any())).thenReturn(0L);

        DashboardStats stats = service.getStats();

        assertThat(stats.pipeline().flagged()).isEqualTo(0);
    }

    @Test
    void getStats_submissionWithTwoOpenFlags_countedOnce() {
        stubDefaults();
        // JPQL DISTINCT ensures a submission with 2 flags is counted once — the query handles it;
        // here we verify the service passes the count through correctly.
        when(flagRepository.countDistinctSubmissionIdByStatusIn(any())).thenReturn(1L);

        DashboardStats stats = service.getStats();

        assertThat(stats.pipeline().flagged()).isEqualTo(1);
    }
}
