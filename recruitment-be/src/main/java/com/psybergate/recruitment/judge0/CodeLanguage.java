package com.psybergate.recruitment.judge0;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Maps the platform's language codes to Judge0 language IDs.
 *
 * Defaults match standard Judge0 CE (docker image judge0/judge0:1.13.1).
 * Override via environment variables when using Judge0 Extra CE / RapidAPI:
 *   JUDGE0_LANG_JAVA=91  JUDGE0_LANG_CSHARP=29  JUDGE0_LANG_PYTHON=71
 */
@Component
public class CodeLanguage {

    private final int javaId;
    private final int csharpId;
    private final int pythonId;

    public CodeLanguage(
            @Value("${app.judge0.language-ids.java:62}")   int javaId,
            @Value("${app.judge0.language-ids.csharp:51}") int csharpId,
            @Value("${app.judge0.language-ids.python:71}") int pythonId
    ) {
        this.javaId   = javaId;
        this.csharpId = csharpId;
        this.pythonId = pythonId;
    }

    public int toJudge0Id(String language) {
        return switch (language == null ? "" : language.toLowerCase().trim()) {
            case "csharp", "c#", "cs" -> csharpId;
            case "python", "py"        -> pythonId;
            default                    -> javaId;   // "java" + fallback
        };
    }
}
