package com.psybergate.recruitment.invitation;

import com.psybergate.recruitment.domain.Assessment;
import com.psybergate.recruitment.domain.AssessmentStatus;
import com.psybergate.recruitment.domain.Candidate;
import com.psybergate.recruitment.domain.CandidateInvitation;
import com.psybergate.recruitment.domain.InvitationStatus;
import com.psybergate.recruitment.email.EmailService;
import com.psybergate.recruitment.invitation.dto.InviteRequest;
import com.psybergate.recruitment.invitation.dto.InviteResponse;
import com.psybergate.recruitment.repository.AssessmentRepository;
import com.psybergate.recruitment.repository.CandidateRepository;
import com.psybergate.recruitment.repository.InvitationRepository;
import com.psybergate.recruitment.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@Transactional
public class InvitationServiceImpl implements InvitationService {

    private static final long INVITATION_TTL_HOURS = 48L;

    @Autowired private CandidateRepository candidateRepository;
    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private InvitationRepository invitationRepository;
    @Autowired private JwtService jwtService;
    @Autowired private EmailService emailService;

    @Override
    public InviteResponse invite(InviteRequest request, String baseUrl) {
        Candidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        Assessment assessment = assessmentRepository.findById(request.assessmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        if (assessment.getStatus() != AssessmentStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment must be published before inviting candidates");
        }

        Optional<CandidateInvitation> existingInvite = invitationRepository
                .findByCandidate_IdAndAssessment_Id(candidate.getId(), assessment.getId());
        if (existingInvite.isPresent()
                && (existingInvite.get().getStatus() == InvitationStatus.PENDING
                        || existingInvite.get().getStatus() == InvitationStatus.SENT)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "DUPLICATE_INVITE");
        }

        String token = jwtService.generateCandidateToken(
                candidate.getId().toString(),
                assessment.getId().toString(),
                INVITATION_TTL_HOURS
        );

        Instant expiresAt = Instant.now().plus(INVITATION_TTL_HOURS, ChronoUnit.HOURS);

        CandidateInvitation invitation = new CandidateInvitation();
        invitation.setCandidate(candidate);
        invitation.setAssessment(assessment);
        invitation.setInvitationToken(token);
        invitation.setExpiresAt(expiresAt);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation = invitationRepository.save(invitation);

        String link = baseUrl + "/assessment/" + assessment.getId() + "/take?token=" + token;

        emailService.sendInvitation(candidate, assessment, link, expiresAt, request.plainPassword());
        invitation.setStatus(InvitationStatus.SENT);
        invitationRepository.save(invitation);

        return new InviteResponse(invitation.getId(), link, token, expiresAt);
    }
}
