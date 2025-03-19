package com.dfrm.service;

import org.springframework.stereotype.Service;

import com.dfrm.model.Language;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationService {
    
    // Denna klass kan utökas för att hantera olika typer av översättning
    // För närvarande används den bara som en placeholder
    
    public String translate(String text, String fromLanguage, String toLanguage) {
        log.info("TranslationService: Translating from {} to {}", fromLanguage, toLanguage);
        // Under utveckling returnerar vi bara original-texten
        return text;
    }
    
    /**
     * Översätter text från ett språk till ett annat
     * 
     * @param text Texten som ska översättas
     * @param fromLanguage Källspråket
     * @param toLanguage Målspråket
     * @return Den översatta texten
     */
    public String translateText(String text, Language fromLanguage, Language toLanguage) {
        log.info("TranslationService: Translating from {} to {}", fromLanguage, toLanguage);
        // Under utveckling returnerar vi bara original-texten
        return text;
    }
    
    /**
     * Detekterar språket i en text
     * 
     * @param text Texten vars språk ska detekteras
     * @return Det detekterade språket
     */
    public Language detectLanguage(String text) {
        log.info("TranslationService: Detecting language for text: {}", 
            text.length() > 50 ? text.substring(0, 50) + "..." : text);
        // Under utveckling antar vi att all text är på svenska
        return Language.SV;
    }
} 