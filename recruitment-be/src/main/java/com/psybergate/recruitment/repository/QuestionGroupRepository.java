package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.QuestionGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuestionGroupRepository extends JpaRepository<QuestionGroup, UUID> {

    Optional<QuestionGroup> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
}
