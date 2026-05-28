package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "code_submission_questions")
@DiscriminatorValue("CODE_SUBMISSION")
@Getter
@Setter
@NoArgsConstructor
public class CodeSubmissionQuestion extends Question {

    @Column(name = "language_hint", length = 100)
    private String languageHint;

    @Override
    public QuestionType getType() {
        return QuestionType.CODE_SUBMISSION;
    }
}
