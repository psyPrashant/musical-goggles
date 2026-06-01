package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.AnswerScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnswerScoreRepository extends JpaRepository<AnswerScore, UUID> {

    Optional<AnswerScore> findByCandidateAnswerId(UUID candidateAnswerId);

    List<AnswerScore> findByCandidateAnswerIdIn(Collection<UUID> candidateAnswerIds);

    @Query("SELECT AVG(s.score) FROM AnswerScore s WHERE s.markedAt >= :since")
    Double averageScoreSince(@Param("since") Instant since);
}
