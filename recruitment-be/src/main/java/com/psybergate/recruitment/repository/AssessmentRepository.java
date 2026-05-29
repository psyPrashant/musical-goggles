package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
}
