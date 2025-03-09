package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dfrm.model.SecurityToken;
import com.dfrm.model.SecurityToken.TokenType;
import com.dfrm.model.User;
import com.dfrm.repository.SecurityTokenRepository;
import com.dfrm.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SecurityTokenService {

    private final SecurityTokenRepository securityTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    private static final long EXPIRATION_TIME_MINUTES = 60; // 60 minuter

    /**
     * Skapar en token för lösenordsåterställning och skickar e-post till användaren
     */
    public void createPasswordResetTokenForUser(User user) {
        String token = generateToken();
        
        // Avaktivera tidigare oanvända token för samma användare
        Optional<SecurityToken> existingToken = securityTokenRepository
            .findByUserAndTokenTypeAndUsed(user, TokenType.PASSWORD_RESET, false);
        existingToken.ifPresent(t -> {
            t.setUsed(true);
            securityTokenRepository.save(t);
        });
        
        SecurityToken passwordResetToken = SecurityToken.builder()
            .token(token)
            .user(user)
            .tokenType(TokenType.PASSWORD_RESET)
            .expiryDate(calculateExpiryDate())
            .used(false)
            .build();
        
        securityTokenRepository.save(passwordResetToken);
        
        // Skicka e-post med länk för lösenordsåterställning
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        String subject = "Återställning av lösenord";
        String body = "Hej " + user.getFirstName() + ",\n\n" +
                      "Klicka på följande länk för att återställa ditt lösenord:\n" +
                      resetUrl + "\n\n" +
                      "Länken är giltig i 60 minuter.\n\n" +
                      "Om du inte begärt återställning av lösenord kan du ignorera detta meddelande.";
        
        emailService.sendEmail(user.getEmail(), subject, body);
    }
    
    /**
     * Skapar en token för e-postbyte och skickar e-post till den nya e-postadressen
     */
    public void createEmailChangeTokenForUser(User user, String newEmail) {
        String token = generateToken();
        
        // Avaktivera tidigare oanvända token för samma användare
        Optional<SecurityToken> existingToken = securityTokenRepository
            .findByUserAndTokenTypeAndUsed(user, TokenType.EMAIL_CHANGE, false);
        existingToken.ifPresent(t -> {
            t.setUsed(true);
            securityTokenRepository.save(t);
        });
        
        SecurityToken emailChangeToken = SecurityToken.builder()
            .token(token)
            .user(user)
            .tokenType(TokenType.EMAIL_CHANGE)
            .newEmail(newEmail)
            .expiryDate(calculateExpiryDate())
            .used(false)
            .build();
        
        securityTokenRepository.save(emailChangeToken);
        
        // Skicka e-post till den nya e-postadressen med bekräftelselänk
        String confirmUrl = "http://localhost:3000/confirm-email?token=" + token;
        String subject = "Bekräfta din nya e-postadress";
        String body = "Hej " + user.getFirstName() + ",\n\n" +
                     "Klicka på följande länk för att bekräfta din nya e-postadress:\n" +
                     confirmUrl + "\n\n" +
                     "Länken är giltig i 60 minuter.\n\n" +
                     "Om du inte begärt att byta e-postadress kan du ignorera detta meddelande.";
        
        emailService.sendEmail(newEmail, subject, body);
    }
    
    /**
     * Validerar token och uppdaterar användarens lösenord
     */
    public boolean validatePasswordResetToken(String token, String newPassword) {
        Optional<SecurityToken> tokenOpt = securityTokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty() || tokenOpt.get().isExpired() || tokenOpt.get().isUsed() || 
            tokenOpt.get().getTokenType() != TokenType.PASSWORD_RESET) {
            return false;
        }
        
        SecurityToken securityToken = tokenOpt.get();
        User user = securityToken.getUser();
        
        // Uppdatera lösenord
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Markera token som använd
        securityToken.setUsed(true);
        securityTokenRepository.save(securityToken);
        
        return true;
    }
    
    /**
     * Validerar token och uppdaterar användarens e-postadress
     */
    public boolean validateEmailChangeToken(String token) {
        Optional<SecurityToken> tokenOpt = securityTokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty() || tokenOpt.get().isExpired() || tokenOpt.get().isUsed() || 
            tokenOpt.get().getTokenType() != TokenType.EMAIL_CHANGE) {
            return false;
        }
        
        SecurityToken securityToken = tokenOpt.get();
        User user = securityToken.getUser();
        
        // Uppdatera e-postadress
        user.setEmail(securityToken.getNewEmail());
        userRepository.save(user);
        
        // Markera token som använd
        securityToken.setUsed(true);
        securityTokenRepository.save(securityToken);
        
        return true;
    }
    
    private String generateToken() {
        return UUID.randomUUID().toString();
    }
    
    private LocalDateTime calculateExpiryDate() {
        return LocalDateTime.now().plusMinutes(EXPIRATION_TIME_MINUTES);
    }
} 