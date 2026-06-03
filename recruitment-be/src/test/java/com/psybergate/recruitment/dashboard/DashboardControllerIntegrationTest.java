package com.psybergate.recruitment.dashboard;

import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.*;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class DashboardControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private String recruiterSessionCookie;

    @BeforeEach
    void setUp() throws Exception {
        User recruiter = new User();
        recruiter.setEmail("dashboard-test@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        userRepository.save(recruiter);

        String loginBody = """
                {"email":"dashboard-test@integration.dev","password":"pass"}
                """;
        var loginResult = mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .post("/api/auth/login")
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                                .content(loginBody))
                .andExpect(status().isOk())
                .andReturn();
        recruiterSessionCookie = loginResult.getResponse().getHeader("Set-Cookie");
    }

    @AfterEach
    void tearDown() {
        userRepository.findByEmail("dashboard-test@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void getDashboardStats_includesPipelineFlaggedField() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats")
                        .header("Cookie", recruiterSessionCookie != null ? recruiterSessionCookie : ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pipeline.flagged").value(0))
                .andExpect(jsonPath("$.pipeline.invited").isNumber())
                .andExpect(jsonPath("$.pipeline.completed").isNumber());
    }
}
