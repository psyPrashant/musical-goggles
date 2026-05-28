package com.psybergate.recruitment.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.auth.dto.CandidateTokenRequest;
import com.psybergate.recruitment.security.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CandidateAuthControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtService jwtService;

    @Test
    void validInvitationToken_returnsSessionToken() throws Exception {
        String invitationToken = jwtService.generateCandidateSessionToken("candidate-abc", "assessment-xyz");

        mockMvc.perform(post("/api/auth/candidate/validate-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateTokenRequest(invitationToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));
    }

    @Test
    void expiredInvitationToken_returns401() throws Exception {
        SecretKey key = jwtService.getSigningKey();
        String expiredToken = Jwts.builder()
                .subject("candidate-abc")
                .claim("role", "CANDIDATE")
                .claim("assessmentId", "assessment-xyz")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000L))
                .expiration(new Date(System.currentTimeMillis() - 60_000L))
                .signWith(key)
                .compact();

        mockMvc.perform(post("/api/auth/candidate/validate-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateTokenRequest(expiredToken))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tamperedInvitationToken_returns401() throws Exception {
        String token = jwtService.generateCandidateSessionToken("candidate-abc", "assessment-xyz");
        String tampered = token.substring(0, token.length() - 4) + "XXXX";

        mockMvc.perform(post("/api/auth/candidate/validate-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateTokenRequest(tampered))))
                .andExpect(status().isUnauthorized());
    }
}
