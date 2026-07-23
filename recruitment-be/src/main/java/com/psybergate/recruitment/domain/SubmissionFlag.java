package com.psybergate.recruitment.domain;

import com.psybergate.recruitment.flag.domain.FlagReason;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "submission_flags")
@Getter
@Setter
@NoArgsConstructor
public class SubmissionFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "submission_id", nullable = false)
    private UUID submissionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FlagReason reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlagStatus status = FlagStatus.FLAGGED;

    @Column(name = "resolution_notes")
    private String resolutionNotes;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
