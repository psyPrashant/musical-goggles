package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateHistoryItemResponse;
import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;
import com.psybergate.recruitment.candidate.dto.ContactCandidateRequest;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.SubmissionFlagRepository;
import com.psybergate.recruitment.email.EmailService;
import com.psybergate.recruitment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CandidateServiceImpl implements CandidateService {

    @Autowired private CandidateRepository candidateRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InvitationRepository invitationRepository;
    @Autowired private CandidateSubmissionRepository submissionRepository;
    @Autowired private CandidateAnswerRepository answerRepository;
    @Autowired private AnswerScoreRepository scoreRepository;
    @Autowired private EmailService emailService;
    @Autowired private SubmissionFlagRepository flagRepository;

    @Override
    public CandidateResponse create(CandidateRequest request, UUID createdById) {
        if (candidateRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A candidate with this email already exists");
        }
        Candidate candidate = new Candidate();
        candidate.setFirstName(request.firstName());
        candidate.setLastName(request.lastName());
        candidate.setEmail(request.email());
        candidate.setCellPhone(request.cellPhone());
        userRepository.findById(createdById).ifPresent(candidate::setCreatedBy);
        return toResponse(candidateRepository.save(candidate));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> findAll() {
        List<Candidate> candidates = candidateRepository.findAll();
        if (candidates.isEmpty()) return List.of();
        List<UUID> candidateIds = candidates.stream().map(Candidate::getId).toList();
        List<FlagStatus> activeStatuses = List.of(FlagStatus.FLAGGED, FlagStatus.UNDER_REVIEW, FlagStatus.ACTION_REQUIRED);
        Map<UUID, FlagStatus> activeFlagByCandidateId = flagRepository
                .findActiveFlagStatusByCandidateIds(candidateIds, activeStatuses)
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> (FlagStatus) row[1],
                        (a, b) -> a // keep first (most recent) per candidate
                ));
        return candidates.stream().map(c -> toResponse(c, activeFlagByCandidateId.get(c.getId()))).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateResponse findById(UUID id) {
        return toResponse(candidateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found")));
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateResponse getByEmail(String email) {
        return toResponse(candidateRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found")));
    }

    @Override
    public CandidateResponse update(UUID id, CandidateRequest request) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));
        if (candidateRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A candidate with this email already exists");
        }
        candidate.setFirstName(request.firstName());
        candidate.setLastName(request.lastName());
        candidate.setEmail(request.email());
        candidate.setCellPhone(request.cellPhone());
        return toResponse(candidateRepository.save(candidate));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateHistoryItemResponse> getAssessmentHistory(UUID candidateId) {
        candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        List<CandidateInvitation> invitations =
                invitationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId);

        if (invitations.isEmpty()) return List.of();

        // Batch-load submissions by invitationId
        Map<UUID, CandidateSubmission> submissionByInvitation = invitations.stream()
                .map(inv -> submissionRepository.findByInvitationId(inv.getId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toMap(CandidateSubmission::getInvitationId, s -> s));

        // Batch-load answers and scores for all known submissions
        Set<UUID> submissionIds = submissionByInvitation.values().stream()
                .map(CandidateSubmission::getId).collect(Collectors.toSet());
        Map<UUID, List<CandidateAnswer>> answersBySubmission = submissionIds.isEmpty() ? Map.of() :
                submissionIds.stream()
                        .collect(Collectors.toMap(sid -> sid, sid -> answerRepository.findBySubmissionId(sid)));

        Set<UUID> allAnswerIds = answersBySubmission.values().stream()
                .flatMap(List::stream).map(CandidateAnswer::getId).collect(Collectors.toSet());
        Map<UUID, AnswerScore> scoreByAnswerId = allAnswerIds.isEmpty() ? Map.of() :
                scoreRepository.findByCandidateAnswerIdIn(allAnswerIds).stream()
                        .collect(Collectors.toMap(AnswerScore::getCandidateAnswerId, s -> s));

        Instant now = Instant.now();

        return invitations.stream().map(inv -> {
            CandidateSubmission sub = submissionByInvitation.get(inv.getId());

            String status;
            Instant submittedAt = null;
            Integer totalScore = null;
            String markingStatus = null;

            if (sub == null) {
                if (inv.getStatus() == com.psybergate.recruitment.domain.InvitationStatus.CANCELLED) {
                    status = "CANCELLED";
                } else {
                    status = inv.getExpiresAt().isBefore(now) ? "EXPIRED" : "PENDING";
                }
            } else {
                status = sub.getStatus().name();
                submittedAt = sub.getSubmittedAt();

                List<CandidateAnswer> answers = answersBySubmission.getOrDefault(sub.getId(), List.of());
                if (!answers.isEmpty()) {
                    int scored = 0;
                    int scoreSum = 0;
                    boolean allMarked = true;
                    for (CandidateAnswer ans : answers) {
                        AnswerScore sc = scoreByAnswerId.get(ans.getId());
                        if (sc != null) {
                            scored++;
                            scoreSum += sc.getScore();
                        } else {
                            allMarked = false;
                        }
                    }
                    totalScore = scoreSum;
                    markingStatus = allMarked && scored > 0 ? "FULLY_MARKED" : "PENDING_REVIEW";
                } else {
                    markingStatus = "PENDING_REVIEW";
                }
            }

            return new CandidateHistoryItemResponse(
                    inv.getId(),
                    inv.getAssessment().getId(),
                    inv.getAssessment().getTitle(),
                    inv.getCreatedAt(),
                    sub != null ? sub.getId() : null,
                    status,
                    submittedAt,
                    totalScore,
                    markingStatus,
                    null // linkedRole — future epic
            );
        }).toList();
    }

    @Override
    public void contactCandidate(UUID candidateId, ContactCandidateRequest req) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));
        emailService.sendContactMessage(candidate, req.subject(), req.message());
        candidate.setActionRequired(true);
        candidateRepository.save(candidate);
    }

    @Override
    public CandidateResponse setBlacklisted(UUID candidateId, boolean blacklisted, boolean isAdmin) {
        if (!blacklisted && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can remove a candidate from the blacklist");
        }
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));
        candidate.setBlacklisted(blacklisted);
        return toResponse(candidateRepository.save(candidate));
    }

    private CandidateResponse toResponse(Candidate c) {
        return new CandidateResponse(c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(), c.getCellPhone(),
                c.getCreatedAt(), c.isActionRequired(), c.isBlacklisted(), null);
    }

    private CandidateResponse toResponse(Candidate c, FlagStatus activeFlagStatus) {
        return new CandidateResponse(c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(), c.getCellPhone(),
                c.getCreatedAt(), c.isActionRequired(), c.isBlacklisted(), activeFlagStatus);
    }
}
