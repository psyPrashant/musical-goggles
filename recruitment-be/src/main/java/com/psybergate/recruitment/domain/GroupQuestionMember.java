package com.psybergate.recruitment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

@Entity
@Table(
    name = "group_question_members",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_group_question_member",
        columnNames = {"group_question_id", "question_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
public class GroupQuestionMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_question_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private GroupQuestion groupQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Question question;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
