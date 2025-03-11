package com.dfrm.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class EnvConfig {

    private static final List<String> SENSITIVE_VARS = List.of(
        "EMAIL_PASSWORD", 
        "DB_PASSWORD",
        "API_KEY"
    );

    @PostConstruct
    public void loadEnvFile() {
        // Möjliga sökvägar för .env-filen
        List<String> possiblePaths = List.of(
            ".env",                  // Relativ från arbetskatalogen
            "backend/.env",          // Om vi kör från projektets rot
            "../.env"                // Om vi kör från en underkatalog
        );
        
        File envFile = null;
        for (String path : possiblePaths) {
            File tempFile = new File(path);
            if (tempFile.exists()) {
                envFile = tempFile;
                log.info("Found .env file at: {}", tempFile.getAbsolutePath());
                break;
            }
        }
        
        if (envFile == null) {
            log.info("No .env file found. Skipping environment variable loading.");
            
            // Logga värdefull information om arbetskatalogen för felsökning
            log.info("Current working directory: {}", new File(".").getAbsolutePath());
            return;
        }
        
        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            List<String> loadedVars = new ArrayList<>();
            
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                
                // Hoppa över tomma rader och kommentarer
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                
                int separatorIndex = line.indexOf('=');
                if (separatorIndex > 0) {
                    String key = line.substring(0, separatorIndex).trim();
                    String value = line.substring(separatorIndex + 1).trim();
                    
                    // Ta bort eventuella citationstecken runt värdet
                    if (value.startsWith("\"") && value.endsWith("\"") || 
                        value.startsWith("'") && value.endsWith("'")) {
                        value = value.substring(1, value.length() - 1);
                    }
                    
                    // Sätt både som System property och miljövariabel
                    System.setProperty(key, value);
                    
                    // Logga endast icke-känsliga variabler
                    if (SENSITIVE_VARS.contains(key)) {
                        loadedVars.add(key + "=*****");
                    } else {
                        loadedVars.add(key + "=" + value);
                    }
                }
            }
            
            // Logga endast vilka variabler som lästes in, inte deras värden
            log.info("Loaded {} environment variables: {}", loadedVars.size(), loadedVars);
            
        } catch (IOException e) {
            log.error("Failed to load .env file: {}", e.getMessage());
        }
    }
} 