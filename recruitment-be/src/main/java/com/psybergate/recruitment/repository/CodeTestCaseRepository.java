package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.CodeTestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CodeTestCaseRepository extends JpaRepository<CodeTestCase, UUID> {
    List<CodeTestCase> findByQuestion_IdOrderByDisplayOrder(UUID questionId);
}
