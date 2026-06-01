package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.CandidateInvitation;
import com.psybergate.recruitment.domain.InvitationStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<CandidateInvitation, UUID> {
    Optional<CandidateInvitation> findByInvitationToken(String token);

    Optional<CandidateInvitation> findByCandidate_IdAndAssessment_Id(UUID candidateId, UUID assessmentId);

    @Query("SELECT COUNT(i) FROM CandidateInvitation i WHERE i.status IN :statuses AND i.expiresAt > :now")
    long countByStatusInAndExpiresAtAfter(@Param("statuses") List<InvitationStatus> statuses, @Param("now") Instant now);

    @Query("""
            SELECT COUNT(i) FROM CandidateInvitation i
            WHERE i.status = 'SENT'
            AND NOT EXISTS (SELECT cs FROM CandidateSubmission cs WHERE cs.invitationId = i.id)
            """)
    long countInvitedWithoutSubmission();

    @Query("""
            SELECT i FROM CandidateInvitation i
            JOIN FETCH i.candidate
            JOIN FETCH i.assessment
            WHERE i.status = 'SENT'
            ORDER BY i.createdAt DESC
            """)
    List<CandidateInvitation> findRecentSent(Pageable pageable);
}
