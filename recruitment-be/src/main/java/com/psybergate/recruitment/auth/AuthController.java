package com.psybergate.recruitment.auth;

import com.psybergate.recruitment.auth.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/candidate/validate-token")
    public ResponseEntity<CandidateTokenResponse> validateCandidateToken(
            @RequestBody @Valid CandidateTokenRequest request) {
        return ResponseEntity.ok(authService.validateCandidateToken(request));
    }
}
