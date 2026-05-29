package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "text_questions")
@DiscriminatorValue("TEXT")
@NoArgsConstructor
public class TextQuestion extends Question {

    @Override
    public QuestionType getType() {
        return QuestionType.TEXT;
    }
}
