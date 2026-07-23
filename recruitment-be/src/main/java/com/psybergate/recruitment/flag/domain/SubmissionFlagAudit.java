package com.psybergate.recruitment.flag.domain;

import com.psybergate.recruitment.domain.FlagStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "submission_flag_audit")
@Getter
@Setter
@NoArgsConstructor
public class SubmissionFlagAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "flag_id", nullable = false)
    private UUID flagId;

    @Column(nullable = false, length = 20)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private FlagStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private FlagStatus toStatus;

    @Column(name = "actor_user_id", nullable = false)
    private UUID actorUserId;

    @Column(name = "actor_username", nullable = false)
    private String actorUsername;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;
}
