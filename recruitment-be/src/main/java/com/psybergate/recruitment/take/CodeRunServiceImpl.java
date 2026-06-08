package com.psybergate.recruitment.take;

import com.psybergate.recruitment.domain.CodeTestCase;
import com.psybergate.recruitment.judge0.CodeLanguage;
import com.psybergate.recruitment.judge0.Judge0Client;
import com.psybergate.recruitment.repository.AssessmentQuestionRepository;
import com.psybergate.recruitment.repository.CodeTestCaseRepository;
import com.psybergate.recruitment.take.dto.RunCodeResponse;
import com.psybergate.recruitment.take.dto.TestCaseRunResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CodeRunServiceImpl implements CodeRunService {

    @Autowired private AssessmentQuestionRepository assessmentQuestionRepository;
    @Autowired private CodeTestCaseRepository testCaseRepository;
    @Autowired private Judge0Client judge0Client;
    @Autowired private CodeLanguage codeLanguage;

    @Override
    @Transactional(readOnly = true)
    public RunCodeResponse run(UUID assessmentId, UUID questionId, String sourceCode, String language) {
        Set<UUID> validQuestionIds = assessmentQuestionRepository
                .findByAssessmentIdOrderByDisplayOrder(assessmentId)
                .stream()
                .map(aq -> aq.getQuestion().getId())
                .collect(Collectors.toSet());

        if (!validQuestionIds.contains(questionId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Question does not belong to this assessment");
        }

        // Only run test cases that are both visible and not deferred to submission-time only
        List<CodeTestCase> visible = testCaseRepository
                .findByQuestion_IdOrderByDisplayOrder(questionId)
                .stream()
                .filter(CodeTestCase::isVisible)
                .filter(tc -> !tc.isRunOnlyOnSubmit())
                .toList();

        String code = sourceCode == null ? "" : sourceCode;
        int langId = codeLanguage.toJudge0Id(language);
        List<TestCaseRunResult> results = visible.stream()
                .map(tc -> executeCase(tc, code, langId))
                .toList();

        return new RunCodeResponse(results);
    }

    private TestCaseRunResult executeCase(CodeTestCase tc, String sourceCode, int languageId) {
        Judge0Client.SubmissionResult result = judge0Client.execute(sourceCode, tc.getStdin(), languageId);
        String actual = normalise(result.stdout());
        String expected = normalise(tc.getExpectedOutput());
        boolean passed = result.status().id() == 3 && actual.equals(expected);
        // Prefer stderr → compile_output → Judge0 message (infrastructure errors like "no workers")
        String stderr = result.stderr() != null ? result.stderr()
                : result.compileOutput() != null ? result.compileOutput()
                : result.message();
        return new TestCaseRunResult(
                tc.getId(),
                tc.getDescription(),
                tc.getStdin(),
                tc.getExpectedOutput(),
                result.stdout(),
                passed,
                stderr,
                result.status().id(),
                result.status().description()
        );
    }

    private String normalise(String s) {
        return s == null ? "" : s.stripTrailing();
    }
}
