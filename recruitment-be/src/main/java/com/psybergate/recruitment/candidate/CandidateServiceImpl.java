package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateHistoryItemResponse;
import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;
import com.psybergate.recruitment.domain.*;
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

    @Override
    public CandidateResponse create(CandidateRequest request, UUID createdById) {
        if (candidateRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A candidate with this email already exists");
        }
        Candidate candidate = new Candidate();
        candidate.setFirstName(request.firstName());
        candidate.setLastName(request.lastName());
        candidate.setEmail(request.email());
        userRepository.findById(createdById).ifPresent(candidate::setCreatedBy);
        return toResponse(candidateRepository.save(candidate));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> findAll() {
        return candidateRepository.findAll().stream().map(this::toResponse).toList();
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
                status = inv.getExpiresAt().isBefore(now) ? "EXPIRED" : "PENDING";
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

    private CandidateResponse toResponse(Candidate c) {
        return new CandidateResponse(c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(), c.getCreatedAt());
    }
}
