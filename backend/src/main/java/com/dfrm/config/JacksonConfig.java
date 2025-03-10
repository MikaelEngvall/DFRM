package com.dfrm.config;

import java.util.TimeZone;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.dfrm.model.KeyType;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Sätt tidszonen till Stockholm
        mapper.setTimeZone(TimeZone.getTimeZone("Europe/Stockholm"));
        
        // Registrera JavaTimeModule för att hantera datum
        mapper.registerModule(new JavaTimeModule());
        
        // Inaktivera konvertering av datum till timestamps
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        
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