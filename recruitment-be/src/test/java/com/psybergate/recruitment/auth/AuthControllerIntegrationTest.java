package com.psybergate.recruitment.auth;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.auth.dto.LoginRequest;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.repository.UserRepository;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private static final String TEST_EMAIL = "test@integration.dev";
    private static final String TEST_PASSWORD = "testpass123";

    @BeforeEach
    void setUp() {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
        User user = new User();
        user.setEmail(TEST_EMAIL);
        user.setPasswordHash(passwordEncoder.encode(TEST_PASSWORD));
        user.setRole(Role.RECRUITER);
        userRepository.save(user);
    }

    @AfterEach
    void tearDown() {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    }

    // Task 3.4 — login endpoint
    @Test
    void login_success_returnsTokenAndRole() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(TEST_EMAIL, TEST_PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role").value("RECRUITER"));
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(TEST_EMAIL, "wrongpass"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_unknownEmail_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("nobody@nowhere.dev", "pass"))))
                .andExpect(status().isUnauthorized());
    }

    // Task 4.4 — protected endpoint access
    @Test
    void protectedEndpoint_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/protected-ping"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withValidToken_returns200() throws Exception {
        User user = userRepository.findByEmail(TEST_EMAIL).orElseThrow();
        String token = jwtService.generateToken(user.getId().toString(), Role.RECRUITER, 1L);

        mockMvc.perform(get("/api/protected-ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
