package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.VerifyPasswordRequest;
import com.psybergate.recruitment.domain.Assessment;
import com.psybergate.recruitment.repository.AssessmentRepository;
import com.psybergate.recruitment.security.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/assessments")
public class CandidateAssessmentController {

    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/{assessmentId}/verify-password")
    public ResponseEntity<Map<String, Boolean>> verifyPassword(
            @PathVariable UUID assessmentId,
            @RequestBody @Valid VerifyPasswordRequest request) {

        // Validate token and assert it belongs to this assessment
        Claims claims;
        try {
            claims = jwtService.extractClaims(request.invitationToken());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired invitation token");
        }

        String tokenAssessmentId = claims.get("assessmentId", String.class);
        if (!assessmentId.toString().equals(tokenAssessmentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token does not match this assessment");
        }

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));

        if (assessment.getAccessPasswordHash() == null) {
            return ResponseEntity.ok(Map.of("valid", true));
        }

        boolean valid = passwordEncoder.matches(request.password(), assessment.getAccessPasswordHash());
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
