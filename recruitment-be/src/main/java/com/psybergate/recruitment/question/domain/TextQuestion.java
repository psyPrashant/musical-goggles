package com.psybergate.recruitment.question.domain;

import com.psybergate.recruitment.domain.Question;
import com.psybergate.recruitment.domain.QuestionType;
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
