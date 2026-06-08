package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "code_submission_questions")
@DiscriminatorValue("CODE_SUBMISSION")
@Getter
@Setter
@NoArgsConstructor
public class CodeSubmissionQuestion extends Question {

    @Column(name = "language_hint", length = 100)
    private String languageHint;

    @Column(name = "starter_code", columnDefinition = "TEXT")
    private String starterCode;

    @Column(name = "starter_code_java", columnDefinition = "TEXT")
    private String starterCodeJava;

    @Column(name = "starter_code_csharp", columnDefinition = "TEXT")
    private String starterCodeCsharp;

    @Column(name = "starter_code_python", columnDefinition = "TEXT")
    private String starterCodePython;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<CodeTestCase> testCases = new ArrayList<>();

    @Override
    public QuestionType getType() {
        return QuestionType.CODE_SUBMISSION;
    }
}
