package com.dfrm.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
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
    private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(5);
    
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
            
            log.info("Schemaläggning av bulk e-post till {} mottagare med ämne: '{}'", recipients.size(), subject);
            
            // Logga alla e-postadresser i BCC-listan
            log.info("BCC mottagarlista (max 5 visade):");
            for (int i = 0; i < Math.min(5, recipients.size()); i++) {
                log.info(" - {}", recipients.get(i));
            }
            if (recipients.size() > 5) {
                log.info(" - ... och {} fler", recipients.size() - 5);
            }
            
            // Starta en asynkron process för att skicka e-post utan att blockera HTTP-svaret
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("Påbörjar asynkron e-postuppsändning...");
                    
                    // Dela upp mottagarlistan i mindre batchar för effektivare sändning
                    // om antalet mottagare är stort
                    if (recipients.size() > 25) {
                        log.info("Delar upp {} mottagare i mindre batchar", recipients.size());
                        int batchSize = 25;
                        for (int i = 0; i < recipients.size(); i += batchSize) {
                            final int startIndex = i;
                            final int endIndex = Math.min(i + batchSize, recipients.size());
                            final List<String> batch = recipients.subList(startIndex, endIndex);
                            
                            log.info("Skickar batch {} till {} (totalt {} mottagare)", startIndex, endIndex - 1, batch.size());
                            
                            // Schemalägg varje batch med en liten fördröjning mellan dem
                            final int batchNumber = i / batchSize;
                            executorService.schedule(() -> {
                                try {
                                    emailService.sendBulkEmail(subject, content, batch);
                                    log.info("Batch {} slutförd", batchNumber);
                                } catch (Exception e) {
                                    log.error("Fel vid skickande av batch {}: {}", batchNumber, e.getMessage());
                                }
                            }, batchNumber * 2, TimeUnit.SECONDS); // 2 sekunders fördröjning mellan batcher
                        }
                    } else {
                        // Skicka direkt om det är få mottagare
                        emailService.sendBulkEmail(subject, content, recipients);
                    }
                    
                    log.info("Asynkron e-postuppsändning schemalagd");
                } catch (Exception e) {
                    log.error("Fel vid asynkron e-postuppsändning: {}", e.getMessage(), e);
                }
            });
            
            // Returnera ett omedelbart svar till klienten
            long responseTime = System.currentTimeMillis() - startTime;
            return ResponseEntity.accepted().body(Map.of(
                "success", true,
                "message", "Email sending has been scheduled",
                "recipientCount", recipients.size(),
                "processingTimeMs", responseTime
            ));
            
        } catch (Exception e) {
            log.error("Error scheduling bulk email: {}", e.getMessage(), e);
            
            // Mer detaljerad felrapportering
            String errorDetails = e.getMessage();
            if (e.getCause() != null) {
                errorDetails += " Caused by: " + e.getCause().getMessage();
            }
            
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to schedule email: " + errorDetails,
                "errorType", e.getClass().getName()
            ));
        }
    }
} 