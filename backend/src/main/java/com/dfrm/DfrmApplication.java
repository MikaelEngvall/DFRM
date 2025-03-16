package com.dfrm;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class DfrmApplication {
    public static void main(String[] args) {
        // Ladda .env-filen innan Spring Boot startar
        Dotenv dotenv = Dotenv.configure()
                .directory(".")
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        // Skapa en SpringApplication-instans
        SpringApplication app = new SpringApplication(DfrmApplication.class);

        // Skapa en Map med miljövariabler från .env-filen
        Map<String, Object> properties = new HashMap<>();
        dotenv.entries().forEach(entry -> {
            properties.put(entry.getKey(), entry.getValue());
            // Sätt också som system property för säkerhets skull
            System.setProperty(entry.getKey(), entry.getValue());
        });

        // Sätt default properties på SpringApplication
        app.setDefaultProperties(properties);

        // Starta applikationen
        app.run(args);
    }
} 