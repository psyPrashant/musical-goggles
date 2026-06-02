package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.SubmissionFlagAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SubmissionFlagAuditRepository extends JpaRepository<SubmissionFlagAudit, UUID> {

    List<SubmissionFlagAudit> findByFlagIdOrderByOccurredAtAsc(UUID flagId);
}
