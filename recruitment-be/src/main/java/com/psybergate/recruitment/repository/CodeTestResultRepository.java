package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.CodeTestResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CodeTestResultRepository extends JpaRepository<CodeTestResult, UUID> {
    List<CodeTestResult> findByAnswerId(UUID answerId);
    void deleteByAnswerId(UUID answerId);
}
