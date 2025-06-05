package Milan.Ai_sypmtom.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final String apiKey;

    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String getAdviceFromGemini(String prompt) {
        try {
            // Build Gemini request body using the correct structure
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, String>> parts = new ArrayList<>();

            Map<String, String> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);
            content.put("parts", parts);

            List<Map<String, Object>> contents = new ArrayList<>();
            contents.add(content);
            requestBody.put("contents", contents);

            // Generation configuration
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.2);
            generationConfig.put("topP", 0.8);
            generationConfig.put("topK", 40);
            generationConfig.put("maxOutputTokens", 2048);
            requestBody.put("generationConfig", generationConfig);

            // Call Gemini API using the correct endpoint
            Map<String, Object> response = webClient.post()
                    .uri("/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            // Extract response text
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> candidateContent = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> candidateParts = (List<Map<String, Object>>) candidateContent.get("parts");

                    if (!candidateParts.isEmpty()) {
                        String text = (String) candidateParts.get(0).get("text");
                        return createSuccessResponse(text);
                    }
                }
            }

            return createErrorResponse("No response generated", "Empty response from Gemini API");

        } catch (WebClientResponseException e) {
            System.err.println("WebClient error: " + e.getMessage());
            System.err.println("Response body: " + e.getResponseBodyAsString());
            return createErrorResponse("API request failed", e.getMessage());
        } catch (Exception e) {
            System.err.println("General error: " + e.getMessage());
            e.printStackTrace();
            return createErrorResponse("Failed to get medical advice", e.getMessage());
        }
    }

    private String createSuccessResponse(String advice) {
        return """
            {
              "success": true,
              "advice": "%s"
            }
            """.formatted(escapeJsonString(advice));
    }

    private String createErrorResponse(String error, String message) {
        return """
            {
              "success": false,
              "error": "%s",
              "message": "%s"
            }
            """.formatted(escapeJsonString(error), escapeJsonString(message));
    }

    private String escapeJsonString(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}