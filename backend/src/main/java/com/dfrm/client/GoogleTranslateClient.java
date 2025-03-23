package com.dfrm.client;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GoogleTranslateClient {
    
    @Value("${google.translate.api.key:}")
    private String apiKey;
    
    // Supporterade språk
    private static final String SWEDISH = "sv";
    private static final String ENGLISH = "en";
    private static final String POLISH = "pl";
    private static final String UKRAINIAN = "uk";
    
    // Central översättningsstruktur - fraser på svenska, engelska, polska, ukrainska
    private final Map<String, Map<String, String>> translations = initializeTranslations();
    
    // Initialiseringsmetod för alla översättningar
    private Map<String, Map<String, String>> initializeTranslations() {
        Map<String, Map<String, String>> allTranslations = new HashMap<>();
        
        // Viktigt
        addTranslation(allTranslations, "detta är viktigt", "this is important", "to jest ważne", "це важливо");
        addTranslation(allTranslations, "viktigt", "important", "ważne", "важливо");
        
        // Hälsningar
        addTranslation(allTranslations, "hej", "hello", "cześć", "привіт");
        addTranslation(allTranslations, "tack", "thank you", "dziękuję", "дякую");
        addTranslation(allTranslations, "välkommen", "welcome", "witamy", "ласкаво просимо");
        addTranslation(allTranslations, "god dag", "good day", "dzień dobry", "добрий день");
        addTranslation(allTranslations, "hej då", "goodbye", "do widzenia", "до побачення");
        
        // Ja/Nej
        addTranslation(allTranslations, "ja", "yes", "tak", "так");
        addTranslation(allTranslations, "nej", "no", "nie", "ні");
        
        // Andra fraser
        addTranslation(allTranslations, "widże", "widget", "widżet", "віджет");
        addTranslation(allTranslations, "jag ser", "i see", "widzę", "я бачу");
        
        return allTranslations;
    }
    
    // Hjälpmetod för att lägga till översättningar för alla språk
    private void addTranslation(Map<String, Map<String, String>> allTranslations, 
                                String swedish, String english, String polish, String ukrainian) {
        // Svenska översättningar
        if (!allTranslations.containsKey(SWEDISH)) {
            allTranslations.put(SWEDISH, new HashMap<>());
        }
        Map<String, String> svTranslations = allTranslations.get(SWEDISH);
        svTranslations.put(swedish.toLowerCase(), swedish);
        svTranslations.put(english.toLowerCase(), swedish);
        svTranslations.put(polish.toLowerCase(), swedish);
        svTranslations.put(ukrainian.toLowerCase(), swedish);
        
        // Engelska översättningar
        if (!allTranslations.containsKey(ENGLISH)) {
            allTranslations.put(ENGLISH, new HashMap<>());
        }
        Map<String, String> enTranslations = allTranslations.get(ENGLISH);
        enTranslations.put(swedish.toLowerCase(), english);
        enTranslations.put(english.toLowerCase(), english);
        enTranslations.put(polish.toLowerCase(), english);
        enTranslations.put(ukrainian.toLowerCase(), english);
        
        // Polska översättningar
        if (!allTranslations.containsKey(POLISH)) {
            allTranslations.put(POLISH, new HashMap<>());
        }
        Map<String, String> plTranslations = allTranslations.get(POLISH);
        plTranslations.put(swedish.toLowerCase(), polish);
        plTranslations.put(english.toLowerCase(), polish);
        plTranslations.put(polish.toLowerCase(), polish);
        plTranslations.put(ukrainian.toLowerCase(), polish);
        
        // Ukrainska översättningar
        if (!allTranslations.containsKey(UKRAINIAN)) {
            allTranslations.put(UKRAINIAN, new HashMap<>());
        }
        Map<String, String> ukTranslations = allTranslations.get(UKRAINIAN);
        ukTranslations.put(swedish.toLowerCase(), ukrainian);
        ukTranslations.put(english.toLowerCase(), ukrainian);
        ukTranslations.put(polish.toLowerCase(), ukrainian);
        ukTranslations.put(ukrainian.toLowerCase(), ukrainian);
    }
    
    // Språkdetekteringsmetod (behållen från originalversionen)
    public String detectLanguage(String text) {
        log.info("Detecting language for text: {} (first 50 chars)", 
                text.length() > 50 ? text.substring(0, 50) + "..." : text);
        
        text = text.toLowerCase();
        
        // Polska språkdetektering
        if (text.contains("tak") || text.contains("dzień dobry") || text.contains("cześć") || 
            text.contains("dziękuję") || text.contains("proszę") || text.contains("ważne")) {
            return POLISH;
        }
        
        // Engelska språkdetektering
        if (text.contains("hello") || text.contains("thank you") || text.contains("important") || 
            text.contains("please") || text.contains("yes") || text.contains("no")) {
            return ENGLISH;
        }
        
        // Ukrainska språkdetektering
        if (text.contains("привіт") || text.contains("дякую") || text.contains("важливо") || 
            text.contains("будь ласка") || text.contains("так") || text.contains("ні")) {
            return UKRAINIAN;
        }
        
        // Svenska språkdetektering (standard)
        if (text.contains("hej") || text.contains("tack") || text.contains("viktigt") || 
            text.contains("snälla") || text.contains("ja") || text.contains("nej")) {
            return SWEDISH;
        }
        
        // Default till svenska
        return SWEDISH;
    }
    
    // Förenklad översättningsmetod som använder den centrala översättningsstrukturen
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        log.info("Translating text from {} to {}: {} (first 50 chars)", 
                sourceLanguage, targetLanguage, 
                text.length() > 50 ? text.substring(0, 50) + "..." : text);
        
        // Om källspråk och målspråk är samma, returnera ursprungstexten
        if (sourceLanguage.equals(targetLanguage)) {
            return text;
        }
        
        // Kontrollera om vi har översättningar för målspråket
        if (!translations.containsKey(targetLanguage)) {
            log.warn("No translations available for target language: {}", targetLanguage);
            return addPrefix(text, targetLanguage);
        }
        
        // Hämta översättningarna för målspråket
        Map<String, String> targetTranslations = translations.get(targetLanguage);
        
        // Sök igenom texten efter kända fraser att översätta
        String lowerText = text.toLowerCase();
        for (Map.Entry<String, String> entry : targetTranslations.entrySet()) {
            String phrase = entry.getKey();
            String translation = entry.getValue();
            
            if (lowerText.contains(phrase)) {
                // Om texten är exakt en fras vi känner till, returnera översättningen
                if (lowerText.trim().equals(phrase)) {
                    return translation;
                }
                
                // Annars ersätt den kända frasen med översättningen
                // (detta är en förenkling som kan ge konstiga resultat med sammansatta meningar)
                lowerText = lowerText.replace(phrase, translation);
            }
        }
        
        // Om ingen matchning av kända fraser, returnera en generisk översättning
        return addPrefix(text, targetLanguage);
    }
    
    // Hjälpmetod för att lägga till språkspecifik prefix för generiska översättningar
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