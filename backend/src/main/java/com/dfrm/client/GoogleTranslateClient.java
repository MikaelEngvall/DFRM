package com.dfrm.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GoogleTranslateClient {
    
    @Value("${google.translate.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Supporterade språk
    private static final String SWEDISH = "sv";
    private static final String ENGLISH = "en";
    private static final String POLISH = "pl";
    private static final String UKRAINIAN = "uk";
    
    /**
     * Detekterar språket i en text med Google Translate API
     * 
     * @param text Texten vars språk ska detekteras
     * @return Språkkoden för det detekterade språket
     */
    public String detectLanguage(String text) {
        if (text == null || text.trim().isEmpty()) {
            return SWEDISH; // Standard är svenska om texten är tom
        }
        
        log.info("Detecting language for text: {} (first 50 chars)", 
                text.length() > 50 ? text.substring(0, 50) + "..." : text);
        
        try {
            // Skapa URL för Google Detect Language API
            String url = UriComponentsBuilder.fromHttpUrl("https://translation.googleapis.com/language/translate/v2/detect")
                .queryParam("key", apiKey)
                .toUriString();
            
            // Skapa request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("q", text);
            
            // Skapa headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            // Skicka request
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class);
            
            // Parsa svaret
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String languageCode = rootNode
                .path("data")
                .path("detections")
                .path(0)
                .path(0)
                .path("language")
                .asText();
            
            log.info("Detected language: {}", languageCode);
            
            // Om språket inte är ett av våra supporterade språk, använd engelska
            if (!languageCode.equals(SWEDISH) && 
                !languageCode.equals(ENGLISH) && 
                !languageCode.equals(POLISH) && 
                !languageCode.equals(UKRAINIAN)) {
                log.info("Unsupported language detected ({}), defaulting to English", languageCode);
                return ENGLISH;
            }
            
            return languageCode;
            
        } catch (Exception e) {
            log.error("Error detecting language: {}", e.getMessage(), e);
            // Fallback till svenska vid fel
            return SWEDISH;
        }
    }
    
    /**
     * Översätter text från ett språk till ett annat med Google Translate API
     * 
     * @param text Texten som ska översättas
     * @param sourceLanguage Källspråket
     * @param targetLanguage Målspråket
     * @return Den översatta texten
     */
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Om källspråk och målspråk är samma, returnera ursprungstexten
        if (sourceLanguage.equals(targetLanguage)) {
            return text;
        }
        
        log.info("Translating text from {} to {}: {} (first 50 chars)", 
                sourceLanguage, targetLanguage, 
                text.length() > 50 ? text.substring(0, 50) + "..." : text);
        
        try {
            // Skapa URL för Google Translate API
            String url = UriComponentsBuilder.fromHttpUrl("https://translation.googleapis.com/language/translate/v2")
                .queryParam("key", apiKey)
                .toUriString();
            
            // Skapa request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("q", text);
            requestBody.put("source", sourceLanguage);
            requestBody.put("target", targetLanguage);
            requestBody.put("format", "text");
            
            // Skapa headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            // Skicka request
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class);
            
            // Parsa svaret
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String translatedText = rootNode
                .path("data")
                .path("translations")
                .path(0)
                .path("translatedText")
                .asText();
            
            log.info("Translation successful");
            return translatedText;
            
        } catch (Exception e) {
            log.error("Error translating text: {}", e.getMessage(), e);
            // Fallback till att lägga till ett prefix på originaltexten vid fel
            return addPrefix(text, targetLanguage);
        }
    }
    
    /**
     * Översätter text till flera språk samtidigt
     * 
     * @param text Texten som ska översättas
     * @param sourceLanguage Källspråket
     * @param targetLanguages Lista med målspråk
     * @return Map där nyckeln är språkkod och värdet är översatt text
     */
    public Map<String, String> translateToMultipleLanguages(String text, String sourceLanguage, List<String> targetLanguages) {
        Map<String, String> translations = new HashMap<>();
        
        // Lägg till källspråket direkt
        translations.put(sourceLanguage, text);
        
        // Översätt till varje målspråk
        for (String targetLanguage : targetLanguages) {
            if (!targetLanguage.equals(sourceLanguage)) {
                String translatedText = translate(text, sourceLanguage, targetLanguage);
                translations.put(targetLanguage, translatedText);
            }
        }
        
        return translations;
    }
    
    // Hjälpmetod för att lägga till språkspecifik prefix för fallbacks
    private String addPrefix(String text, String targetLanguage) {
        switch (targetLanguage) {
            case ENGLISH:
                return "Translation: " + text;
            case POLISH:
                return "Tłumaczenie: " + text;
            case UKRAINIAN:
                return "Переклад: " + text;
            case SWEDISH:
            default:
                return "Översättning: " + text;
        }
    }
} 