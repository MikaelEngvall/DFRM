package com.dfrm.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GoogleTranslateClient {
    
    @Value("${google.translate.api.key:}")
    private String apiKey;
    
    // Under utveckling returnerar vi bara dummy-data
    // I en produktionslösning skulle vi anropa Google Translate API
    
    public String detectLanguage(String text) {
        // Default till svenska när vi inte har en riktig implementation
        log.info("Detecting language for text: {} (first 50 chars)", 
                text.length() > 50 ? text.substring(0, 50) + "..." : text);
        return "sv";
    }
    
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        log.info("Translating text from {} to {}: {} (first 50 chars)", 
                sourceLanguage, targetLanguage, 
                text.length() > 50 ? text.substring(0, 50) + "..." : text);
        
        // I utvecklingsmiljö, returnera samma text för alla språk
        return text;
    }
} 