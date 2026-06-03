package com.psybergate.recruitment.repository;

import com.psybergate.recruitment.domain.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, UUID> {

    Optional<AssessmentQuestion> findByAssessmentIdAndQuestionId(UUID assessmentId, UUID questionId);

    List<AssessmentQuestion> findByAssessmentIdOrderByDisplayOrder(UUID assessmentId);

    @Query("SELECT aq.assessment.id, SUM(aq.question.maxScore) FROM AssessmentQuestion aq WHERE aq.assessment.id IN :ids GROUP BY aq.assessment.id")
    List<Object[]> sumMaxScoreGroupByAssessmentId(@Param("ids") Collection<UUID> ids);
}
