package com.psybergate.recruitment.security;

import com.psybergate.recruitment.domain.Role;
import io.jsonwebtoken.Claims;

import javax.crypto.SecretKey;

public interface JwtService {

    String generateToken(String userId, Role role, long ttlHours);

    String generateCandidateSessionToken(String candidateId, String assessmentId);

    String generateCandidateToken(String candidateId, String assessmentId, long ttlHours);

    Claims extractClaims(String token);

    boolean validateToken(String token);

    long getExpiryHours();

    SecretKey getSigningKey();
}
