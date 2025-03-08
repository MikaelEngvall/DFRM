package com.dfrm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import com.dfrm.model.KeyType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.DeserializationFeature;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Registrera JavaTimeModule för att hantera datum
        mapper.registerModule(new JavaTimeModule());
        
        // Konfigurera KeyType-konvertering
        SimpleModule keyTypeModule = new SimpleModule();
        
        // Använd toString för att serialisera KeyType till String
        keyTypeModule.addSerializer(KeyType.class, new ToStringSerializer());
        
        // Konfigurera deserialisering av KeyType (från String)
        keyTypeModule.addDeserializer(KeyType.class, new KeyTypeDeserializer());
        
        mapper.registerModule(keyTypeModule);
        
        // Tillåt okända fält när vi deserialiserar
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        return mapper;
    }
} 