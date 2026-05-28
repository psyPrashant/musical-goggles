package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.QuestionGroupItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuestionGroupItemRepository extends JpaRepository<QuestionGroupItem, UUID> {

    Optional<QuestionGroupItem> findByGroupIdAndQuestionId(UUID groupId, UUID questionId);
}
