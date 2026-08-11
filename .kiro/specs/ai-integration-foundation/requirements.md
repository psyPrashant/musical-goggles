# Requirements Document

## Introduction

This feature introduces a reusable, provider-independent AI integration layer into the Assessment System. It enables the backend to communicate with the Groq API in a secure, configurable, and extensible manner. Business services will interact exclusively with a shared AI Service abstraction, keeping all provider-specific details encapsulated in a dedicated client. This foundation supports future AI capabilities (e.g., assessment generation, candidate feedback) without requiring structural changes.

## Glossary

- **AI_Service**: The application-level Spring service interface (`AiService`) that exposes AI prompt/response functionality to business services.
- **AI_Client**: The infrastructure-level component responsible for HTTP communication with the Groq API (`GroqClient`).
- **Groq_API**: The external Groq large language model API used as the initial AI provider.
- **AI_Properties**: The Spring Boot configuration properties class (`AiProperties`) binding all AI-related configuration values.
- **Provider**: An external AI service (e.g., Groq) that the AI_Client communicates with.
- **Business_Service**: Any Spring service in the application (e.g., assessment, marking) that requires AI functionality.
- **AI_Request**: A structured prompt payload sent from the AI_Client to the Groq_API.
- **AI_Response**: The structured response returned by the Groq_API to the AI_Client.
- **GlobalExceptionHandler**: The existing `@RestControllerAdvice` in `common/` that handles unmapped exceptions and returns `ProblemDetail` responses.

---

## Requirements

### Requirement 1: AI Configuration

**User Story:** As a system administrator, I want AI provider settings to be externalized in application configuration, so that the application can be deployed across environments without modifying source code.

#### Acceptance Criteria

1. THE AI_Properties SHALL bind the following values from `application.yaml`: API key, base URL, model name, temperature, and request timeout.
2. WHEN the application starts with a missing or empty `ai.groq.api-key` property OR a missing or empty `ai.groq.model` property, THE AI_Properties SHALL cause the application context to fail to start, and the startup error message SHALL include the name of the missing or invalid property.
3. WHEN the environment variable `GROQ_API_KEY` is set, THE AI_Properties SHALL use its value as the API key, overriding any value specified in `application.yaml`.
4. WHERE a temperature value is not explicitly configured, THE AI_Properties SHALL use a default value of `0.7`. THE temperature value SHALL be constrained to the range 0.0–2.0 inclusive; values outside this range SHALL cause application startup to fail.
5. WHERE a base URL is not explicitly configured, THE AI_Properties SHALL use a default value of `https://api.groq.com/openai/v1`.
6. WHERE a request timeout is not explicitly configured, THE AI_Properties SHALL use a default value of `30` seconds. WHERE a request timeout is explicitly configured, it SHALL be within the range 1–300 seconds inclusive; values outside this range SHALL cause application startup to fail. WHERE a model name is not explicitly configured, THE AI_Properties SHALL use a default value of `llama3-8b-8192`.

---

### Requirement 2: Groq API Client

**User Story:** As a developer, I want a dedicated Groq client component, so that all HTTP communication with the Groq API is encapsulated in one place.

#### Acceptance Criteria

1. THE AI_Client SHALL send AI_Requests to the Groq_API using the base URL and model name from AI_Properties.
2. WHEN sending an AI_Request, THE AI_Client SHALL include the API key as a Bearer token in the `Authorization` HTTP header.
3. WHEN the Groq_API returns an HTTP 2xx response, THE AI_Client SHALL extract and return the text content from the first choice's `message.content` field in the response body.
4. THE AI_Client SHALL set an HTTP request timeout equal to the timeout value configured in AI_Properties; the timeout value SHALL be within the range 1–300 seconds inclusive.
5. THE AI_Client SHALL NOT expose Groq-specific types or HTTP details beyond the `ai/` package boundary.

---

### Requirement 3: AI Service

**User Story:** As a developer, I want a reusable AI Service interface, so that business services can invoke AI functionality without coupling to a specific provider.

#### Acceptance Criteria

1. THE AI_Service SHALL expose a method accepting a plain text prompt string and returning a plain text response string.
2. WHEN the AI_Client throws an exception during prompt execution, THE AI_Service implementation SHALL rethrow that exception unchanged to the caller.
3. IF a Business_Service requires AI functionality, THEN it SHALL declare a constructor parameter of type `AiService` and SHALL NOT reference `GroqClient` or any other provider-specific class in its source file.
4. THE AI_Service SHALL be a Spring-managed bean registered in the `ai/` package under `com.psybergate.recruitment`.
5. WHEN the prompt string passed to the AI_Service method is null or blank, THE AI_Service SHALL throw an `IllegalArgumentException` before delegating to the AI_Client.

---

### Requirement 4: Error Handling

**User Story:** As a developer, I want AI errors to be translated into meaningful application exceptions, so that callers receive actionable errors without being exposed to provider-specific details.

#### Acceptance Criteria

1. WHEN the Groq_API returns an HTTP 401 response, THE AI_Client SHALL throw an `AiAuthenticationException` with a non-null, non-blank message indicating authentication failure.
2. WHEN a network error or connection failure occurs during an AI_Request, THE AI_Client SHALL throw an `AiCommunicationException` with a non-null, non-blank message describing the connectivity issue.
3. WHEN the HTTP request to the Groq_API exceeds the configured timeout, THE AI_Client SHALL throw an `AiTimeoutException` with a non-null, non-blank message stating that the request timed out.
4. WHEN the Groq_API returns an HTTP 429 response, THE AI_Client SHALL throw an `AiRateLimitException` with a non-null, non-blank message indicating rate limiting.
5. WHEN the Groq_API returns a response that does not contain a parseable content field, THE AI_Client SHALL throw an `AiResponseException` with a non-null, non-blank message describing the malformed response.
6. WHEN the Groq_API returns an HTTP 5xx response, THE AI_Client SHALL throw an `AiCommunicationException` with a non-null, non-blank message indicating a provider-side error.
7. IF any of the exceptions defined in criteria 1–6 are thrown, THEN THE GlobalExceptionHandler SHALL map them to HTTP error responses as follows: `AiAuthenticationException` → 502, `AiCommunicationException` → 502, `AiTimeoutException` → 504, `AiRateLimitException` → 503, `AiResponseException` → 502. The response body SHALL NOT contain the word "Groq", the raw HTTP status from the provider, or any provider-specific error codes.

---

### Requirement 5: Logging

**User Story:** As an operations engineer, I want AI interactions to be logged, so that I can monitor usage, diagnose failures, and measure performance without exposing sensitive data.

#### Acceptance Criteria

1. WHEN an AI_Request is initiated, THE AI_Client SHALL log the event at INFO level, including the provider name and model name.
2. WHEN an AI_Request completes successfully, THE AI_Client SHALL log the event at INFO level, including the provider name, model name, and elapsed time in milliseconds.
3. WHEN an AI_Request fails, THE AI_Client SHALL log the event at ERROR level, including the exception type name and elapsed time in milliseconds.
4. THE AI_Client SHALL NOT include the API key in any log output.
5. THE AI_Client SHALL NOT include prompt content or response content in log output at any log level.

---

### Requirement 6: Provider Extensibility

**User Story:** As a developer, I want the AI integration layer to be designed for extension, so that additional AI providers can be added without modifying existing business services or the AI_Service interface.

#### Acceptance Criteria

1. THE AI_Service SHALL be defined as a Java interface in the `ai/` package so that alternative implementations can be registered as Spring beans without modifying the interface.
2. THE system SHALL allow a new AI provider to be activated by adding a new `AiClient` implementation class and updating only Spring configuration files, without modifying any `Business_Service` class or the `AiService` interface.
3. THE AI_Client SHALL be defined as a Java interface so that provider-specific implementations can be injected via Spring constructor injection.
4. WHEN exactly one `AiService` implementation bean is present in the Spring application context, THE application SHALL start successfully without any `NoUniqueBeanDefinitionException`.
5. THE `AiService` implementation class SHALL be annotated with `@Primary` or equivalent qualifier so that the active provider bean is unambiguous when only one implementation is registered.
