package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.FlagStatus;
import com.psybergate.recruitment.domain.SubmissionFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionFlagRepository extends JpaRepository<SubmissionFlag, UUID> {

    Optional<SubmissionFlag> findBySubmissionIdAndStatusIn(UUID submissionId, List<FlagStatus> statuses);

    List<SubmissionFlag> findBySubmissionIdOrderByCreatedAtDesc(UUID submissionId);

    boolean existsBySubmissionIdAndStatusIn(UUID submissionId, List<FlagStatus> statuses);

    @Query("SELECT COUNT(DISTINCT f.submissionId) FROM SubmissionFlag f WHERE f.status IN :statuses")
    long countDistinctSubmissionIdByStatusIn(@Param("statuses") Collection<FlagStatus> statuses);
}
