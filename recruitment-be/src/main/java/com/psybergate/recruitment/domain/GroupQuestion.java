package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_questions")
@DiscriminatorValue("GROUP")
@Getter
@Setter
@NoArgsConstructor
public class GroupQuestion extends Question {

    @OneToMany(mappedBy = "groupQuestion", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @OrderBy("displayOrder ASC")
    private List<GroupQuestionMember> members = new ArrayList<>();

    @Override
    public QuestionType getType() {
        return QuestionType.GROUP;
    }
}
