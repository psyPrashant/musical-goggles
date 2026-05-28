package com.psybergate.recruitment.security;

import com.psybergate.recruitment.domain.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expiryHours;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiry-hours:1}") long expiryHours) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryHours = expiryHours;
    }

    public String generateToken(String userId, Role role, long ttlHours) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ttlHours * 3_600_000L);
        return Jwts.builder()
                .subject(userId)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public String generateCandidateSessionToken(String candidateId, String assessmentId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 2 * 3_600_000L);
        return Jwts.builder()
                .subject(candidateId)
                .claims(Map.of("role", Role.CANDIDATE.name(), "assessmentId", assessmentId))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getExpiryHours() {
        return expiryHours;
    }

    public SecretKey getSigningKey() {
        return signingKey;
    }
}
