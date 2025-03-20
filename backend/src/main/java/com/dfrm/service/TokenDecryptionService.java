package com.dfrm.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenDecryptionService {

    private static final Logger log = LoggerFactory.getLogger(TokenDecryptionService.class);
    
    @Value("${token.decryption.key:default-secret-key-change-in-production}")
    private String secretKey;
    
    /**
     * Försöker dekryptera en krypterad token från frontend
     * @param encryptedToken den krypterade tokenen
     * @return den dekrypterade tokenen eller null om det inte gick att dekryptera
     */
    public String decryptToken(String encryptedToken) {
        if (encryptedToken == null || encryptedToken.isEmpty()) {
            return null;
        }
        
        try {
            // CryptoJS.AES dekryptering
            // Detta matchar krypteringen som används i frontend i secureStorage.js
            
            byte[] cipherData = Base64.getDecoder().decode(encryptedToken);
            
            // Hämta salt (första 8 bytes efter "Salted__")
            byte[] salt = new byte[8];
            System.arraycopy(cipherData, 8, salt, 0, 8);
            
            // Generera nyckel och IV
            byte[] keyAndIv = getKeyAndIV(secretKey.getBytes(StandardCharsets.UTF_8), salt);
            byte[] key = new byte[32]; // 256 bit nyckel
            byte[] iv = new byte[16];  // 128 bit IV
            System.arraycopy(keyAndIv, 0, key, 0, key.length);
            System.arraycopy(keyAndIv, key.length, iv, 0, iv.length);
            
            // Skapa AES-chiffer
            SecretKeySpec secretKeySpec = new SecretKeySpec(key, "AES");
            IvParameterSpec ivParameterSpec = new IvParameterSpec(iv);
            
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParameterSpec);
            
            // Dekryptera data (hoppa över "Salted__" + salt)
            byte[] encryptedBytes = new byte[cipherData.length - 16];
            System.arraycopy(cipherData, 16, encryptedBytes, 0, encryptedBytes.length);
            byte[] decrypted = cipher.doFinal(encryptedBytes);
            
            // Konvertera resultatet till JSON
            String decryptedString = new String(decrypted, StandardCharsets.UTF_8);
            
            // Ta bort omgivande citattecken om de finns
            if (decryptedString.startsWith("\"") && decryptedString.endsWith("\"")) {
                decryptedString = decryptedString.substring(1, decryptedString.length() - 1);
            }
            
            return decryptedString;
            
        } catch (Exception e) {
            log.error("Fel vid dekryptering av token: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Genererar nyckel och IV från salt och lösenord med OpenSSL EVP_BytesToKey
     * Detta matchar CryptoJS.AES implementationen
     */
    private byte[] getKeyAndIV(byte[] passphrase, byte[] salt) {
        final int keyLength = 32;
        final int ivLength = 16;
        final int iterations = 1;
        
        byte[] md = new byte[0];
        byte[] result = new byte[keyLength + ivLength];
        byte[] prev = new byte[0];
        
        try {
            java.security.MessageDigest md5 = java.security.MessageDigest.getInstance("MD5");
            
            int requiredLength = keyLength + ivLength;
            int generatedLength = 0;
            
            while (generatedLength < requiredLength) {
                byte[] data = new byte[prev.length + passphrase.length + salt.length];
                System.arraycopy(prev, 0, data, 0, prev.length);
                System.arraycopy(passphrase, 0, data, prev.length, passphrase.length);
                System.arraycopy(salt, 0, data, prev.length + passphrase.length, salt.length);
                
                md5.reset();
                md = md5.digest(data);
                prev = md;
                
                System.arraycopy(md, 0, result, generatedLength, Math.min(md.length, requiredLength - generatedLength));
                generatedLength += md.length;
                
                // Ytterligare iterationer om det behövs
                for (int i = 1; i < iterations; i++) {
                    md5.reset();
                    md = md5.digest(md);
                    for (int j = 0; j < md.length && generatedLength < requiredLength; j++, generatedLength++) {
                        result[generatedLength] = md[j];
                    }
                }
            }
        } catch (Exception e) {
            log.error("Fel vid generering av nyckel och IV: {}", e.getMessage(), e);
        }
        
        return result;
    }
    
    /**
     * Kontrollerar om en token är krypterad
     * @param token token att kontrollera
     * @return true om token är krypterad enligt frontend-formatet
     */
    public boolean isEncryptedToken(String token) {
        // CryptoJS.AES krypterade strängar börjar med "U2Fs" vilket är base64-kodad "Salted__"
        return token != null && token.startsWith("U2Fs");
    }
} 