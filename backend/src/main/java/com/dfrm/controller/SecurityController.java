package com.dfrm.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.User;
import com.dfrm.service.SecurityTokenService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityController {

    private final SecurityTokenService securityTokenService;
    private final UserService userService;
    
    /**
     * Startar processen för att återställa ett lösenord genom att skicka en 
     * säkerhetslänk till användarens e-postadress
     */
    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "E-postadressen saknas"));
        }
        
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Av säkerhetsskäl, låtsas som att vi skickat ett e-postmeddelande
            return ResponseEntity.ok(Map.of("message", "Om e-postadressen finns i vårt system har ett e-postmeddelande skickats"));
        }
        
        securityTokenService.createPasswordResetTokenForUser(userOpt.get());
        
        return ResponseEntity.ok(Map.of("message", "E-postmeddelande för lösenordsåterställning har skickats"));
    }
    
    /**
     * Validerar en token och ändrar användarens lösenord
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");
        
        if (token == null || token.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token eller lösenord saknas"));
        }
        
        boolean result = securityTokenService.validatePasswordResetToken(token, newPassword);
        
        if (result) {
            return ResponseEntity.ok(Map.of("message", "Lösenordet har uppdaterats"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Ogiltig eller utgången token"));
        }
    }
    
    /**
     * Startar processen för att ändra en användares e-postadress genom att skicka
     * en bekräftelselänk till den nya adressen
     */
    @PostMapping("/request-email-change")
    public ResponseEntity<?> requestEmailChange(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String newEmail = request.get("newEmail");
        
        if (userId == null || userId.isEmpty() || newEmail == null || newEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Användar-ID eller ny e-postadress saknas"));
        }
        
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Användaren hittades inte"));
        }
        
        // Kontrollera att den nya e-postadressen inte redan används
        if (userService.existsByEmail(newEmail)) {
            return ResponseEntity.badRequest().body(Map.of("message", "E-postadressen används redan"));
        }
        
        securityTokenService.createEmailChangeTokenForUser(userOpt.get(), newEmail);
        
        return ResponseEntity.ok(Map.of("message", "Bekräftelselänk har skickats till den nya e-postadressen"));
    }
    
    /**
     * Validerar en token och uppdaterar användarens e-postadress
     */
    @PostMapping("/confirm-email")
    public ResponseEntity<?> confirmEmailChange(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token saknas"));
        }
        
        boolean result = securityTokenService.validateEmailChangeToken(token);
        
        if (result) {
            return ResponseEntity.ok(Map.of("message", "E-postadressen har uppdaterats"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Ogiltig eller utgången token"));
        }
    }
} 