package com.psybergate.recruitment.email;

import com.psybergate.recruitment.domain.Assessment;
import com.psybergate.recruitment.domain.Candidate;

import java.time.Instant;

public interface EmailService {
    void sendInvitation(Candidate candidate, Assessment assessment, String invitationLink, Instant expiresAt);
}
