# Design Document — AI Integration Foundation

## Overview

Introduces a reusable, provider-independent AI integration layer under
`com.psybergate.recruitment.ai`. Business services interact exclusively with
the `AiService` abstraction; all Groq-specific HTTP details are encapsulated
in `GroqClient`. The design mirrors the existing `execution/` package pattern
(PistonProperties → PistonClient → CodeExecutionService) so the layer is
immediately familiar to the team.

No database changes are required. No new controllers are introduced; this is
a pure service-layer foundation consumed by future feature packages.

---

## Architecture

```
Business Services (assessment, marking, …)
        │  inject AiService (interface)
        ▼
  com.psybergate.recruitment.ai
  ┌─────────────────────────────────────────────┐
  │  AiService (interface)                      │
  │  AiServiceImpl (@Service @Primary)          │  validates prompt → delegates
  │                                             │
  │  AiProperties (@ConfigurationProperties)    │  binds ai.groq.*
  │                                             │
  │  Exception classes (5)                      │  @ResponseStatus annotated
  └──────────────────┬──────────────────────────┘
                     │ injects AiClient (interface)
                     ▼
  com.psybergate.recruitment.ai.client
  ┌─────────────────────────────────────────────┐
  │  AiClient (interface)                       │
  │  GroqClient (@Component implements AiClient)│  HTTP via RestClient
  └──────────────────┬──────────────────────────┘
                     │ uses DTOs
                     ▼
  com.psybergate.recruitment.ai.dto
  ┌─────────────────────────────────────────────┐
  │  GroqChatRequest, GroqChatResponse          │
  │  GroqMessage, GroqChoice  (Java records)    │
  └─────────────────────────────────────────────┘
                     │ HTTP POST /chat/completions
                     ▼
             api.groq.com/openai/v1
```

The `GlobalExceptionHandler` in `common/` already handles
`@ResponseStatus`-annotated exceptions; no changes to that class are needed.

---

## Components and Interfaces

### Package structure

```
com.psybergate.recruitment.ai/
├── AiService.java                   # interface
├── AiServiceImpl.java               # @Service @Primary
├── AiProperties.java                # @ConfigurationProperties(prefix="ai.groq")
├── AiAuthenticationException.java   # @ResponseStatus(502)
├── AiCommunicationException.java    # @ResponseStatus(502)
├── AiTimeoutException.java          # @ResponseStatus(504)
├── AiRateLimitException.java        # @ResponseStatus(503)
├── AiResponseException.java         # @ResponseStatus(502)
├── client/
│   ├── AiClient.java                # interface
│   └── GroqClient.java              # @Component
└── dto/
    ├── GroqChatRequest.java         # record
    ├── GroqChatResponse.java        # record
    ├── GroqChoice.java              # record
    └── GroqMessage.java             # record
```

### AiService

```java
public interface AiService {
    String prompt(String prompt);
}
```

### AiClient

```java
public interface AiClient {
    String sendPrompt(String prompt);
}
```

### AiServiceImpl

- `@Service @Primary @RequiredArgsConstructor`
- Injects `AiClient`
- Guards: `if (prompt == null || prompt.isBlank()) throw new IllegalArgumentException("Prompt must not be null or blank")`
- Delegates to `aiClient.sendPrompt(prompt)` and returns result unchanged
- Does **not** catch exceptions — they propagate to the caller

### GroqClient

- `@Component @RequiredArgsConstructor`
- Injects `AiProperties`
- Builds `RestClient` in constructor with `SimpleClientHttpRequestFactory` read-timeout
  set from `properties.timeoutSeconds()`
- `sendPrompt(String prompt)`:
  1. Records `startTime = System.currentTimeMillis()`
  2. Logs INFO: `"AI request initiated — provider: Groq, model: {model}"`
  3. Builds `GroqChatRequest` with `[{role:"user", content:prompt}]`
  4. POSTs to `/chat/completions` with `Authorization: Bearer {apiKey}` header
  5. On success extracts `response.choices().get(0).message().content()`; validates non-null/non-blank (else throws `AiResponseException`)
  6. Logs INFO: `"AI request succeeded — provider: Groq, model: {model}, elapsed: {ms}ms"`
  7. Returns content string
- Error mapping (in `onStatus` / catch blocks):
  - `401` → `AiAuthenticationException`
  - `429` → `AiRateLimitException`
  - `5xx` → `AiCommunicationException`
  - `ResourceAccessException` with `SocketTimeoutException` cause → `AiTimeoutException`
  - Other `ResourceAccessException` → `AiCommunicationException`
  - Null/empty content → `AiResponseException`
- On any error: logs ERROR `"AI request failed — type: {exceptionSimpleName}, elapsed: {ms}ms"` then throws

**Logging constraints (non-negotiable):**
- API key value MUST NOT appear in any log statement
- Prompt text MUST NOT appear in any log statement
- Response content MUST NOT appear in any log statement

---

## Data Models

### AiProperties

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

Defaults wired via `application.yaml` (see Configuration section below).

### DTOs (Java records, package `ai/dto/`)

```java
public record GroqMessage(String role, String content) {}

public record GroqChatRequest(
    String model,
    List<GroqMessage> messages,
    double temperature
) {}

public record GroqChoice(GroqMessage message) {}

public record GroqChatResponse(List<GroqChoice> choices) {}
```

JSON field names match the Groq API snake_case fields via Jackson's default
camel→snake mapping or explicit `@JsonProperty` where needed (`api_key` is
never serialized — only used in the header).

### Exception classes

All reside in `com.psybergate.recruitment.ai`, extend `RuntimeException`,
carry a plain-English message, and are annotated with `@ResponseStatus`:

| Class | `@ResponseStatus` | Maps to HTTP |
|---|---|---|
| `AiAuthenticationException` | `HttpStatus.BAD_GATEWAY` | 502 |
| `AiCommunicationException` | `HttpStatus.BAD_GATEWAY` | 502 |
| `AiTimeoutException` | `HttpStatus.GATEWAY_TIMEOUT` | 504 |
| `AiRateLimitException` | `HttpStatus.SERVICE_UNAVAILABLE` | 503 |
| `AiResponseException` | `HttpStatus.BAD_GATEWAY` | 502 |

The existing `GlobalExceptionHandler.handleException` already inspects
`@ResponseStatus` via `AnnotatedElementUtils.findMergedAnnotation` and
produces a `ProblemDetail` response. No handler changes are needed. Response
bodies will never contain the word "Groq" or raw provider status codes because
the exception messages are written by our code.

### application.yaml addition

```yaml
ai:
  groq:
    api-key: ${GROQ_API_KEY:}
    base-url: ${GROQ_BASE_URL:https://api.groq.com/openai/v1}
    model: ${GROQ_MODEL:llama3-8b-8192}
    temperature: ${GROQ_TEMPERATURE:0.7}
    timeout-seconds: ${GROQ_TIMEOUT_SECONDS:30}
```

`@NotBlank` on `apiKey` causes startup failure when `GROQ_API_KEY` is unset
(the empty default `""` is blank, so validation fails with a message naming
the field).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all
valid executions of a system — essentially, a formal statement about what the
system should do. Properties serve as the bridge between human-readable
specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid prompt returns non-blank response

*For any* non-null, non-blank prompt string, when `AiClient` mock returns a
non-blank string, `AiServiceImpl.prompt()` SHALL return a non-null, non-blank
string.

**Validates: Requirements 3.1**

---

### Property 2: Blank or null prompt rejected before delegation

*For any* string that is null or composed entirely of whitespace characters,
`AiServiceImpl.prompt()` SHALL throw `IllegalArgumentException` and
`AiClient.sendPrompt()` SHALL never be invoked.

**Validates: Requirements 3.5**

---

### Property 3: Exception passthrough is identity

*For any* AI exception instance thrown by `AiClient.sendPrompt()`,
`AiServiceImpl.prompt()` SHALL propagate the exact same exception instance
unchanged (same type, same message).

**Validates: Requirements 3.2**

---

### Property 4: HTTP 401 always produces AiAuthenticationException with non-blank message

*For any* prompt string, when the Groq server returns HTTP 401, `GroqClient`
SHALL throw `AiAuthenticationException` whose `getMessage()` is non-null and
non-blank.

**Validates: Requirements 4.1**

---

### Property 5: HTTP 429 always produces AiRateLimitException with non-blank message

*For any* prompt string, when the Groq server returns HTTP 429, `GroqClient`
SHALL throw `AiRateLimitException` whose `getMessage()` is non-null and
non-blank.

**Validates: Requirements 4.4**

---

### Property 6: Any HTTP 5xx always produces AiCommunicationException with non-blank message

*For any* HTTP status code in the range 500–599, when the Groq server returns
that status, `GroqClient` SHALL throw `AiCommunicationException` whose
`getMessage()` is non-null and non-blank.

**Validates: Requirements 4.6**

---

### Property 7: Timeout always produces AiTimeoutException with non-blank message

*For any* prompt string, when the underlying HTTP call raises a
`ResourceAccessException` caused by `SocketTimeoutException`, `GroqClient`
SHALL throw `AiTimeoutException` whose `getMessage()` is non-null and
non-blank.

**Validates: Requirements 4.3**

---

### Property 8: Missing or null content always produces AiResponseException with non-blank message

*For any* response body where `choices[0].message.content` is null, absent, or
blank, `GroqClient` SHALL throw `AiResponseException` whose `getMessage()` is
non-null and non-blank.

**Validates: Requirements 4.5**

---

### Property 9: API key never appears in log output

*For any* prompt string (including strings that embed the configured API key as
a substring), after `GroqClient.sendPrompt()` completes or fails, no captured
log output line SHALL contain the API key value.

**Validates: Requirements 5.4**

---

### Property 10: Prompt content never appears in log output

*For any* randomly generated prompt string, after `GroqClient.sendPrompt()`
completes or fails, no captured log output line SHALL contain that prompt
string.

**Validates: Requirements 5.5**

---

### Property 11: Temperature range validation

*For any* double value in [0.0, 2.0], `AiProperties` validation SHALL pass.
*For any* double value strictly outside that range, validation SHALL fail
(causing startup failure).

**Validates: Requirements 1.4**

---

### Property 12: Timeout range validation

*For any* integer value in [1, 300], `AiProperties` validation SHALL pass.
*For any* integer value strictly outside that range, validation SHALL fail.

**Validates: Requirements 1.6**

---

### Property 13: Content extraction round-trip

*For any* non-null, non-blank string value placed in `choices[0].message.content`
of a mock HTTP response, `GroqClient.sendPrompt()` SHALL return exactly that
string unchanged.

**Validates: Requirements 2.3**

---

### Property 14: Bearer token always present in outgoing request

*For any* non-blank prompt string, the HTTP request sent by `GroqClient` to the
Groq endpoint SHALL contain an `Authorization` header whose value equals
`"Bearer " + apiKey`.

**Validates: Requirements 2.2**

---

## Error Handling

### GroqClient error mapping table

| Condition | Exception thrown | HTTP status via handler |
|---|---|---|
| HTTP 401 | `AiAuthenticationException` | 502 |
| HTTP 429 | `AiRateLimitException` | 503 |
| HTTP 5xx | `AiCommunicationException` | 502 |
| `SocketTimeoutException` (via `ResourceAccessException`) | `AiTimeoutException` | 504 |
| Other `ResourceAccessException` | `AiCommunicationException` | 502 |
| Null / blank content field | `AiResponseException` | 502 |

### Implementation pattern for GroqClient

```java
restClient.post()
    .uri("/chat/completions")
    .header("Authorization", "Bearer " + properties.apiKey())
    .contentType(MediaType.APPLICATION_JSON)
    .body(request)
    .retrieve()
    .onStatus(status -> status.value() == 401, (req, res) -> {
        throw new AiAuthenticationException("AI authentication failed");
    })
    .onStatus(status -> status.value() == 429, (req, res) -> {
        throw new AiRateLimitException("AI rate limit exceeded");
    })
    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
        throw new AiCommunicationException("AI provider error: " + res.getStatusCode());
    })
    .body(GroqChatResponse.class);
```

`ResourceAccessException` is caught in a surrounding try/catch: if the cause
is `SocketTimeoutException` → `AiTimeoutException`; otherwise →
`AiCommunicationException`.

### AiServiceImpl — no catch blocks

`AiServiceImpl` does not catch exceptions. It validates the prompt and
delegates; exceptions from `GroqClient` propagate naturally to the HTTP layer
where `GlobalExceptionHandler` picks them up.

### Response body safety

All exception messages are written by our code and contain only generic
descriptions ("AI provider error", "AI rate limit exceeded", etc.). The word
"Groq" and provider HTTP status codes are excluded from messages to satisfy
requirement 4.7.

---

## Testing Strategy

### Dual approach

Unit tests cover specific examples, edge cases, and wiring. Property-based
tests verify universal properties across generated inputs. Both are required.

### PBT library

Use **jqwik** (already available as a test-scope dependency in Java/Maven
projects; add if absent). Each property test runs **minimum 100 tries**.

Tag format comment above each `@Property` method:
```
// Feature: ai-integration-foundation, Property N: <property_text>
```

### Unit tests — AiServiceImpl

- Mock `AiClient` with Mockito
- Test: valid prompt → delegates and returns mock result
- Test: null prompt → `IllegalArgumentException`, mock never called
- Test: blank prompt (spaces, tabs, newlines) → `IllegalArgumentException`, mock never called
- Test: each of the 5 AI exception types thrown by mock → same exception propagates

### Unit tests — GroqClient

Use `MockRestServiceServer` (Spring Test) to simulate HTTP responses without
a real Groq connection.

- Test: successful response → correct content extracted
- Test: 401 response → `AiAuthenticationException` with non-blank message
- Test: 429 response → `AiRateLimitException` with non-blank message
- Test: 500 response → `AiCommunicationException` with non-blank message
- Test: 503 response → `AiCommunicationException` with non-blank message
- Test: response with null content → `AiResponseException` with non-blank message
- Test: `SocketTimeoutException` simulated → `AiTimeoutException` with non-blank message
- Test: INFO log emitted on start with provider+model (capture log appender)
- Test: INFO log emitted on success with elapsed ms
- Test: ERROR log emitted on failure with exception type and elapsed ms
- Test: no log line contains the API key value

### Unit tests — AiProperties validation

Use `@SpringBootTest` with `@TestPropertySource` overrides:

- Missing/empty `api-key` → context fails to start (ConstraintViolationException)
- Missing/empty `model` → context fails to start
- `temperature = -0.1` → context fails to start
- `temperature = 2.1` → context fails to start
- `temperature = 0.0` → starts OK
- `temperature = 2.0` → starts OK
- `timeout-seconds = 0` → context fails to start
- `timeout-seconds = 301` → context fails to start
- `timeout-seconds = 1` → starts OK
- `timeout-seconds = 300` → starts OK
- Default values: `base-url`, `model`, `temperature`, `timeout-seconds` match documented defaults

### Property-based tests (jqwik)

Each property below maps to a numbered property in the Correctness Properties
section.

```java
// Feature: ai-integration-foundation, Property 1: Valid prompt returns non-blank response
@Property(tries = 100)
void validPromptReturnsNonBlankResponse(@ForAll @NotBlank String prompt) { … }

// Feature: ai-integration-foundation, Property 2: Blank or null prompt rejected before delegation
@Property(tries = 100)
void blankPromptThrowsIllegalArgument(@ForAll("blankStrings") String prompt) { … }

// Feature: ai-integration-foundation, Property 3: Exception passthrough is identity
@Property(tries = 100)
void exceptionPassthrough(@ForAll("aiExceptions") RuntimeException ex) { … }

// Feature: ai-integration-foundation, Property 4: HTTP 401 → AiAuthenticationException
@Property(tries = 100)
void http401AlwaysProducesAuthException(@ForAll @NotBlank String prompt) { … }

// Feature: ai-integration-foundation, Property 5: HTTP 429 → AiRateLimitException
@Property(tries = 100)
void http429AlwaysProducesRateLimitException(@ForAll @NotBlank String prompt) { … }

// Feature: ai-integration-foundation, Property 6: HTTP 5xx → AiCommunicationException
@Property(tries = 100)
void http5xxAlwaysProducesCommunicationException(@ForAll @IntRange(min=500,max=599) int status) { … }

// Feature: ai-integration-foundation, Property 7: Timeout → AiTimeoutException
@Property(tries = 100)
void timeoutAlwaysProducesTimeoutException(@ForAll @NotBlank String prompt) { … }

// Feature: ai-integration-foundation, Property 8: Null/blank content → AiResponseException
@Property(tries = 100)
void missingContentAlwaysProducesResponseException(@ForAll("nullableBlankStrings") String content) { … }

// Feature: ai-integration-foundation, Property 9: API key never in logs
@Property(tries = 100)
void apiKeyNeverAppearsInLogs(@ForAll String prompt) { … }

// Feature: ai-integration-foundation, Property 10: Prompt content never in logs
@Property(tries = 100)
void promptContentNeverAppearsInLogs(@ForAll @NotBlank String prompt) { … }

// Feature: ai-integration-foundation, Property 11: Temperature range validation
@Property(tries = 200)
void temperatureRangeValidation(@ForAll double temperature) { … }

// Feature: ai-integration-foundation, Property 12: Timeout range validation
@Property(tries = 200)
void timeoutRangeValidation(@ForAll int timeoutSeconds) { … }

// Feature: ai-integration-foundation, Property 13: Content extraction round-trip
@Property(tries = 100)
void contentExtractionRoundTrip(@ForAll @NotBlank String content) { … }

// Feature: ai-integration-foundation, Property 14: Bearer token always present
@Property(tries = 100)
void bearerTokenAlwaysPresentInRequest(@ForAll @NotBlank String prompt) { … }
```

### Integration test

Not required. No real Groq call in CI. End-to-end verification is left to
manual smoke testing or a dedicated integration environment with `GROQ_API_KEY`
set.

### Provider extensibility verification

Single `@SpringBootTest` asserts:
- `AiService` bean is present in context
- No `NoUniqueBeanDefinitionException` is thrown
- `AiServiceImpl` is the resolved implementation when only one `@Primary` bean exists
