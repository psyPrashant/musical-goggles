package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.CandidateSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateSubmissionRepository extends JpaRepository<CandidateSubmission, UUID> {

    Optional<CandidateSubmission> findByCandidateIdAndAssessmentId(UUID candidateId, UUID assessmentId);

    List<CandidateSubmission> findByAssessmentId(UUID assessmentId);

    List<CandidateSubmission> findAll();
}
