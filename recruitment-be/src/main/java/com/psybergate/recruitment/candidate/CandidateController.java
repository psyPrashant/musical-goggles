package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.candidate.dto.CandidateResponse;
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
}
