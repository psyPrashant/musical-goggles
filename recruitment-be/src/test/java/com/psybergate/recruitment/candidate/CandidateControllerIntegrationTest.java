package com.psybergate.recruitment.candidate;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.candidate.dto.CandidateRequest;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.repository.CandidateRepository;
import com.psybergate.recruitment.repository.UserRepository;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class CandidateControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CandidateRepository candidateRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private String token;
    private User recruiter;

    @BeforeEach
    void setUp() {
        userRepository.findByEmail("ctest@integration.dev").ifPresent(userRepository::delete);
        recruiter = new User();
        recruiter.setFirstName("Test");
        recruiter.setLastName("Recruiter");
        recruiter.setEmail("ctest@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        token = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);
    }

    @AfterEach
    void tearDown() {
        candidateRepository.findAll().stream()
                .filter(c -> c.getEmail().endsWith("@ctest.dev"))
                .forEach(candidateRepository::delete);
        userRepository.findByEmail("ctest@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void createCandidate_withInvalidPhone_returns400() throws Exception {
        CandidateRequest request = new CandidateRequest("Alice", "Smith", "alice@ctest.dev", "not-a-phone!!");

        mockMvc.perform(post("/api/candidates")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCandidate_withValidPhone_returns201AndIncludesPhone() throws Exception {
        CandidateRequest request = new CandidateRequest("Bob", "Jones", "bob@ctest.dev", "+27 82 123 4567");

        mockMvc.perform(post("/api/candidates")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cellPhone").value("+27 82 123 4567"));
    }

    @Test
    void createCandidate_withoutPhone_returns201AndNullPhone() throws Exception {
        CandidateRequest request = new CandidateRequest("Carol", "Lee", "carol@ctest.dev", null);

        mockMvc.perform(post("/api/candidates")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cellPhone").doesNotExist());
    }

    @Test
    void updateCandidate_withInvalidPhone_returns400() throws Exception {
        // Create first
        CandidateRequest create = new CandidateRequest("Dave", "Chen", "dave@ctest.dev", null);
        String body = mockMvc.perform(post("/api/candidates")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andReturn().getResponse().getContentAsString();
        UUID id = UUID.fromString(objectMapper.readTree(body).get("id").asText());

        CandidateRequest update = new CandidateRequest("Dave", "Chen", "dave@ctest.dev", "INVALID!!!");
        mockMvc.perform(put("/api/candidates/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());
    }
}
