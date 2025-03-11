package com.dfrm.service;

import org.springframework.stereotype.Service;

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
} 