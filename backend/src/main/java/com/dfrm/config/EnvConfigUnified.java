package com.dfrm.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.StandardEnvironment;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * Samlad konfigurationsklass för hantering av miljövariabler från .env-filer.
 * 
 * Klassen kombinerar funktionalitet från tidigare klasser (EnvConfig, DotenvConfig och ApplicationConfig)
 * och använder både det dedikerade dotenv-biblioteket och en egen implementering som backup.
 * 
 * Fördelar med denna kombinerade lösning:
 * 1. Använder primärt dotenv-biblioteket som är robust och vältestat
 * 2. Har en egen fallback-implementering om biblioteket inte fungerar
 * 3. Söker efter .env-filer på flera platser för bättre flexibilitet
 * 4. Hanterar känsliga variabler säkert vid loggning
 * 5. Integrerar med Spring's miljösystem på ett lämpligt sätt
 */
@Configuration
@Slf4j
public class EnvConfigUnified {

    private static final List<String> SENSITIVE_VARS = Arrays.asList(
        "EMAIL_PASSWORD", 
        "EMAIL_PASSWORD_INTRESSE",
        "SMTP_PASS",
        "JWT_SECRET",
        "MONGODB_PASSWORD",
        "DB_PASSWORD",
        "API_KEY",
        "GOOGLE_TRANSLATE_API_KEY"
    );
    
    private static final List<String> SEARCH_PATHS = Arrays.asList(
        ".env",                  // Relativ från arbetskatalogen
        "backend/.env",          // Om vi kör från projektets rot
        "../.env",               // Om vi kör från en underkatalog
        "../../.env"             // Om vi kör från en djupare underkatalog
    );

    private final ConfigurableEnvironment environment;

    public EnvConfigUnified(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void init() {
        
        try {
            // Metod 1: Använd dotenv-biblioteket (primär metod)
            boolean dotenvSuccess = loadWithDotenvLibrary();
            
            // Metod 2: Använd egen implementation som backup
            if (!dotenvSuccess) {
                log.info("Dotenv-biblioteket kunde inte hitta .env-filen, försöker med egen implementation");
                loadWithCustomImplementation();
            }
            
        } catch (Exception e) {
            log.error("Fel vid inläsning av miljövariabler: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Laddar miljövariabler med hjälp av dotenv-biblioteket
     * @return true om miljövariabler lästes in framgångsrikt
     */
    private boolean loadWithDotenvLibrary() {
        try {
            
            // Testa alla möjliga sökvägar i ordning
            Dotenv dotenv = null;
            
            for (String directory : SEARCH_PATHS) {
                // Strippa bort .env från directory om det finns med
                String searchDir = directory.endsWith(".env") 
                    ? directory.substring(0, directory.length() - 5)
                    : directory;
                
                // Om vi har en tom sträng, använd "." för att söka i aktuell katalog
                if (searchDir.isEmpty()) {
                    searchDir = ".";
                }
                                
                dotenv = Dotenv.configure()
                    .directory(searchDir)
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();
                
                if (!dotenv.entries().isEmpty()) {
                    log.info("Hittade .env-fil i katalog: {}", searchDir);
                    break;
                }
            }
            
            if (dotenv == null || dotenv.entries().isEmpty()) {
                log.info("Dotenv kunde inte hitta någon .env-fil");
                return false;
            }
            
            // Läs in miljövariabler från dotenv
            Map<String, Object> envMap = new HashMap<>();
            List<String> loadedVars = new ArrayList<>();
            
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                
                // Lägg till i envMap för Spring
                envMap.put(key, value);
                
                // Sätt som system property
                System.setProperty(key, value);
                
                // Loggning med skydd för känsliga värden
                if (SENSITIVE_VARS.contains(key)) {
                    loadedVars.add(key + "=*****");
                } else {
                    loadedVars.add(key + "=" + value);
                }
            });
            
            // Integrera med Spring's miljösystem
            MutablePropertySources propertySources = environment.getPropertySources();
            if (propertySources.contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
                propertySources.addAfter(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                    new MapPropertySource("dotenvProperties", envMap));
            } else {
                propertySources.addFirst(new MapPropertySource("dotenvProperties", envMap));
            }
            
            log.info("Laddat {} miljövariabler med dotenv", envMap.size());
            log.debug("Laddade miljövariabler: {}", loadedVars);
            
            return !envMap.isEmpty();
        } catch (Exception e) {
            log.error("Fel vid användning av dotenv-biblioteket: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Laddar miljövariabler med egen implementation som backup-lösning
     */
    private void loadWithCustomImplementation() {
        log.info("Använder egen implementation för att ladda miljövariabler");
        
        // Hitta .env-filen
        File envFile = findEnvFile();
        
        if (envFile == null) {
            log.info("Ingen .env-fil hittades. Hoppar över inläsning av miljövariabler.");
            log.debug("Aktuell arbetskatalog: {}", new File(".").getAbsolutePath());
            return;
        }
        
        log.info("Läser miljövariabler från: {}", envFile.getAbsolutePath());
        
        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            List<String> loadedVars = new ArrayList<>();
            Map<String, Object> envMap = new HashMap<>();
            
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
                    if ((value.startsWith("\"") && value.endsWith("\"")) || 
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length() - 1);
                    }
                    
                    // Sätt både System property och lägg till i envMap
                    System.setProperty(key, value);
                    envMap.put(key, value);
                    
                    // Logga endast icke-känsliga variabler
                    if (SENSITIVE_VARS.contains(key)) {
                        loadedVars.add(key + "=*****");
                    } else {
                        loadedVars.add(key + "=" + value);
                    }
                }
            }
            
            // Integrera med Spring's miljösystem
            MutablePropertySources propertySources = environment.getPropertySources();
            if (propertySources.contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
                propertySources.addAfter(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                    new MapPropertySource("envConfigProperties", envMap));
            } else {
                propertySources.addFirst(new MapPropertySource("envConfigProperties", envMap));
            }
            
            log.info("Laddat {} miljövariabler med egen implementation", loadedVars.size());
            log.debug("Laddade miljövariabler: {}", loadedVars);
            
        } catch (IOException e) {
            log.error("Fel vid inläsning av .env-fil: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Söker efter .env-filen i flera möjliga platser
     * @return Filen om den hittas, annars null
     */
    private File findEnvFile() {
        for (String path : SEARCH_PATHS) {
            File tempFile = new File(path);
            if (tempFile.exists()) {
                log.info("Hittade .env-fil på sökväg: {}", tempFile.getAbsolutePath());
                return tempFile;
            }
        }
        
        log.info("Ingen .env-fil hittades på någon av sökvägarna");
        return null;
    }
} 