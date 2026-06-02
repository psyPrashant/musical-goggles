package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.FlagStatus;
import com.psybergate.recruitment.domain.SubmissionFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionFlagRepository extends JpaRepository<SubmissionFlag, UUID> {

    Optional<SubmissionFlag> findBySubmissionIdAndStatusIn(UUID submissionId, List<FlagStatus> statuses);

    List<SubmissionFlag> findBySubmissionIdOrderByCreatedAtDesc(UUID submissionId);

    boolean existsBySubmissionIdAndStatusIn(UUID submissionId, List<FlagStatus> statuses);
}
