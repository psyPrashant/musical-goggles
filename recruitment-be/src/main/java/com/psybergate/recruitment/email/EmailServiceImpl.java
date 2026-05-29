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
                                String invitationLink, Instant expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(candidate.getEmail());
        message.setSubject("Your Assessment Invitation: " + assessment.getTitle());
        message.setText(buildBody(candidate, assessment, invitationLink, expiresAt));
        mailSender.send(message);
    }

    private String buildBody(Candidate candidate, Assessment assessment,
                              String invitationLink, Instant expiresAt) {
        return "Hi " + candidate.getFirstName() + ",\n\n"
                + "You have been invited to complete the following assessment:\n"
                + "  " + assessment.getTitle() + "\n\n"
                + "Click the link below to begin:\n"
                + "  " + invitationLink + "\n\n"
                + "This invitation expires at: " + EXPIRY_FMT.format(expiresAt) + "\n\n"
                + "Good luck!\n"
                + "The Psybergate Recruitment Team";
    }
}
