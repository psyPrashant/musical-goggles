package com.psybergate.recruitment.dashboard;

import com.psybergate.recruitment.dashboard.dto.ActivityEvent;
import com.psybergate.recruitment.dashboard.dto.DashboardStats;
import com.psybergate.recruitment.dashboard.dto.PipelineStats;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final List<InvitationStatus> ACTIVE_INVITATION_STATUSES =
            List.of(InvitationStatus.PENDING, InvitationStatus.SENT);

    private static final List<SubmissionStatus> SUBMITTED_STATUSES =
            List.of(SubmissionStatus.SUBMITTED, SubmissionStatus.AUTO_SUBMITTED);

    private static final List<SubmissionStatus> ALL_SUBMISSION_STATUSES =
            List.of(SubmissionStatus.IN_PROGRESS, SubmissionStatus.SUBMITTED, SubmissionStatus.AUTO_SUBMITTED);

    @Autowired private InvitationRepository invitationRepository;
    @Autowired private CandidateSubmissionRepository submissionRepository;
    @Autowired private AnswerScoreRepository answerScoreRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private SubmissionFlagRepository flagRepository;

    private static final List<FlagStatus> OPEN_FLAG_STATUSES =
            List.of(FlagStatus.FLAGGED, FlagStatus.UNDER_REVIEW);

    @Override
    public DashboardStats getStats() {
        Instant now = Instant.now();
        Instant thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);

        int activeCandidates = (int) invitationRepository
                .countByStatusInAndExpiresAtAfter(ACTIVE_INVITATION_STATUSES, now);

        int pendingReviews = (int) submissionRepository.countPendingReviews(SUBMITTED_STATUSES);

        Double averageScore = answerScoreRepository.averageScoreSince(thirtyDaysAgo);

        PipelineStats pipeline = buildPipeline();

        List<ActivityEvent> recentActivity = buildRecentActivity();

        return new DashboardStats(activeCandidates, pendingReviews, averageScore, pipeline, recentActivity);
    }

    private PipelineStats buildPipeline() {
        int invited = (int) invitationRepository.countInvitedWithoutSubmission();
        int inProgress = (int) submissionRepository.countByStatus(SubmissionStatus.IN_PROGRESS);
        int pendingReview = (int) submissionRepository.countPendingReviews(SUBMITTED_STATUSES);
        int completed = (int) submissionRepository.countCompleted(SUBMITTED_STATUSES);
        int flagged = (int) flagRepository.countDistinctSubmissionIdByStatusIn(OPEN_FLAG_STATUSES);
        return new PipelineStats(invited, inProgress, pendingReview, completed, flagged);
    }

    private List<ActivityEvent> buildRecentActivity() {
        var top10 = PageRequest.of(0, 10);

        List<CandidateInvitation> recentInvitations = invitationRepository.findRecentSent(top10);
        List<CandidateSubmission> recentSubmissions =
                submissionRepository.findRecentByStatusIn(ALL_SUBMISSION_STATUSES, top10);

        Set<UUID> candidateIds = recentSubmissions.stream()
                .map(CandidateSubmission::getCandidateId)
                .collect(Collectors.toSet());
        Map<UUID, Candidate> candidateMap = candidateRepository.findAllById(candidateIds).stream()
                .collect(Collectors.toMap(Candidate::getId, c -> c));

        List<ActivityEvent> events = new ArrayList<>();

        for (CandidateInvitation inv : recentInvitations) {
            String name = fullName(inv.getCandidate());
            events.add(new ActivityEvent(
                    "INVITATION_SENT",
                    name + " invited to " + inv.getAssessment().getTitle(),
                    "Awaiting response",
                    inv.getCreatedAt(),
                    null));
        }

        for (CandidateSubmission sub : recentSubmissions) {
            Candidate candidate = candidateMap.get(sub.getCandidateId());
            String name = candidate != null ? fullName(candidate) : "Candidate";
            if (sub.getStatus() == SubmissionStatus.IN_PROGRESS) {
                events.add(new ActivityEvent(
                        "SUBMISSION_STARTED",
                        name + " started an assessment",
                        "In progress",
                        sub.getCreatedAt(),
                        sub.getId()));
            } else {
                events.add(new ActivityEvent(
                        "SUBMISSION_COMPLETED",
                        name + " submitted an assessment",
                        "Ready for review",
                        sub.getCreatedAt(),
                        sub.getId()));
            }
        }

        return events.stream()
                .sorted(Comparator.comparing(ActivityEvent::occurredAt).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private String fullName(Candidate c) {
        return c.getFirstName() + " " + c.getLastName();
    }
}
