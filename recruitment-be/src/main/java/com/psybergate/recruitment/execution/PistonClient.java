package com.psybergate.recruitment.execution;

import com.psybergate.recruitment.execution.dto.PistonExecuteRequest;
import com.psybergate.recruitment.execution.dto.PistonExecuteResponse;
import com.psybergate.recruitment.execution.dto.PistonFile;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class PistonClient {

    private final PistonProperties properties;
    private final RestClient restClient;

    public PistonClient(PistonProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.connectTimeout());
        requestFactory.setReadTimeout(properties.readTimeout());
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .build();
    }

    public PistonExecuteResponse execute(String code, String stdin) {
        // Piston's java runner appends ".java", so "Main" yields Main.java and
        // clean "at Main.main(Main.java:n)" stack traces for the candidate.
        PistonExecuteRequest request = new PistonExecuteRequest(
                "java",
                properties.javaVersion(),
                List.of(new PistonFile("Main", code)),
                stdin == null ? "" : stdin,
                properties.compileTimeoutMs(),
                properties.runTimeoutMs());
        return restClient.post()
                .uri("/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(PistonExecuteResponse.class);
    }
}
