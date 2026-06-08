package com.psybergate.recruitment.judge0;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class Judge0Client {

    private final RestClient restClient;

    public Judge0Client(
            @Value("${app.judge0.base-url:http://localhost:2358}") String baseUrl,
            @Value("${app.judge0.api-key:}") String apiKey
    ) {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(baseUrl);

        if (apiKey != null && !apiKey.isBlank()) {
            builder.defaultHeader("X-RapidAPI-Key", apiKey)
                   .defaultHeader("X-RapidAPI-Host", "judge0-ce.p.rapidapi.com");
        }

        this.restClient = builder.build();
    }

    public SubmissionResult execute(String sourceCode, String stdin, int languageId) {
        SubmissionRequest request = new SubmissionRequest(sourceCode, languageId, stdin);
        return restClient.post()
                .uri("/submissions?base64_encoded=false&wait=true")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (req, res) -> {
                    String detail = "Judge0 returned HTTP " + res.getStatusCode().value()
                            + " — check language IDs and Judge0 configuration.";
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, detail);
                })
                .body(SubmissionResult.class);
    }

    public record SubmissionRequest(
            @JsonProperty("source_code") String sourceCode,
            @JsonProperty("language_id") int languageId,
            String stdin
    ) {}

    /** Judge0 submission result. Unknown fields are ignored so new API fields don't break deserialization. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SubmissionResult(
            String stdout,
            String stderr,
            @JsonProperty("compile_output") String compileOutput,
            String message,          // present on Judge0 internal errors (e.g. no workers running)
            Judge0Status status,
            String time,
            Integer memory
    ) {}

    public record Judge0Status(int id, String description) {}
}
