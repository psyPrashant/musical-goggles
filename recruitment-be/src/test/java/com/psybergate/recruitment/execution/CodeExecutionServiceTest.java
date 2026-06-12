package com.psybergate.recruitment.execution;

import com.psybergate.recruitment.execution.dto.PistonExecuteResponse;
import com.psybergate.recruitment.execution.dto.PistonStageResult;
import com.psybergate.recruitment.execution.dto.RunCodeRequest;
import com.psybergate.recruitment.execution.dto.RunCodeResponse;
import com.psybergate.recruitment.execution.dto.RunStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodeExecutionServiceTest {

    @Mock
    private PistonClient pistonClient;

    private CodeExecutionServiceImpl service;

    private static final RunCodeRequest REQUEST =
            new RunCodeRequest("public class Main { public static void main(String[] a) {} }", null);

    @BeforeEach
    void setUp() {
        PistonProperties properties = new PistonProperties(
                "http://localhost:2000/api/v2",
                "*",
                Duration.ofSeconds(3),
                Duration.ofSeconds(20),
                5000,
                10000,
                0,    // no upstream spacing in unit tests
                100); // short queue wait so contention tests are fast
        service = new CodeExecutionServiceImpl(pistonClient, properties);
    }

    private PistonExecuteResponse pistonResponse(PistonStageResult compile, PistonStageResult run) {
        return new PistonExecuteResponse("java", "15.0.2", compile, run);
    }

    private PistonStageResult stage(String stdout, String stderr, Integer code, String signal) {
        String output = (stdout == null ? "" : stdout) + (stderr == null ? "" : stderr);
        return new PistonStageResult(stdout, stderr, output, code, signal);
    }

    // ── status mapping ────────────────────────────────────────────────────────

    @Test
    void run_successfulExecution_mapsToOk() {
        when(pistonClient.execute(anyString(), any()))
                .thenReturn(pistonResponse(stage("", "", 0, null), stage("hi\n", "", 0, null)));

        RunCodeResponse response = service.run(REQUEST);

        assertThat(response.status()).isEqualTo(RunStatus.OK);
        assertThat(response.stdout()).isEqualTo("hi\n");
        assertThat(response.exitCode()).isZero();
    }

    @Test
    void run_compileFailure_mapsToCompileError() {
        when(pistonClient.execute(anyString(), any()))
                .thenReturn(pistonResponse(stage("", "Main.java:1: error: ';' expected", 1, null), null));

        RunCodeResponse response = service.run(REQUEST);

        assertThat(response.status()).isEqualTo(RunStatus.COMPILE_ERROR);
        assertThat(response.compileOutput()).contains("error");
        assertThat(response.exitCode()).isEqualTo(1);
    }

    @Test
    void run_sourceLauncherCompileFailure_mapsToCompileError() {
        // Piston's java package has no compile stage; javac errors land in run stderr.
        String stderr = "Main.java:1: error: ';' expected\n1 error\nerror: compilation failed\n";
        when(pistonClient.execute(anyString(), any()))
                .thenReturn(pistonResponse(null, stage("", stderr, 1, null)));

        RunCodeResponse response = service.run(REQUEST);

        assertThat(response.status()).isEqualTo(RunStatus.COMPILE_ERROR);
        assertThat(response.compileOutput()).contains("';' expected");
    }

    @Test
    void run_sigkilledRun_mapsToTimedOut() {
        when(pistonClient.execute(anyString(), any()))
                .thenReturn(pistonResponse(stage("", "", 0, null), stage("", "", null, "SIGKILL")));

        RunCodeResponse response = service.run(REQUEST);

        assertThat(response.status()).isEqualTo(RunStatus.TIMED_OUT);
    }

    @Test
    void run_sigkilledCompile_mapsToTimedOut() {
        when(pistonClient.execute(anyString(), any()))
                .thenReturn(pistonResponse(stage("", "", null, "SIGKILL"), null));

        RunCodeResponse response = service.run(REQUEST);

        assertThat(response.status()).isEqualTo(RunStatus.TIMED_OUT);
    }

    @Test
    void run_nonZeroExit_mapsToRuntimeError() {
        when(pistonClient.execute(anyString(), any()))
                .thenReturn(pistonResponse(stage("", "", 0, null),
                        stage("", "Exception in thread \"main\" java.lang.RuntimeException", 1, null)));

        RunCodeResponse response = service.run(REQUEST);

        assertThat(response.status()).isEqualTo(RunStatus.RUNTIME_ERROR);
        assertThat(response.stderr()).contains("RuntimeException");
    }

    // ── error translation ─────────────────────────────────────────────────────

    @Test
    void run_pistonUnreachable_translatesTo503() {
        when(pistonClient.execute(anyString(), any()))
                .thenThrow(new ResourceAccessException("connection refused"));

        assertThatThrownBy(() -> service.run(REQUEST))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
    }

    @Test
    void run_upstreamRateLimit_translatesTo429() {
        when(pistonClient.execute(anyString(), any()))
                .thenThrow(new RestClientResponseException("rate limited", 429, "Too Many Requests",
                        null, null, StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service.run(REQUEST))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
    }

    @Test
    void run_otherUpstreamError_translatesTo502() {
        when(pistonClient.execute(anyString(), any()))
                .thenThrow(new RestClientResponseException("boom", 500, "Internal Server Error",
                        null, null, StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service.run(REQUEST))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY));
    }

    @Test
    void run_emptyUpstreamResponse_translatesTo502() {
        when(pistonClient.execute(anyString(), any())).thenReturn(null);

        assertThatThrownBy(() -> service.run(REQUEST))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY));
    }

    // ── serialization / contention ────────────────────────────────────────────

    @Test
    void run_lockHeldLongerThanQueueWait_returns429() throws Exception {
        CountDownLatch firstCallStarted = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);
        when(pistonClient.execute(anyString(), any())).thenAnswer(invocation -> {
            firstCallStarted.countDown();
            release.await(5, TimeUnit.SECONDS);
            return pistonResponse(stage("", "", 0, null), stage("", "", 0, null));
        });

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<RunCodeResponse> first = executor.submit(() -> service.run(REQUEST));
            assertThat(firstCallStarted.await(5, TimeUnit.SECONDS)).isTrue();

            // Second request cannot acquire the slot within maxQueueWaitMs (100ms)
            assertThatThrownBy(() -> service.run(REQUEST))
                    .isInstanceOfSatisfying(ResponseStatusException.class,
                            e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));

            release.countDown();
            assertThat(first.get(5, TimeUnit.SECONDS).status()).isEqualTo(RunStatus.OK);
        } finally {
            release.countDown();
            executor.shutdownNow();
        }
    }
}
