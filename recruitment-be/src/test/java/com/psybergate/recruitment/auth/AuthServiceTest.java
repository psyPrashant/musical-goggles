package com.psybergate.recruitment.auth;

import com.psybergate.recruitment.auth.dto.*;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.repository.UserRepository;
import com.psybergate.recruitment.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl service;

    private User recruiterUser;
    private User candidateUser;

    @BeforeEach
    void setUp() {
        recruiterUser = new User();
        recruiterUser.setId(UUID.randomUUID());
        recruiterUser.setEmail("recruiter@example.com");
        recruiterUser.setPasswordHash("hashed-password");
        recruiterUser.setRole(Role.RECRUITER);
        recruiterUser.setFirstName("Recruiter");
        recruiterUser.setLastName("User");

        candidateUser = new User();
        candidateUser.setId(UUID.randomUUID());
        candidateUser.setEmail("candidate@example.com");
        candidateUser.setPasswordHash("hashed-password");
        candidateUser.setRole(Role.CANDIDATE);
        candidateUser.setFirstName("Cand");
        candidateUser.setLastName("Idate");
    }

    // ── login() ───────────────────────────────────────────────────────────────

    @Test
    void login_userNotFound_throws401() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequest("missing@example.com", "pass")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void login_wrongPassword_throws401() {
        when(userRepository.findByEmail(recruiterUser.getEmail())).thenReturn(Optional.of(recruiterUser));
        when(passwordEncoder.matches("wrong", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> service.login(new LoginRequest(recruiterUser.getEmail(), "wrong")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void login_nonCandidateRole_uses1HourTtl() {
        when(userRepository.findByEmail(recruiterUser.getEmail())).thenReturn(Optional.of(recruiterUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), anyLong())).thenReturn("token");

        service.login(new LoginRequest(recruiterUser.getEmail(), "pass"));

        // Non-CANDIDATE role must use 1-hour TTL (kills `role == CANDIDATE ? 2L : 1L` mutants)
        verify(jwtService).generateToken(
                eq(recruiterUser.getId().toString()),
                eq(Role.RECRUITER),
                eq(1L));
    }

    @Test
    void login_candidateRole_uses2HourTtl() {
        when(userRepository.findByEmail(candidateUser.getEmail())).thenReturn(Optional.of(candidateUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), anyLong())).thenReturn("token");

        service.login(new LoginRequest(candidateUser.getEmail(), "pass"));

        // CANDIDATE role must use 2-hour TTL (kills mutation that collapses the ternary)
        verify(jwtService).generateToken(
                eq(candidateUser.getId().toString()),
                eq(Role.CANDIDATE),
                eq(2L));
    }

    @Test
    void login_happyPath_returnsResponseWithRoleAndName() {
        when(userRepository.findByEmail(recruiterUser.getEmail())).thenReturn(Optional.of(recruiterUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), anyLong())).thenReturn("the-token");

        LoginResponse response = service.login(new LoginRequest(recruiterUser.getEmail(), "pass"));

        assertThat(response.token()).isEqualTo("the-token");
        assertThat(response.role()).isEqualTo(Role.RECRUITER.name());
        assertThat(response.firstName()).isEqualTo("Recruiter");
        assertThat(response.lastName()).isEqualTo("User");
    }

    // ── validateCandidateToken() ──────────────────────────────────────────────

    @Test
    void validateCandidateToken_validToken_returnsSessionToken() {
        String invitationToken = "valid-token";
        String candidateId = UUID.randomUUID().toString();
        String assessmentId = UUID.randomUUID().toString();

        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn(candidateId);
        when(claims.get("assessmentId", String.class)).thenReturn(assessmentId);
        when(jwtService.extractClaims(invitationToken)).thenReturn(claims);
        when(jwtService.generateCandidateSessionToken(candidateId, assessmentId)).thenReturn("session-token");

        CandidateTokenResponse response = service.validateCandidateToken(
                new CandidateTokenRequest(invitationToken));

        assertThat(response.token()).isEqualTo("session-token");
    }

    @Test
    void validateCandidateToken_invalidToken_throws401() {
        when(jwtService.extractClaims("bad-token")).thenThrow(new RuntimeException("Invalid JWT"));

        assertThatThrownBy(() -> service.validateCandidateToken(new CandidateTokenRequest("bad-token")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }
}
