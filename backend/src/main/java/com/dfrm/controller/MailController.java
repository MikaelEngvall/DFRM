package com.dfrm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
@Slf4j
public class MailController {

    private final EmailService emailService;
    
    @PostMapping("/bulk")
    public ResponseEntity<?> sendBulkEmail(@RequestBody Map<String, Object> mailRequest) {
        try {
            String subject = (String) mailRequest.get("subject");
            String content = (String) mailRequest.get("content");
            @SuppressWarnings("unchecked")
            List<String> recipients = (List<String>) mailRequest.get("recipients");
            
            if (subject == null || content == null || recipients == null || recipients.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Subject, content and recipients are required"
                ));
            }
            
            log.info("Sending bulk email to {} recipients", recipients.size());
            
            // Logga alla e-postadresser i BCC-listan
            log.info("BCC recipients list:");
            for (String recipient : recipients) {
                log.info(" - {}", recipient);
            }
            
            // Skicka till varje mottagare som dold kopia (BCC)
            emailService.sendBulkEmail(subject, content, recipients);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email sent successfully",
                "recipientCount", recipients.size(),
                "recipients", recipients // Lägg till mottagarlistan i svaret
            ));
            
        } catch (Exception e) {
            log.error("Error sending bulk email", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to send email: " + e.getMessage()
            ));
        }
    }
} 