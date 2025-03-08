package com.dfrm.config;

import java.io.IOException;

import com.dfrm.model.KeyType;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

/**
 * Deserializer för att konvertera strängar till KeyType enum
 */
public class KeyTypeDeserializer extends JsonDeserializer<KeyType> {

    @Override
    public KeyType deserialize(JsonParser p, DeserializationContext ctxt)
            throws IOException, JsonProcessingException {
        String value = p.getValueAsString();
        if (value == null || value.isEmpty()) {
            return null;
        }
        
        try {
            // Försök att tolka värdet som en enum
            return KeyType.valueOf(value);
        } catch (IllegalArgumentException e) {
            // Om det inte är ett giltigt enum-värde, logga och returnera null
            System.err.println("Ogiltigt nyckeltyp-värde: " + value);
            return null;
        }
    }
} 