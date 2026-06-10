package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.SubmissionQuestionSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SubmissionQuestionSnapshotRepository extends JpaRepository<SubmissionQuestionSnapshot, UUID> {

    List<SubmissionQuestionSnapshot> findBySubmissionIdOrderByDisplayOrder(UUID submissionId);

    boolean existsBySubmissionId(UUID submissionId);
}
