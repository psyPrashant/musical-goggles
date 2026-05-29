package com.psybergate.recruitment.email;

import com.psybergate.recruitment.domain.Assessment;
import com.psybergate.recruitment.domain.Candidate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class EmailServiceImpl implements EmailService {

    private static final DateTimeFormatter EXPIRY_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm 'UTC'").withZone(ZoneId.of("UTC"));

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendInvitation(Candidate candidate, Assessment assessment,
                                String invitationLink, Instant expiresAt, String plainPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(candidate.getEmail());
        message.setSubject("Your Assessment Invitation: " + assessment.getTitle());
        message.setText(buildBody(candidate, assessment, invitationLink, expiresAt, plainPassword));
        mailSender.send(message);
    }

    private String buildBody(Candidate candidate, Assessment assessment,
                              String invitationLink, Instant expiresAt, String plainPassword) {
        StringBuilder body = new StringBuilder();
        body.append("Hi ").append(candidate.getFirstName()).append(",\n\n")
            .append("You have been invited to complete the following assessment:\n")
            .append("  ").append(assessment.getTitle()).append("\n\n")
            .append("Click the link below to begin:\n")
            .append("  ").append(invitationLink).append("\n\n");
        if (plainPassword != null && !plainPassword.isBlank()) {
            body.append("Assessment password: ").append(plainPassword).append("\n\n");
        }
        body.append("This invitation expires at: ").append(EXPIRY_FMT.format(expiresAt)).append("\n\n")
            .append("Good luck!\n")
            .append("The Psybergate Recruitment Team");
        return body.toString();
    }
}
