package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.CandidateAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateAnswerRepository extends JpaRepository<CandidateAnswer, UUID> {

    List<CandidateAnswer> findBySubmissionId(UUID submissionId);

    Optional<CandidateAnswer> findBySubmissionIdAndQuestionId(UUID submissionId, UUID questionId);
}
