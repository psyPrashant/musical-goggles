package com.psybergate.recruitment.execution;

import com.psybergate.recruitment.execution.dto.PistonExecuteResponse;
import com.psybergate.recruitment.execution.dto.PistonStageResult;
import com.psybergate.recruitment.execution.dto.RunCodeRequest;
import com.psybergate.recruitment.execution.dto.RunCodeResponse;
import com.psybergate.recruitment.execution.dto.RunStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class CodeExecutionServiceImpl implements CodeExecutionService {

    private final PistonClient pistonClient;
    private final PistonProperties properties;

    // The public Piston API allows ~1 req/s per IP, so upstream calls are
    // serialized and spaced at least minIntervalMs apart.
    private final ReentrantLock lock = new ReentrantLock(true);
    private volatile long lastCallAtMs = 0;

    public CodeExecutionServiceImpl(PistonClient pistonClient, PistonProperties properties) {
        this.pistonClient = pistonClient;
        this.properties = properties;
    }

    @Override
    public RunCodeResponse run(RunCodeRequest request) {
        boolean acquired;
        try {
            acquired = lock.tryLock(properties.maxQueueWaitMs(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Code execution was interrupted");
        }
        if (!acquired) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Execution engine is busy — please try again in a moment");
        }
        try {
            waitForUpstreamSpacing();
            PistonExecuteResponse pistonResponse = callPiston(request);
            return mapResponse(pistonResponse);
        } finally {
            lastCallAtMs = System.currentTimeMillis();
            lock.unlock();
        }
    }

    private void waitForUpstreamSpacing() {
        long waitMs = lastCallAtMs + properties.minIntervalMs() - System.currentTimeMillis();
        if (waitMs > 0) {
            try {
                Thread.sleep(waitMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Code execution was interrupted");
            }
        }
    }

    private PistonExecuteResponse callPiston(RunCodeRequest request) {
        try {
            return pistonClient.execute(request.code(), request.stdin());
        } catch (ResourceAccessException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Code execution service is unavailable");
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == HttpStatus.TOO_MANY_REQUESTS.value()) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Execution engine is busy — please try again in a moment");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Code execution failed upstream");
        }
    }

    private RunCodeResponse mapResponse(PistonExecuteResponse response) {
        if (response == null || (response.run() == null && response.compile() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Code execution returned an invalid result");
        }
        PistonStageResult compile = response.compile();
        PistonStageResult run = response.run();

        String compileOutput = compile == null ? null : nonBlank(compile.output());
        if (compile != null && "SIGKILL".equals(compile.signal())) {
            return new RunCodeResponse(RunStatus.TIMED_OUT, null, null, compileOutput, compile.code());
        }
        if (compile != null && compile.code() != null && compile.code() != 0) {
            return new RunCodeResponse(RunStatus.COMPILE_ERROR, null, null, compileOutput, compile.code());
        }
        if (run == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Code execution returned an invalid result");
        }
        if ("SIGKILL".equals(run.signal())) {
            return new RunCodeResponse(RunStatus.TIMED_OUT, run.stdout(), run.stderr(), compileOutput, run.code());
        }
        if (run.code() != null && run.code() != 0) {
            // Piston's java package uses the single-file source launcher, so javac
            // failures surface in the run stage's stderr rather than a compile stage.
            if (compile == null && run.stderr() != null && run.stderr().contains("error: compilation failed")) {
                return new RunCodeResponse(RunStatus.COMPILE_ERROR, null, null, run.stderr(), run.code());
            }
            return new RunCodeResponse(RunStatus.RUNTIME_ERROR, run.stdout(), run.stderr(), compileOutput, run.code());
        }
        return new RunCodeResponse(RunStatus.OK, run.stdout(), run.stderr(), compileOutput, run.code());
    }

    private String nonBlank(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
