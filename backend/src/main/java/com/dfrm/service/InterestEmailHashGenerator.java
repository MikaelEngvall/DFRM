package com.dfrm.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Objects;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Hjälpklass för att generera deterministiska hashvärden från intresseanmälningar.
 * Används för att detektera dubbletter på ett mer effektivt sätt.
 */
@Component
@Slf4j
public class InterestEmailHashGenerator {

    /**
     * Genererar ett unikt hashvärde baserat på e-postadress och lägenhetsinformation.
     * Detta är den primära nyckeln för dubblettdetektering.
     *
     * @param email E-postadress från intresseanmälan
     * @param apartment Lägenhetsinformation (lägenhetsnummer eller beskrivning)
     * @return En unik hashsträng eller null om något gick fel
     */
    public String generatePrimaryHash(String email, String apartment) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        
        // Normalisera e-postadress (ta bort alla mellanslag och konvertera till lowercase)
        String normalizedEmail = email.trim().toLowerCase().replaceAll("\\s+", "");
        
        // Normalisera lägenhetsinformation om den finns
        String normalizedApartment = "";
        if (apartment != null && !apartment.trim().isEmpty()) {
            // Ta bort onödiga tecken och konvertera till lowercase
            normalizedApartment = apartment.trim().toLowerCase()
                .replaceAll("\\s+", "")
                .replaceAll("[^a-zåäö0-9]", "");
        }
        
        // Kombinera och skapa en hash
        String combinedKey = normalizedEmail + "|" + normalizedApartment;
        return generateSHA256Hash(combinedKey);
    }
    
    /**
     * Genererar ett sekundärt hashvärde baserat på e-postadress, telefonnummer och namn.
     * Kan användas som backup om den primära nyckeln saknar lägenhetsinformation.
     *
     * @param email E-postadress
     * @param phone Telefonnummer
     * @param name Namn 
     * @return En unik hashsträng eller null om något gick fel
     */
    public String generateSecondaryHash(String email, String phone, String name) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        
        // Normalisera e-postadress
        String normalizedEmail = email.trim().toLowerCase().replaceAll("\\s+", "");
        
        // Normalisera telefonnummer om det finns
        String normalizedPhone = "";
        if (phone != null && !phone.trim().isEmpty()) {
            // Ta bort alla icke-numeriska tecken
            normalizedPhone = phone.replaceAll("[^0-9]", "");
        }
        
        // Normalisera namn om det finns
        String normalizedName = "";
        if (name != null && !name.trim().isEmpty() && !Objects.equals(name, "Okänd")) {
            // Ta bort alla specialtecken och konvertera till lowercase
            normalizedName = name.trim().toLowerCase()
                .replaceAll("\\s+", "")
                .replaceAll("[^a-zåäö0-9]", "");
        }
        
        // Kombinera och skapa en hash
        String combinedKey = normalizedEmail + "|" + normalizedPhone + "|" + normalizedName;
        return generateSHA256Hash(combinedKey);
    }
    
    /**
     * Genererar ett tredje hashvärde baserat på e-postadress och meddelande.
     * Används för att detektera om samma person skickar identiska meddelanden.
     *
     * @param email E-postadress
     * @param message Meddelandeinnehåll
     * @return En unik hashsträng eller null om något gick fel
     */
    public String generateContentHash(String email, String message) {
        if (email == null || email.trim().isEmpty() || 
            message == null || message.trim().isEmpty()) {
            return null;
        }
        
        // Normalisera e-postadress
        String normalizedEmail = email.trim().toLowerCase().replaceAll("\\s+", "");
        
        // Normalisera meddelande
        // Ta bort alla whitespace och konvertera till lowercase för jämförelsesyfte
        String normalizedMessage = message.trim().toLowerCase()
            .replaceAll("\\s+", "")
            .replaceAll("[^a-zåäö0-9]", "");
        
        // Använd bara första 100 tecknen av meddelandet för att undvika problem med stora texter
        if (normalizedMessage.length() > 100) {
            normalizedMessage = normalizedMessage.substring(0, 100);
        }
        
        // Kombinera och skapa en hash
        String combinedKey = normalizedEmail + "|" + normalizedMessage;
        return generateSHA256Hash(combinedKey);
    }
    
    /**
     * Genererar en SHA-256 hash från en sträng.
     *
     * @param input Strängen som ska hashas
     * @return Hashvärdet som en hexadecimal sträng, eller null om något gick fel
     */
    private String generateSHA256Hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            
            // Konvertera hashen till en hexadecimal sträng
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("Kunde inte generera hash: SHA-256 algoritmen finns inte", e);
            return null;
        }
    }
} 