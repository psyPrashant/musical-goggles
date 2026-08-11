package com.psybergate.recruitment.ai.client;

import com.psybergate.recruitment.ai.AiAuthenticationException;
import com.psybergate.recruitment.ai.AiCommunicationException;
import com.psybergate.recruitment.ai.AiProperties;
import com.psybergate.recruitment.ai.AiRateLimitException;
import com.psybergate.recruitment.ai.AiResponseException;
import com.psybergate.recruitment.ai.AiTimeoutException;
import com.psybergate.recruitment.ai.dto.GroqChatRequest;
import com.psybergate.recruitment.ai.dto.GroqChatResponse;
import com.psybergate.recruitment.ai.dto.GroqMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.net.SocketTimeoutException;
import java.time.Duration;
import java.util.List;

@Slf4j
@Component
public class GroqClient implements AiClient {

    private final AiProperties properties;
    private final RestClient restClient;

    public GroqClient(AiProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setReadTimeout(Duration.ofSeconds(properties.timeoutSeconds()));
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public String sendPrompt(String prompt) {
        long startTime = System.currentTimeMillis();
        log.info("AI request initiated — provider: Groq, model: {}", properties.model());

        GroqChatRequest request = new GroqChatRequest(
                properties.model(),
                List.of(new GroqMessage("user", prompt)),
                properties.temperature()
        );

        try {
            GroqChatResponse response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .onStatus(status -> status.value() == 401, (req, res) -> {
                        throw new AiAuthenticationException("AI authentication failed: invalid API key");
                    })
                    .onStatus(status -> status.value() == 429, (req, res) -> {
                        throw new AiRateLimitException("AI rate limit exceeded: too many requests");
                    })
                    .onStatus(status -> status.is5xxServerError(), (req, res) -> {
                        throw new AiCommunicationException("AI provider error: " + res.getStatusCode());
                    })
                    .body(GroqChatResponse.class);

            if (response == null
                    || response.choices() == null
                    || response.choices().isEmpty()
                    || response.choices().get(0).message() == null) {
                long elapsed = System.currentTimeMillis() - startTime;
                AiResponseException ex = new AiResponseException("AI response missing expected content structure");
                log.error("AI request failed — type: {}, elapsed: {}ms", ex.getClass().getSimpleName(), elapsed);
                throw ex;
            }

            String content = response.choices().get(0).message().content();
            if (content == null || content.isBlank()) {
                long elapsed = System.currentTimeMillis() - startTime;
                AiResponseException ex = new AiResponseException("AI response returned null or blank content");
                log.error("AI request failed — type: {}, elapsed: {}ms", ex.getClass().getSimpleName(), elapsed);
                throw ex;
            }

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("AI request succeeded — provider: Groq, model: {}, elapsed: {}ms", properties.model(), elapsed);
            return content;

        } catch (AiAuthenticationException | AiRateLimitException | AiCommunicationException | AiResponseException ex) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("AI request failed — type: {}, elapsed: {}ms", ex.getClass().getSimpleName(), elapsed);
            throw ex;
        } catch (ResourceAccessException ex) {
            long elapsed = System.currentTimeMillis() - startTime;
            RuntimeException mapped;
            if (ex.getCause() instanceof SocketTimeoutException) {
                mapped = new AiTimeoutException("AI request timed out after " + properties.timeoutSeconds() + " seconds");
            } else {
                mapped = new AiCommunicationException("AI request failed due to network error: " + ex.getMessage());
            }
            log.error("AI request failed — type: {}, elapsed: {}ms", mapped.getClass().getSimpleName(), elapsed);
            throw mapped;
        }
    }
}
