package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.assessment.AssessmentService;
import com.psybergate.recruitment.candidate.dto.VerifyPasswordRequest;
import com.psybergate.recruitment.security.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/assessments")
@RequiredArgsConstructor
public class CandidateAssessmentController {

    private final AssessmentService assessmentService;
    private final JwtService jwtService;

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

        boolean valid = assessmentService.verifyAccessPassword(assessmentId, request.password());
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
