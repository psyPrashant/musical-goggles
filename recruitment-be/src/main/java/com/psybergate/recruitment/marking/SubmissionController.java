package com.psybergate.recruitment.marking;

import com.psybergate.recruitment.marking.dto.AnswerScoreResponse;
import com.psybergate.recruitment.marking.dto.ResultSummaryResponse;
import com.psybergate.recruitment.marking.dto.ScoreAnswerRequest;
import com.psybergate.recruitment.marking.dto.SubmissionSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    /** List all submissions for a specific assessment (MG-36) */
    @GetMapping("/api/assessments/{assessmentId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> listSubmissions(
            @PathVariable UUID assessmentId) {
        return ResponseEntity.ok(submissionService.listSubmissions(assessmentId));
    }

    /** List ALL submissions across all assessments (convenience for global results view) */
    @GetMapping("/api/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> listAllSubmissions() {
        return ResponseEntity.ok(submissionService.listAllSubmissions());
    }

    /** Manual score for a single answer (MG-37) */
    @PutMapping("/api/submissions/{submissionId}/answers/{answerId}/score")
    public ResponseEntity<AnswerScoreResponse> scoreAnswer(
            @PathVariable UUID submissionId,
            @PathVariable UUID answerId,
            @RequestBody @Valid ScoreAnswerRequest request,
            Authentication auth) {
        UUID markerId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(
                submissionService.scoreAnswer(submissionId, answerId, request.score(), request.feedback(), markerId)
        );
    }

    /** Score a question by questionId — creates CandidateAnswer if unanswered (MG-143) */
    @PutMapping("/api/submissions/{submissionId}/questions/{questionId}/score")
    public ResponseEntity<AnswerScoreResponse> scoreByQuestion(
            @PathVariable UUID submissionId,
            @PathVariable UUID questionId,
            @RequestBody @Valid ScoreAnswerRequest request,
            Authentication auth) {
        UUID markerId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(
                submissionService.scoreByQuestionId(submissionId, questionId, request.score(), request.feedback(), markerId)
        );
    }

    /** Overall result summary per candidate (MG-40) */
    @GetMapping("/api/submissions/{submissionId}/result")
    public ResponseEntity<ResultSummaryResponse> getResult(@PathVariable UUID submissionId) {
        return ResponseEntity.ok(submissionService.getResult(submissionId));
    }
}
