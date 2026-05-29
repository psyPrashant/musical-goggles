package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.CandidateInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<CandidateInvitation, UUID> {
    Optional<CandidateInvitation> findByInvitationToken(String token);
}
