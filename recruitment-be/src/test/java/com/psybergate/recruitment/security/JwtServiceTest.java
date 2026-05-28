package com.psybergate.recruitment.security;

import com.psybergate.recruitment.domain.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-that-is-at-least-32-characters-long";
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 1L);
    }

    @Test
    void generateAndValidate_roundTrip() {
        String token = jwtService.generateToken("user-123", Role.ADMIN, 1L);

        assertThat(jwtService.validateToken(token)).isTrue();
        Claims claims = jwtService.extractClaims(token);
        assertThat(claims.getSubject()).isEqualTo("user-123");
        assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
    }

    @Test
    void expiredToken_isRejected() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        Date past = new Date(System.currentTimeMillis() - 60_000L);
        String expiredToken = Jwts.builder()
                .subject("user-123")
                .claim("role", "ADMIN")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000L))
                .expiration(past)
                .signWith(key)
                .compact();

        assertThat(jwtService.validateToken(expiredToken)).isFalse();
    }

    @Test
    void tamperedToken_isRejected() {
        String token = jwtService.generateToken("user-123", Role.RECRUITER, 1L);
        String tampered = token.substring(0, token.length() - 4) + "XXXX";

        assertThat(jwtService.validateToken(tampered)).isFalse();
    }

    @Test
    void candidateSessionToken_containsAssessmentId() {
        String token = jwtService.generateCandidateSessionToken("candidate-abc", "assessment-xyz");

        Claims claims = jwtService.extractClaims(token);
        assertThat(claims.getSubject()).isEqualTo("candidate-abc");
        assertThat(claims.get("role", String.class)).isEqualTo("CANDIDATE");
        assertThat(claims.get("assessmentId", String.class)).isEqualTo("assessment-xyz");
    }
}
