package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "code_test_cases")
@Getter
@Setter
@NoArgsConstructor
public class CodeTestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private CodeSubmissionQuestion question;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(length = 255)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String stdin;

    @Column(name = "expected_output", nullable = false, columnDefinition = "TEXT")
    private String expectedOutput;

    @Column(name = "is_visible", nullable = false)
    private boolean visible = true;

    @Column(name = "run_only_on_submit", nullable = false)
    private boolean runOnlyOnSubmit = false;
}
