package com.psybergate.recruitment.question;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.question.dto.QuestionOptionRequest;
import com.psybergate.recruitment.question.dto.QuestionRequest;
import com.psybergate.recruitment.domain.Difficulty;
import com.psybergate.recruitment.domain.QuestionType;
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
class QuestionControllerIntegrationTest extends AbstractIntegrationTest {

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
        userRepository.findByEmail("qtest@integration.dev").ifPresent(userRepository::delete);
        recruiter = new User();
        recruiter.setFirstName("Test");
        recruiter.setLastName("Recruiter");
        recruiter.setEmail("qtest@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        token = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);
    }

    @AfterEach
    void tearDown() {
        questionRepository.deleteAll();
        userRepository.findByEmail("qtest@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void createMcqQuestion_valid_returns201() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.MCQ, "What is OOP?", "Explain OOP",
                List.of("java", "oop"),
                List.of(new QuestionOptionRequest("Encapsulation", true),
                        new QuestionOptionRequest("Functions", false)),
                null, null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.type").value("MCQ"))
                .andExpect(jsonPath("$.tags", hasItem("java")))
                .andExpect(jsonPath("$.options", hasSize(2)));
    }

    @Test
    void createMcqQuestion_tooFewOptions_returns400() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.MCQ, "Bad MCQ", "body", null,
                List.of(new QuestionOptionRequest("Only one", true)), null, null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMcqQuestion_noCorrectOption_returns400() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.MCQ, "Bad MCQ", "body", null,
                List.of(new QuestionOptionRequest("A", false), new QuestionOptionRequest("B", false)), null, null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTextQuestion_returns201() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Describe yourself", "body",
                List.of("hr"), null, null, null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("TEXT"));
    }

    @Test
    void createCodeSubmissionQuestion_returns201() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.CODE_SUBMISSION,
                "Write a sort", "Implement merge sort", List.of("algorithms"), null, "java", null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.languageHint").value("java"));
    }

    @Test
    void listQuestions_filterByType_returnsCorrectSubset() throws Exception {
        createTextQuestionDirect();

        mockMvc.perform(get("/api/questions?type=TEXT")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].type", everyItem(equalTo("TEXT"))));
    }

    @Test
    void listQuestions_filterByTag_returnsCorrectSubset() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Tagged Q", "body",
                List.of("uniquetag123"), null, null, null, null, null);
        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/questions?tag=uniquetag123")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void getById_returns200() throws Exception {
        String body = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTextQuestionRequest())))
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(body).get("id").asText();

        mockMvc.perform(get("/api/questions/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    void updateQuestion_returns200() throws Exception {
        String body = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTextQuestionRequest())))
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(body).get("id").asText();

        QuestionRequest update = new QuestionRequest(QuestionType.TEXT, "Updated Title", "Updated body",
                List.of("updated"), null, null, null, null, null);

        mockMvc.perform(put("/api/questions/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    @Test
    void updateQuestion_setsDifficultyOnExistingQuestion() throws Exception {
        // Create without difficulty
        String body = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTextQuestionRequest())))
                .andReturn().getResponse().getContentAsString();
        String id = objectMapper.readTree(body).get("id").asText();

        // Update: add difficulty HARD
        QuestionRequest withDifficulty = new QuestionRequest(QuestionType.TEXT, "Sample", "body",
                null, null, null, null, null, Difficulty.HARD);
        mockMvc.perform(put("/api/questions/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(withDifficulty)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.difficulty").value("HARD"));

        // Update again: change difficulty to EASY
        QuestionRequest changeDifficulty = new QuestionRequest(QuestionType.TEXT, "Sample", "body",
                null, null, null, null, null, Difficulty.EASY);
        mockMvc.perform(put("/api/questions/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeDifficulty)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.difficulty").value("EASY"));

        // Update: clear difficulty (null)
        QuestionRequest clearDifficulty = new QuestionRequest(QuestionType.TEXT, "Sample", "body",
                null, null, null, null, null, null);
        mockMvc.perform(put("/api/questions/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clearDifficulty)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.difficulty").doesNotExist());
    }

    @Test
    void deleteQuestion_returns204() throws Exception {
        String body = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTextQuestionRequest())))
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(body).get("id").asText();

        mockMvc.perform(delete("/api/questions/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/questions/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isUnauthorized());
    }

    private QuestionRequest createTextQuestionRequest() {
        return new QuestionRequest(QuestionType.TEXT, "Sample", "body", null, null, null, null, null, null);
    }

    @Test
    void createQuestion_withDifficulty_returnsCorrectDifficulty() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Hard Q", "body", null, null, null, null, null, Difficulty.HARD);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.difficulty").value("HARD"));
    }

    @Test
    void createQuestion_withoutDifficulty_returnsNullDifficulty() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Unrated Q", "body", null, null, null, null, null, null);

        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.difficulty").doesNotExist());
    }

    private void createTextQuestionDirect() throws Exception {
        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTextQuestionRequest())))
                .andExpect(status().isCreated());
    }
}
