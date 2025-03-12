package com.dfrm.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Laddar miljövariabler från .env-filen i projektets rot om den finns.
 * Detta gör att applikationen kan köras direkt utan att behöva ställa in miljövariabler i operativsystemet.
 */
@Configuration
public class ApplicationConfig {

    @Bean
    public boolean loadEnvironmentVariables(Environment env) {
        try {
            // Försök hitta .env-filen i projektets rot
            String rootPath = Paths.get("").toAbsolutePath().toString();
            File envFile = new File(rootPath + "/../.env");
            
            if (!envFile.exists()) {
                // Försök hitta filen i parent-katalogen (om vi kör från backend-mappen)
                envFile = new File(rootPath + "/.env");
            }
            
            if (envFile.exists()) {
                Properties props = new Properties();
                FileInputStream input = new FileInputStream(envFile);
                props.load(input);
                input.close();
                
                // Ställ in miljövariabler
                for (String key : props.stringPropertyNames()) {
                    String value = props.getProperty(key);
                    if (value != null && !value.trim().isEmpty() && !value.contains("din_")) {
                        // Ställ in miljövariabeln om den inte redan är satt
                        if (System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
                return true;
            } else {
                System.out.println("VARNING: Ingen .env-fil hittades. Använder systemets miljövariabler.");
                return false;
            }
        } catch (IOException e) {
            System.err.println("VARNING: Kunde inte läsa .env-filen: " + e.getMessage());
            return false;
        }
    }
} 