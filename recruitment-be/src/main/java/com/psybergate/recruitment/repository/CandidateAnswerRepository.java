package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.CandidateAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface CandidateAnswerRepository extends JpaRepository<CandidateAnswer, UUID> {

    List<CandidateAnswer> findBySubmissionId(UUID submissionId);

    Optional<CandidateAnswer> findBySubmissionIdAndQuestionId(UUID submissionId, UUID questionId);

    @Query("SELECT a.questionId FROM CandidateAnswer a WHERE a.submissionId = :submissionId")
    Set<UUID> findQuestionIdsBySubmissionId(@Param("submissionId") UUID submissionId);
}
