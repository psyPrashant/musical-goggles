package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.AnswerScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnswerScoreRepository extends JpaRepository<AnswerScore, UUID> {

    Optional<AnswerScore> findByCandidateAnswerId(UUID candidateAnswerId);

    List<AnswerScore> findByCandidateAnswerIdIn(Collection<UUID> candidateAnswerIds);
}
