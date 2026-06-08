package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.BlacklistRequest;
import com.psybergate.recruitment.candidate.dto.CandidateHistoryItemResponse;
import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;
import com.psybergate.recruitment.candidate.dto.ContactCandidateRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @PostMapping
    public ResponseEntity<CandidateResponse> create(@RequestBody @Valid CandidateRequest request,
                                                     Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(candidateService.create(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<CandidateResponse>> list() {
        return ResponseEntity.ok(candidateService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateService.findById(id));
    }

    @GetMapping("/by-email")
    public ResponseEntity<CandidateResponse> getByEmail(@RequestParam String email) {
        return ResponseEntity.ok(candidateService.getByEmail(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidateResponse> update(@PathVariable UUID id,
                                                     @RequestBody @Valid CandidateRequest request) {
        return ResponseEntity.ok(candidateService.update(id, request));
    }

    @GetMapping("/{candidateId}/history")
    public ResponseEntity<List<CandidateHistoryItemResponse>> getHistory(@PathVariable UUID candidateId) {
        return ResponseEntity.ok(candidateService.getAssessmentHistory(candidateId));
    }

    @PostMapping("/{id}/contact")
    public ResponseEntity<Void> contact(@PathVariable UUID id,
                                        @RequestBody @Valid ContactCandidateRequest request) {
        candidateService.contactCandidate(id, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/blacklist")
    public ResponseEntity<CandidateResponse> blacklist(@PathVariable UUID id,
                                                       @RequestBody @Valid BlacklistRequest request,
                                                       Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(candidateService.setBlacklisted(id, request.blacklisted(), isAdmin));
    }
}
