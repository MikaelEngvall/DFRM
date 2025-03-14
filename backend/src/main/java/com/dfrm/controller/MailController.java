package com.dfrm.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

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
            long startTime = System.currentTimeMillis();
            log.info("Mottog e-postförfrågan med data: {}", mailRequest.keySet());
            
            String subject = (String) mailRequest.get("subject");
            String content = (String) mailRequest.get("content");
            @SuppressWarnings("unchecked")
            List<String> recipients = (List<String>) mailRequest.get("recipients");
            
            if (subject == null || content == null || recipients == null || recipients.isEmpty()) {
                log.warn("Ogiltiga e-postparametrar: subject={}, content={}, recipients={}", 
                    subject != null, content != null, recipients != null ? recipients.size() : null);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Subject, content and recipients are required"
                ));
            }
            
            log.info("Sending bulk email to {} recipients with subject: '{}'", recipients.size(), subject);
            
            // Logga alla e-postadresser i BCC-listan
            log.info("BCC recipients list:");
            for (String recipient : recipients) {
                log.info(" - {}", recipient);
            }
            
            // Använd CompletableFuture med timeout för att undvika att API:et hänger
            try {
                CompletableFuture<Void> emailFuture = CompletableFuture.runAsync(() -> {
                    log.info("Starting asynchronous email sending...");
                    emailService.sendBulkEmail(subject, content, recipients);
                    log.info("Asynchronous email sending completed successfully");
                });
                
                // Vänta på att e-posterna skickas med en timeout på 30 sekunder (utökad från 10 sekunder)
                log.info("Waiting for email sending to complete (timeout: 30 seconds)...");
                emailFuture.get(30, TimeUnit.SECONDS);
                
                long endTime = System.currentTimeMillis();
                log.info("E-post skickad framgångsrikt på {} ms", (endTime - startTime));
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email sent successfully",
                    "recipientCount", recipients.size(),
                    "recipients", recipients, // Lägg till mottagarlistan i svaret
                    "processingTimeMs", (endTime - startTime)
                ));
            } catch (java.util.concurrent.TimeoutException e) {
                log.error("E-postuppsändningen tog för lång tid (> 30 sekunder)", e);
                return ResponseEntity.status(504).body(Map.of(
                    "success", false,
                    "message", "Email request timed out after 30 seconds"
                ));
            }
            
        } catch (Exception e) {
            log.error("Error sending bulk email", e);
            
            // Mer detaljerad felrapportering
            String errorDetails = e.getMessage();
            if (e.getCause() != null) {
                errorDetails += " Caused by: " + e.getCause().getMessage();
            }
            
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to send email: " + errorDetails,
                "errorType", e.getClass().getName()
            ));
        }
    }
} 