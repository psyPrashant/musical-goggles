package com.psybergate.recruitment.flag;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.flag.dto.*;
import com.psybergate.recruitment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SubmissionFlagServiceImpl implements SubmissionFlagService {

    private static final List<FlagStatus> OPEN_STATUSES = List.of(FlagStatus.FLAGGED, FlagStatus.UNDER_REVIEW);

    private static final Map<FlagStatus, Set<FlagStatus>> ALLOWED_TRANSITIONS = Map.of(
            FlagStatus.FLAGGED,      Set.of(FlagStatus.UNDER_REVIEW),
            FlagStatus.UNDER_REVIEW, Set.of(FlagStatus.RESOLVED, FlagStatus.DISMISSED)
    );

    @Autowired private SubmissionFlagRepository flagRepository;
    @Autowired private SubmissionFlagAuditRepository auditRepository;
    @Autowired private CandidateSubmissionRepository submissionRepository;
    @Autowired private CandidateRepository candidateRepository;
    @Autowired private AssessmentRepository assessmentRepository;

    @Override
    @Transactional
    public FlagResponse createFlag(UUID submissionId, FlagReason reason, UUID actorId, String actorUsername) {
        submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        if (flagRepository.existsBySubmissionIdAndStatusIn(submissionId, OPEN_STATUSES)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An open flag already exists for this submission");
        }

        SubmissionFlag flag = new SubmissionFlag();
        flag.setSubmissionId(submissionId);
        flag.setReason(reason);
        flag.setStatus(FlagStatus.FLAGGED);
        flag.setCreatedBy(actorId);
        flag = flagRepository.save(flag);

        writeAudit(flag.getId(), "CREATED", null, FlagStatus.FLAGGED, actorId, actorUsername);

        return toFlagResponse(flag);
    }

    @Override
    @Transactional
    public FlagResponse transitionFlag(UUID submissionId, UUID flagId, FlagStatus newStatus,
                                       String resolutionNotes, UUID actorId, String actorUsername) {
        SubmissionFlag flag = flagRepository.findById(flagId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flag not found"));

        if (!flag.getSubmissionId().equals(submissionId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Flag does not belong to this submission");
        }

        Set<FlagStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(flag.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Invalid transition from " + flag.getStatus() + " to " + newStatus);
        }

        if ((newStatus == FlagStatus.RESOLVED || newStatus == FlagStatus.DISMISSED)
                && (resolutionNotes == null || resolutionNotes.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resolution notes are required");
        }

        FlagStatus fromStatus = flag.getStatus();
        flag.setStatus(newStatus);
        if (resolutionNotes != null) flag.setResolutionNotes(resolutionNotes);
        flag = flagRepository.save(flag);

        writeAudit(flag.getId(), "STATUS_CHANGED", fromStatus, newStatus, actorId, actorUsername);

        return toFlagResponse(flag);
    }

    @Override
    public List<FlagAuditResponse> getAuditTrail(UUID submissionId, UUID flagId) {
        SubmissionFlag flag = flagRepository.findById(flagId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flag not found"));

        if (!flag.getSubmissionId().equals(submissionId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Flag does not belong to this submission");
        }

        return auditRepository.findByFlagIdOrderByOccurredAtAsc(flagId).stream()
                .map(a -> new FlagAuditResponse(
                        a.getId(), a.getAction(), a.getFromStatus(), a.getToStatus(),
                        a.getActorUserId(), a.getActorUsername(), a.getOccurredAt()))
                .toList();
    }

    @Override
    public List<FlagListItemResponse> getFlagsForCandidate(UUID candidateId) {
        candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        List<CandidateSubmission> submissions = submissionRepository.findByCandidateId(candidateId);
        if (submissions.isEmpty()) return List.of();

        Set<UUID> submissionIds = submissions.stream().map(CandidateSubmission::getId).collect(Collectors.toSet());
        Map<UUID, CandidateSubmission> submissionMap = submissions.stream()
                .collect(Collectors.toMap(CandidateSubmission::getId, Function.identity()));

        Set<UUID> assessmentIds = submissions.stream().map(CandidateSubmission::getAssessmentId).collect(Collectors.toSet());
        Map<UUID, String> assessmentNames = assessmentRepository.findAllById(assessmentIds).stream()
                .collect(Collectors.toMap(a -> a.getId(), a -> a.getTitle()));

        Candidate candidate = candidateRepository.findById(candidateId).orElseThrow();
        String candidateName = candidate.getFirstName() + " " + candidate.getLastName();

        return flagRepository.findAll().stream()
                .filter(f -> submissionIds.contains(f.getSubmissionId()))
                .sorted(Comparator.comparing(SubmissionFlag::getCreatedAt).reversed())
                .map(f -> {
                    CandidateSubmission sub = submissionMap.get(f.getSubmissionId());
                    String assessmentName = sub != null ? assessmentNames.getOrDefault(sub.getAssessmentId(), "Unknown") : "Unknown";
                    return new FlagListItemResponse(
                            f.getId(), f.getSubmissionId(), candidate.getId(), candidateName, assessmentName,
                            f.getReason(), f.getStatus(), f.getCreatedAt(),
                            candidate.isBlacklisted(), candidate.isActionRequired());
                })
                .toList();
    }

    @Override
    public List<FlagListItemResponse> getAllFlags(FlagReason reason, UUID assessmentId, LocalDate fromDate, LocalDate toDate) {
        List<SubmissionFlag> flags = flagRepository.findAll();

        // Resolve submission and assessment info for enrichment
        Set<UUID> submissionIds = flags.stream().map(SubmissionFlag::getSubmissionId).collect(Collectors.toSet());
        if (submissionIds.isEmpty()) return List.of();

        Map<UUID, CandidateSubmission> submissionMap = submissionRepository.findAllById(submissionIds).stream()
                .collect(Collectors.toMap(CandidateSubmission::getId, Function.identity()));

        Set<UUID> assessmentIds = submissionMap.values().stream()
                .map(CandidateSubmission::getAssessmentId).collect(Collectors.toSet());
        Map<UUID, String> assessmentNameMap = assessmentRepository.findAllById(assessmentIds).stream()
                .collect(Collectors.toMap(a -> a.getId(), a -> a.getTitle()));

        Set<UUID> candidateIds = submissionMap.values().stream()
                .map(CandidateSubmission::getCandidateId).collect(Collectors.toSet());
        Map<UUID, Candidate> candidateMap = candidateRepository.findAllById(candidateIds).stream()
                .collect(Collectors.toMap(Candidate::getId, c -> c));

        return flags.stream()
                .filter(f -> reason == null || f.getReason() == reason)
                .filter(f -> {
                    if (assessmentId == null) return true;
                    CandidateSubmission sub = submissionMap.get(f.getSubmissionId());
                    return sub != null && assessmentId.equals(sub.getAssessmentId());
                })
                .filter(f -> fromDate == null || !f.getCreatedAt().isBefore(fromDate.atStartOfDay().toInstant(ZoneOffset.UTC)))
                .filter(f -> toDate == null || f.getCreatedAt().isBefore(toDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)))
                .sorted(Comparator.comparing(SubmissionFlag::getCreatedAt).reversed())
                .map(f -> {
                    CandidateSubmission sub = submissionMap.get(f.getSubmissionId());
                    Candidate cand = sub != null ? candidateMap.get(sub.getCandidateId()) : null;
                    String cName = cand != null ? cand.getFirstName() + " " + cand.getLastName() : "Unknown";
                    String aName = sub != null ? assessmentNameMap.getOrDefault(sub.getAssessmentId(), "Unknown") : "Unknown";
                    UUID cId = cand != null ? cand.getId() : null;
                    return new FlagListItemResponse(f.getId(), f.getSubmissionId(), cId, cName, aName,
                            f.getReason(), f.getStatus(), f.getCreatedAt(),
                            cand != null && cand.isBlacklisted(), cand != null && cand.isActionRequired());
                })
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void writeAudit(UUID flagId, String action, FlagStatus fromStatus, FlagStatus toStatus,
                             UUID actorId, String actorUsername) {
        SubmissionFlagAudit audit = new SubmissionFlagAudit();
        audit.setFlagId(flagId);
        audit.setAction(action);
        audit.setFromStatus(fromStatus);
        audit.setToStatus(toStatus);
        audit.setActorUserId(actorId);
        audit.setActorUsername(actorUsername);
        audit.setOccurredAt(Instant.now());
        auditRepository.save(audit);
    }

    private FlagResponse toFlagResponse(SubmissionFlag flag) {
        return new FlagResponse(
                flag.getId(), flag.getSubmissionId(), flag.getReason(), flag.getStatus(),
                flag.getResolutionNotes(), flag.getCreatedBy(), flag.getCreatedAt());
    }
}
