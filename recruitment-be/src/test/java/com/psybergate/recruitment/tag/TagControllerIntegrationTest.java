package com.psybergate.recruitment.tag;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.QuestionType;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.question.dto.QuestionRequest;
import com.psybergate.recruitment.repository.QuestionRepository;
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

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class TagControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private String token;
    private User recruiter;

    @BeforeEach
    void setUp() {
        userRepository.findByEmail("tagtest@integration.dev").ifPresent(userRepository::delete);
        recruiter = new User();
        recruiter.setEmail("tagtest@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        token = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);
    }

    @AfterEach
    void tearDown() {
        questionRepository.deleteAll();
        userRepository.findByEmail("tagtest@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void listTags_returnsInUseTags() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Tagged Question", "body",
                List.of("java", "sql"), null, null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/tags").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItems("java", "sql")));
    }

    @Test
    void listTags_normalizedToLowercase() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Q", "body",
                List.of("JAVA", "Sql"), null, null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/tags").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItems("java", "sql")))
                .andExpect(jsonPath("$", not(hasItem("JAVA"))));
    }

    @Test
    void listTags_orphansCleanedUpOnDelete() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Orphan Q", "body",
                List.of("orphantag999"), null, null, null, null);

        String body = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn().getResponse().getContentAsString();

        String questionId = objectMapper.readTree(body).get("id").asText();

        mockMvc.perform(delete("/api/questions/" + questionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tags").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(hasItem("orphantag999"))));
    }
}
