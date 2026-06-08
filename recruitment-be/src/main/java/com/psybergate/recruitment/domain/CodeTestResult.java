package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "code_test_results")
@Getter
@Setter
@NoArgsConstructor
public class CodeTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "answer_id", nullable = false)
    private UUID answerId;

    @Column(name = "test_case_id", nullable = false)
    private UUID testCaseId;

    @Column(nullable = false)
    private boolean passed;

    @Column(name = "actual_output", columnDefinition = "TEXT")
    private String actualOutput;

    @Column(columnDefinition = "TEXT")
    private String stderr;

    @Column(name = "judge0_status")
    private Integer judge0Status;

    @Column(name = "execution_ms", precision = 8, scale = 2)
    private BigDecimal executionMs;
}
