package com.psybergate.recruitment.questiongroup;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.QuestionType;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.question.dto.QuestionRequest;
import com.psybergate.recruitment.questiongroup.dto.AddQuestionToGroupRequest;
import com.psybergate.recruitment.questiongroup.dto.QuestionGroupRequest;
import com.psybergate.recruitment.repository.QuestionGroupRepository;
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

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class QuestionGroupControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired QuestionGroupRepository groupRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private String token;
    private User recruiter;

    @BeforeEach
    void setUp() {
        userRepository.findByEmail("grptest@integration.dev").ifPresent(userRepository::delete);
        recruiter = new User();
        recruiter.setEmail("grptest@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        token = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);
    }

    @AfterEach
    void tearDown() {
        groupRepository.deleteAll();
        questionRepository.deleteAll();
        userRepository.findByEmail("grptest@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void createGroup_returns201() throws Exception {
        QuestionGroupRequest req = new QuestionGroupRequest("Java Basics", "Core Java questions", false);

        mockMvc.perform(post("/api/question-groups")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Java Basics"))
                .andExpect(jsonPath("$.structured").value(false));
    }

    @Test
    void createGroup_duplicateName_returns409() throws Exception {
        QuestionGroupRequest req = new QuestionGroupRequest("Duplicate Group", null, false);

        mockMvc.perform(post("/api/question-groups")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/question-groups")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    void addQuestion_unorderedGroup_returns200() throws Exception {
        UUID groupId = createGroup(false);
        UUID questionId = createTextQuestion();

        mockMvc.perform(post("/api/question-groups/" + groupId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddQuestionToGroupRequest(questionId, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions", hasSize(1)));
    }

    @Test
    void addQuestion_idempotent_noDuplicate() throws Exception {
        UUID groupId = createGroup(false);
        UUID questionId = createTextQuestion();

        AddQuestionToGroupRequest req = new AddQuestionToGroupRequest(questionId, null);

        mockMvc.perform(post("/api/question-groups/" + groupId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/question-groups/" + groupId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions", hasSize(1)));
    }

    @Test
    void addQuestion_structuredGroup_withoutDisplayOrder_returns400() throws Exception {
        UUID groupId = createGroup(true);
        UUID questionId = createTextQuestion();

        mockMvc.perform(post("/api/question-groups/" + groupId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddQuestionToGroupRequest(questionId, null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addQuestion_structuredGroup_withDisplayOrder_returns200() throws Exception {
        UUID groupId = createGroup(true);
        UUID questionId = createTextQuestion();

        mockMvc.perform(post("/api/question-groups/" + groupId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddQuestionToGroupRequest(questionId, 10))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].displayOrder").value(10));
    }

    @Test
    void removeQuestion_returns204() throws Exception {
        UUID groupId = createGroup(false);
        UUID questionId = createTextQuestion();

        mockMvc.perform(post("/api/question-groups/" + groupId + "/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddQuestionToGroupRequest(questionId, null))))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/question-groups/" + groupId + "/questions/" + questionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/question-groups/" + groupId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.questions", hasSize(0)));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private UUID createGroup(boolean structured) throws Exception {
        String name = "Group-" + UUID.randomUUID();
        QuestionGroupRequest req = new QuestionGroupRequest(name, null, structured);
        String body = mockMvc.perform(post("/api/question-groups")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return UUID.fromString(objectMapper.readTree(body).get("id").asText());
    }

    private UUID createTextQuestion() throws Exception {
        QuestionRequest req = new QuestionRequest(QuestionType.TEXT, "Q-" + UUID.randomUUID(),
                "body", null, null, null);
        String body = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return UUID.fromString(objectMapper.readTree(body).get("id").asText());
    }
}
