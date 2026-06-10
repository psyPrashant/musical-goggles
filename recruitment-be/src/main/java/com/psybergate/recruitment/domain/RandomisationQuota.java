package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "assessment_randomisation_quotas")
@Getter
@Setter
@NoArgsConstructor
public class RandomisationQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 50)
    private QuestionType questionType;

    @Column(nullable = false)
    private int count;
}
