package com.psybergate.recruitment.execution;

import com.psybergate.recruitment.execution.dto.RunCodeRequest;
import com.psybergate.recruitment.execution.dto.RunCodeResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/take")
@PreAuthorize("hasRole('CANDIDATE')")
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService codeExecutionService;

    @PostMapping("/run")
    public ResponseEntity<RunCodeResponse> run(@RequestBody @Valid RunCodeRequest request) {
        return ResponseEntity.ok(codeExecutionService.run(request));
    }
}
