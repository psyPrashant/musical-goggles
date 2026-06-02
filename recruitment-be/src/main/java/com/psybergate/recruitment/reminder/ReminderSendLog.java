package com.psybergate.recruitment.reminder;

import com.psybergate.recruitment.domain.CandidateInvitation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reminder_send_log")
@Getter
@Setter
@NoArgsConstructor
public class ReminderSendLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private CandidateInvitation invitation;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "send_type", nullable = false, length = 20)
    private ReminderSendType sendType;

    @Column(name = "sent_by")
    private UUID sentBy;
}
