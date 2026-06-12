package com.psybergate.recruitment.execution;

import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.execution.dto.PistonExecuteResponse;
import com.psybergate.recruitment.execution.dto.PistonStageResult;
import com.psybergate.recruitment.execution.dto.RunCodeRequest;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class CodeExecutionControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtService jwtService;

    @MockitoBean
    PistonClient pistonClient;

    private String candidateSessionToken;

    private static final String HELLO_WORLD =
            "public class Main { public static void main(String[] args) { System.out.println(\"hi\"); } }";

    @BeforeEach
    void setUp() {
        candidateSessionToken = jwtService.generateCandidateSessionToken(
                UUID.randomUUID().toString(),
                UUID.randomUUID().toString());
    }

    @Test
    void run_validCode_returns200WithOkStatus() throws Exception {
        when(pistonClient.execute(anyString(), any())).thenReturn(new PistonExecuteResponse(
                "java", "15.0.2",
                new PistonStageResult("", "", "", 0, null),
                new PistonStageResult("hi\n", "", "hi\n", 0, null)));

        mockMvc.perform(post("/api/take/run")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RunCodeRequest(HELLO_WORLD, ""))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.stdout").value("hi\n"))
                .andExpect(jsonPath("$.exitCode").value(0));
    }

    @Test
    void run_compileError_returns200WithCompileErrorStatus() throws Exception {
        when(pistonClient.execute(anyString(), any())).thenReturn(new PistonExecuteResponse(
                "java", "15.0.2",
                new PistonStageResult("", "error: ';' expected", "error: ';' expected", 1, null),
                null));

        mockMvc.perform(post("/api/take/run")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RunCodeRequest("broken", ""))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPILE_ERROR"))
                .andExpect(jsonPath("$.compileOutput", containsString("error")));
    }

    @Test
    void run_blankCode_returns400() throws Exception {
        mockMvc.perform(post("/api/take/run")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RunCodeRequest("   ", null))))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(pistonClient);
    }

    @Test
    void run_oversizedCode_returns400() throws Exception {
        String oversized = "x".repeat(65_536);
        mockMvc.perform(post("/api/take/run")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RunCodeRequest(oversized, null))))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(pistonClient);
    }

    @Test
    void run_noJwt_returns401Or403() throws Exception {
        mockMvc.perform(post("/api/take/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RunCodeRequest(HELLO_WORLD, null))))
                .andExpect(status().is(anyOf(equalTo(401), equalTo(403))));

        verifyNoInteractions(pistonClient);
    }

    @Test
    void run_staffJwt_returns403() throws Exception {
        String staffToken = jwtService.generateToken(UUID.randomUUID().toString(), Role.RECRUITER, 1);

        mockMvc.perform(post("/api/take/run")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RunCodeRequest(HELLO_WORLD, null))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(pistonClient);
    }
}
