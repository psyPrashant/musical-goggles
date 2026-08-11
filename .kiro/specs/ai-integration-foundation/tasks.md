# Implementation Plan: AI Integration Foundation

## Overview

Build the `com.psybergate.recruitment.ai` package — configuration, exception classes, DTO records, `AiClient` interface + `GroqClient` implementation, `AiService` interface + `AiServiceImpl` — mirroring the `execution/` package pattern. Add jqwik test dependency, update `application.yaml`, and wire everything via Spring Boot auto-configuration.

---

## Tasks

- [x] 1. Add jqwik test dependency and update application.yaml
  - [x] 1.1 Add jqwik to pom.xml as test-scoped dependency
    - Add `net.jqwik:jqwik:1.9.3` under `<dependencies>` with `<scope>test</scope>`
    - Verify `./mvnw test-compile` succeeds after the change
    - _Requirements: (prerequisite for all PBT tasks)_
  - [x] 1.2 Append ai.groq block to application.yaml
    - Add the following block to `recruitment-be/src/main/resources/application.yaml`:
      ```yaml
      ai:
        groq:
          api-key: ${GROQ_API_KEY:}
          base-url: ${GROQ_BASE_URL:https://api.groq.com/openai/v1}
          model: ${GROQ_MODEL:llama3-8b-8192}
          temperature: ${GROQ_TEMPERATURE:0.7}
          timeout-seconds: ${GROQ_TIMEOUT_SECONDS:30}
      ```
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6_

- [ ] 2. Create package skeleton: exception classes and DTOs
  - [-] 2.1 Implement the five AI exception classes
    - Create in `com.psybergate.recruitment.ai`:
      - `AiAuthenticationException` — `@ResponseStatus(HttpStatus.BAD_GATEWAY)`, extends `RuntimeException`, single `String message` constructor
      - `AiCommunicationException` — `@ResponseStatus(HttpStatus.BAD_GATEWAY)`
      - `AiTimeoutException` — `@ResponseStatus(HttpStatus.GATEWAY_TIMEOUT)`
      - `AiRateLimitException` — `@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)`
      - `AiResponseException` — `@ResponseStatus(HttpStatus.BAD_GATEWAY)`
    - Each constructor forwards `message` to `super(message)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [-] 2.2 Implement DTO records in `ai/dto/` subpackage
    - Create four Java records:
      - `GroqMessage(String role, String content)`
      - `GroqChatRequest(String model, List<GroqMessage> messages, double temperature)`
      - `GroqChoice(GroqMessage message)`
      - `GroqChatResponse(List<GroqChoice> choices)`
    - Add `@JsonProperty` where field names diverge from Jackson's default camel→snake mapping (verify `choices` and `message` round-trip correctly)
    - _Requirements: 2.1, 2.3_

- [ ] 3. Implement AiProperties configuration class
  - [ ] 3.1 Create `AiProperties` record with Bean Validation
    - Create `com.psybergate.recruitment.ai.AiProperties`:
      ```java
      @ConfigurationProperties(prefix = "ai.groq")
      @Validated
      public record AiProperties(
          @NotBlank String apiKey,
          String baseUrl,
          @NotBlank String model,
          @DecimalMin("0.0") @DecimalMax("2.0") double temperature,
          @Min(1) @Max(300) int timeoutSeconds
      ) {}
      ```
    - Register with `@EnableConfigurationProperties(AiProperties.class)` on a `@Configuration` class in the `ai/` package (or on the main app class if preferred by convention — check how `PistonProperties` is registered)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ]* 3.2 Write unit tests for AiProperties validation
    - Create `AiPropertiesValidationTest` using `@SpringBootTest` + `@TestPropertySource`
    - Cover: missing/empty `api-key` → startup fails; missing/empty `model` → startup fails; `temperature = -0.1` → fails; `temperature = 2.1` → fails; `temperature = 0.0` → OK; `temperature = 2.0` → OK; `timeout-seconds = 0` → fails; `timeout-seconds = 301` → fails; `timeout-seconds = 1` → OK; `timeout-seconds = 300` → OK; defaults (`base-url`, `model`, `temperature`, `timeout-seconds`) match documented values
    - _Requirements: 1.1, 1.2, 1.4, 1.6_
  - [ ]* 3.3 Write property test for temperature range validation (Property 11)
    - // Feature: ai-integration-foundation, Property 11: Temperature range validation
    - For any double in [0.0, 2.0] → validation passes; for any double strictly outside → validation fails
    - **Property 11: Temperature range validation**
    - **Validates: Requirements 1.4**
  - [ ]* 3.4 Write property test for timeout range validation (Property 12)
    - // Feature: ai-integration-foundation, Property 12: Timeout range validation
    - For any int in [1, 300] → validation passes; for any int strictly outside → validation fails
    - **Property 12: Timeout range validation**
    - **Validates: Requirements 1.6**

- [ ] 4. Implement AiService interface and AiServiceImpl
  - [~] 4.1 Create `AiService` interface
    - Create `com.psybergate.recruitment.ai.AiService`:
      ```java
      public interface AiService {
          String prompt(String prompt);
      }
      ```
    - _Requirements: 3.1, 3.4, 6.1_
  - [~] 4.2 Create `AiClient` interface in `ai/client/` subpackage
    - Create `com.psybergate.recruitment.ai.client.AiClient`:
      ```java
      public interface AiClient {
          String sendPrompt(String prompt);
      }
      ```
    - _Requirements: 6.3_
  - [~] 4.3 Implement `AiServiceImpl`
    - Create `com.psybergate.recruitment.ai.AiServiceImpl`:
      - Annotate `@Service @Primary @RequiredArgsConstructor`
      - Inject `private final AiClient aiClient`
      - In `prompt(String prompt)`: throw `IllegalArgumentException("Prompt must not be null or blank")` when `prompt == null || prompt.isBlank()`, then delegate to `aiClient.sendPrompt(prompt)` and return unchanged — no catch blocks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.4, 6.5_
  - [ ]* 4.4 Write unit tests for AiServiceImpl
    - Create `AiServiceImplTest` — mock `AiClient` with Mockito
    - Cover: valid prompt → delegates and returns mock result; null prompt → `IllegalArgumentException`, mock never called; blank prompts (spaces, tabs, newlines) → `IllegalArgumentException`, mock never called; each of the 5 AI exception types thrown by mock → same exception propagates unchanged
    - _Requirements: 3.1, 3.2, 3.5_
  - [ ]* 4.5 Write property test: valid prompt returns non-blank response (Property 1)
    - // Feature: ai-integration-foundation, Property 1: Valid prompt returns non-blank response
    - For any non-null non-blank prompt, when AiClient mock returns non-blank string, `AiServiceImpl.prompt()` returns non-null non-blank string
    - **Property 1: Valid prompt returns non-blank response**
    - **Validates: Requirements 3.1**
  - [ ]* 4.6 Write property test: blank/null prompt rejected before delegation (Property 2)
    - // Feature: ai-integration-foundation, Property 2: Blank or null prompt rejected before delegation
    - For any string that is null or all-whitespace, `AiServiceImpl.prompt()` throws `IllegalArgumentException` and `AiClient.sendPrompt()` is never invoked
    - **Property 2: Blank or null prompt rejected before delegation**
    - **Validates: Requirements 3.5**
  - [ ]* 4.7 Write property test: exception passthrough is identity (Property 3)
    - // Feature: ai-integration-foundation, Property 3: Exception passthrough is identity
    - For any AI exception instance thrown by `AiClient.sendPrompt()`, `AiServiceImpl.prompt()` propagates the exact same instance (same type, same message)
    - **Property 3: Exception passthrough is identity**
    - **Validates: Requirements 3.2**

- [~] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement GroqClient
  - [~] 6.1 Implement `GroqClient` HTTP client
    - Create `com.psybergate.recruitment.ai.client.GroqClient`:
      - Annotate `@Component @RequiredArgsConstructor`
      - Inject `private final AiProperties properties`
      - In constructor, build `RestClient` via `RestClient.builder()` with `SimpleClientHttpRequestFactory` read-timeout set from `properties.timeoutSeconds()` (convert int seconds to `Duration`), base URL from `properties.baseUrl()`
      - Implement `sendPrompt(String prompt)`:
        1. `long startTime = System.currentTimeMillis()`
        2. Log INFO: `"AI request initiated — provider: Groq, model: {}"` with `properties.model()`
        3. Build `GroqChatRequest` with `model`, `[{role:"user", content:prompt}]`, `temperature`
        4. POST to `/chat/completions` with `Authorization: Bearer {apiKey}` header, `Content-Type: application/json`, body = request
        5. Map error statuses via `.onStatus()`: 401 → `AiAuthenticationException`; 429 → `AiRateLimitException`; 5xx → `AiCommunicationException`
        6. Deserialize to `GroqChatResponse`
        7. Extract `response.choices().get(0).message().content()`; if null or blank throw `AiResponseException`
        8. Log INFO: `"AI request succeeded — provider: Groq, model: {}, elapsed: {}ms"`
        9. Return content
      - Surround HTTP call with try/catch `ResourceAccessException`: if cause is `SocketTimeoutException` → throw `AiTimeoutException`; else → throw `AiCommunicationException`
      - On any error path: log ERROR `"AI request failed — type: {}, elapsed: {}ms"` with `ex.getClass().getSimpleName()` and elapsed, then throw
      - **NEVER log** `properties.apiKey()`, prompt text, or response content
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 6.2 Write unit tests for GroqClient
    - Create `GroqClientTest` — use `MockRestServiceServer` to simulate HTTP responses
    - Cover: 200 with valid body → correct content returned; 401 → `AiAuthenticationException` non-blank message; 429 → `AiRateLimitException` non-blank message; 500 → `AiCommunicationException` non-blank message; 503 → `AiCommunicationException` non-blank message; null content in response → `AiResponseException` non-blank message; `SocketTimeoutException` → `AiTimeoutException` non-blank message; INFO log on request start with provider+model; INFO log on success with elapsed ms; ERROR log on failure with exception type and elapsed ms; no log line contains API key value
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4_
  - [ ]* 6.3 Write property test: HTTP 401 → AiAuthenticationException (Property 4)
    - // Feature: ai-integration-foundation, Property 4: HTTP 401 always produces AiAuthenticationException with non-blank message
    - **Property 4: HTTP 401 always produces AiAuthenticationException with non-blank message**
    - **Validates: Requirements 4.1**
  - [ ]* 6.4 Write property test: HTTP 429 → AiRateLimitException (Property 5)
    - // Feature: ai-integration-foundation, Property 5: HTTP 429 always produces AiRateLimitException with non-blank message
    - **Property 5: HTTP 429 always produces AiRateLimitException with non-blank message**
    - **Validates: Requirements 4.4**
  - [ ]* 6.5 Write property test: HTTP 5xx → AiCommunicationException (Property 6)
    - // Feature: ai-integration-foundation, Property 6: Any HTTP 5xx always produces AiCommunicationException with non-blank message
    - For any status in [500, 599] → `AiCommunicationException` with non-blank message
    - **Property 6: Any HTTP 5xx always produces AiCommunicationException with non-blank message**
    - **Validates: Requirements 4.6**
  - [ ]* 6.6 Write property test: timeout → AiTimeoutException (Property 7)
    - // Feature: ai-integration-foundation, Property 7: Timeout always produces AiTimeoutException with non-blank message
    - When `ResourceAccessException` caused by `SocketTimeoutException` → `AiTimeoutException` non-blank message
    - **Property 7: Timeout always produces AiTimeoutException with non-blank message**
    - **Validates: Requirements 4.3**
  - [ ]* 6.7 Write property test: null/blank content → AiResponseException (Property 8)
    - // Feature: ai-integration-foundation, Property 8: Missing or null content always produces AiResponseException with non-blank message
    - For any response where `choices[0].message.content` is null or blank → `AiResponseException` non-blank message
    - **Property 8: Missing or null content always produces AiResponseException with non-blank message**
    - **Validates: Requirements 4.5**
  - [ ]* 6.8 Write property test: API key never appears in logs (Property 9)
    - // Feature: ai-integration-foundation, Property 9: API key never appears in log output
    - For any prompt (including ones containing the API key as substring), no captured log line contains the API key value
    - **Property 9: API key never appears in log output**
    - **Validates: Requirements 5.4**
  - [ ]* 6.9 Write property test: prompt content never appears in logs (Property 10)
    - // Feature: ai-integration-foundation, Property 10: Prompt content never appears in log output
    - For any randomly generated prompt, no captured log line contains that prompt string
    - **Property 10: Prompt content never appears in log output**
    - **Validates: Requirements 5.5**
  - [ ]* 6.10 Write property test: content extraction round-trip (Property 13)
    - // Feature: ai-integration-foundation, Property 13: Content extraction round-trip
    - For any non-blank string placed in `choices[0].message.content`, `GroqClient.sendPrompt()` returns exactly that string unchanged
    - **Property 13: Content extraction round-trip**
    - **Validates: Requirements 2.3**
  - [ ]* 6.11 Write property test: Bearer token always present in request (Property 14)
    - // Feature: ai-integration-foundation, Property 14: Bearer token always present in outgoing request
    - For any non-blank prompt, HTTP request contains `Authorization: Bearer {apiKey}` header
    - **Property 14: Bearer token always present in outgoing request**
    - **Validates: Requirements 2.2**

- [ ] 7. Verify Spring context and provider extensibility
  - [~] 7.1 Write Spring context smoke test
    - Create `AiContextTest` using `@SpringBootTest` (with `GROQ_API_KEY` set to a dummy non-blank value via `@TestPropertySource`)
    - Assert: `AiService` bean resolves without `NoUniqueBeanDefinitionException`; resolved bean is instance of `AiServiceImpl`; context starts successfully
    - _Requirements: 3.4, 6.4, 6.5_

- [~] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- jqwik 1.9.3 is the latest stable release compatible with JUnit 5 — pin the version exactly in pom.xml
- `AiProperties` defaults are all supplied via `application.yaml` env-var placeholders; `@NotBlank` on `apiKey` and `model` triggers startup failure when variables are unset (empty string `""` is blank)
- `GroqClient` must never log `properties.apiKey()`, prompt, or response content — enforced by Properties 9 and 10
- No DB migration, no controller, no frontend changes required
- `GlobalExceptionHandler` requires zero modifications — `@ResponseStatus` annotations on exception classes are sufficient
- Each `@Property` method must include the tag comment: `// Feature: ai-integration-foundation, Property N: <title>` and run minimum 100 tries

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "4.1", "4.2"] },
    { "id": 3, "tasks": ["4.3"] },
    { "id": 4, "tasks": ["4.4", "4.5", "4.6", "4.7", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11"] },
    { "id": 6, "tasks": ["7.1"] }
  ]
}
```
