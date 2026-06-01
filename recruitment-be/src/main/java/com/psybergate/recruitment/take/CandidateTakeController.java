package com.psybergate.recruitment.take;

import com.psybergate.recruitment.take.dto.AssessmentTakeResponse;
import com.psybergate.recruitment.take.dto.SaveAnswersRequest;
import com.psybergate.recruitment.take.dto.SaveAnswersResponse;
import com.psybergate.recruitment.take.dto.SubmitRequest;
import com.psybergate.recruitment.take.dto.SubmitResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/take")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateTakeController {

    @Autowired
    private CandidateTakeService takeService;

    @GetMapping("/assessment")
    public ResponseEntity<AssessmentTakeResponse> loadAssessment(Authentication auth) {
        UUID candidateId = UUID.fromString(auth.getName());
        UUID assessmentId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(takeService.loadAssessment(candidateId, assessmentId));
    }

    @PutMapping("/answers")
    public ResponseEntity<SaveAnswersResponse> saveAnswers(
            @RequestBody @Valid SaveAnswersRequest request,
            Authentication auth) {
        UUID candidateId = UUID.fromString(auth.getName());
        UUID assessmentId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(takeService.saveAnswers(candidateId, assessmentId, request));
    }

    @PostMapping("/submit")
    public ResponseEntity<SubmitResponse> submit(
            @RequestBody SubmitRequest request,
            Authentication auth) {
        UUID candidateId = UUID.fromString(auth.getName());
        UUID assessmentId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(takeService.submitAssessment(candidateId, assessmentId, request.autoSubmitted()));
    }
}
