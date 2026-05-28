package com.psybergate.recruitment.auth;

import com.psybergate.recruitment.auth.dto.*;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.repository.UserRepository;
import com.psybergate.recruitment.security.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        long ttlHours = user.getRole() == Role.CANDIDATE ? 2L : 1L;
        String token = jwtService.generateToken(user.getId().toString(), user.getRole(), ttlHours);
        return new LoginResponse(token, user.getRole().name());
    }

    @Override
    public CandidateTokenResponse validateCandidateToken(CandidateTokenRequest request) {
        try {
            Claims claims = jwtService.extractClaims(request.invitationToken());
            String candidateId = claims.getSubject();
            String assessmentId = claims.get("assessmentId", String.class);
            String sessionToken = jwtService.generateCandidateSessionToken(candidateId, assessmentId);
            return new CandidateTokenResponse(sessionToken);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired invitation token");
        }
    }
}
