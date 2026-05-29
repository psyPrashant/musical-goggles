package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mcq_questions")
@DiscriminatorValue("MCQ")
@Getter
@Setter
@NoArgsConstructor
public class McqQuestion extends Question {

    @OneToMany(mappedBy = "mcqQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionOption> options = new ArrayList<>();

    @Override
    public QuestionType getType() {
        return QuestionType.MCQ;
    }
}
