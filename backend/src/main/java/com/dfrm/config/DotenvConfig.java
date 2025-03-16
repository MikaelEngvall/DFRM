package com.dfrm.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.StandardEnvironment;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DotenvConfig {

    private final ConfigurableEnvironment environment;

    public DotenvConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void init() {
        // Försök först med backend/.env
        Dotenv dotenv = Dotenv.configure()
                .directory("backend")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        // Om ingen .env hittades i backend, försök med rotkatalogen
        if (dotenv.entries().isEmpty()) {
            log.info("No .env file found in backend directory, trying root directory");
            dotenv = Dotenv.configure()
                    .directory(".")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();
        }

        Map<String, Object> envMap = new HashMap<>();
        dotenv.entries().forEach(entry -> {
            envMap.put(entry.getKey(), entry.getValue());
            log.debug("Loaded environment variable: {} = {}", 
                entry.getKey(), 
                entry.getKey().contains("PASSWORD") ? "********" : entry.getValue());
        });

        log.info("Loaded {} environment variables", envMap.size());

        MutablePropertySources propertySources = environment.getPropertySources();
        if (propertySources.contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
            propertySources.addAfter(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                    new MapPropertySource("dotenvProperties", envMap));
        } else {
            propertySources.addFirst(new MapPropertySource("dotenvProperties", envMap));
        }
    }
} 