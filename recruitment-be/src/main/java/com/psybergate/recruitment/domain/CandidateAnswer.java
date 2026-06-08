package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "candidate_answers",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_candidate_answer_submission_question",
        columnNames = {"submission_id", "question_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
public class CandidateAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "submission_id", nullable = false)
    private UUID submissionId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "selected_option_ids", columnDefinition = "TEXT")
    private String selectedOptionIds;

    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    @Column(name = "is_draft", nullable = false)
    private boolean draft = true;

    @Column(name = "saved_at", nullable = false)
    private Instant savedAt;

    @Column(name = "selected_language", length = 20)
    private String selectedLanguage;
}
