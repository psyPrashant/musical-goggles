package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "answer_scores")
@Getter
@Setter
@NoArgsConstructor
public class AnswerScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "candidate_answer_id", nullable = false, unique = true)
    private UUID candidateAnswerId;

    @Column(nullable = false)
    private int score;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "marked_by")
    private UUID markedBy;

    @Column(name = "marked_at", nullable = false)
    private Instant markedAt;

    @Column(name = "is_auto_marked", nullable = false)
    private boolean autoMarked;
}
