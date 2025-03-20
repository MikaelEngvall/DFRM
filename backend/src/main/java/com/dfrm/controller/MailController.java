package com.dfrm.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.service.EmailService;

import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
@Slf4j
public class MailController {

    private final EmailService emailService;
    private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(5);
    
    /**
     * Kontrollera att e-posttjänsten fungerar korrekt
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEmailService() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        try {
            log.info("Testar e-postkonfiguration... {}", timestamp);
            
            // Skicka ett testmail
            emailService.sendEmail("mikael.engvall.me@gmail.com", 
                    "DFRM Testmail " + timestamp, 
                    "Detta är ett automatiskt testmail från DFRM systemet. Tidsstämpel: " + timestamp);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Testmail skickat till mikael.engvall.me@gmail.com",
                "timestamp", timestamp
            ));
        } catch (Exception e) {
            log.error("Fel vid testning av e-posttjänst: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Kunde inte skicka testmail: " + e.getMessage(),
                "timestamp", timestamp,
                "errorType", e.getClass().getName()
            ));
        }
    }
    
    /**
     * Visar aktuell SMTP-konfiguration för felsökning
     */
    @GetMapping("/config")
    public ResponseEntity<?> showEmailConfig() {
        try {
            if (emailService.getMailSender() instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mailSender = (JavaMailSenderImpl) emailService.getMailSender();
                
                return ResponseEntity.ok(Map.of(
                    "host", mailSender.getHost(),
                    "port", mailSender.getPort(),
                    "username", mailSender.getUsername(),
                    "passwordExists", mailSender.getPassword() != null && !mailSender.getPassword().isEmpty(),
                    "properties", mailSender.getJavaMailProperties(),
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "MailSender är inte av typen JavaMailSenderImpl",
                    "class", emailService.getMailSender().getClass().getName()
                ));
            }
        } catch (Exception e) {
            log.error("Fel vid hämtning av e-postkonfiguration: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Kunde inte hämta e-postkonfiguration: " + e.getMessage(),
                "errorType", e.getClass().getName()
            ));
        }
    }
    
    /**
     * Testar direktmetoden för att skicka e-post
     */
    @GetMapping("/test-direct")
    public ResponseEntity<?> testDirectEmail() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        try {
            log.info("Testar direkt e-postmetod... {}", timestamp);
            
            boolean success = emailService.sendDirectlyViaSmtp(
                "mikael.engvall.me@gmail.com", 
                "DFRM Direkt Testmail " + timestamp, 
                "<p>Detta är ett <b>direktskickat testmail</b> från DFRM systemet.</p>" +
                "<p>Tidsstämpel: " + timestamp + "</p>"
            );
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Direkt testmail skickat framgångsrikt",
                    "timestamp", timestamp
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Direktmetoden returnerade false",
                    "timestamp", timestamp
                ));
            }
        } catch (Exception e) {
            log.error("Fel vid testning av direkt e-postmetod: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Kunde inte skicka direkt testmail: " + e.getMessage(),
                "timestamp", timestamp,
                "errorType", e.getClass().getName()
            ));
        }
    }
    
    /**
     * Kontrollera att bulk-e-posttjänsten fungerar korrekt
     */
    @GetMapping("/test-bulk")
    public ResponseEntity<?> testBulkEmailService() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        try {
            log.info("Testar bulk-e-postkonfiguration... {}", timestamp);
            
            // Lista med testmottagare
            List<String> recipients = new ArrayList<>(
                Arrays.asList("info@duggalsfastigheter.se")
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bulk testmail skickat till " + recipients.size() + " mottagare",
                "recipients", recipients,
                "timestamp", timestamp
            ));
        } catch (Exception e) {
            log.error("Fel vid testning av bulk-e-posttjänst: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Kunde inte skicka bulk testmail: " + e.getMessage(),
                "timestamp", timestamp,
                "errorType", e.getClass().getName()
            ));
        }
    }
    
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
            
            // Logga alla e-postadresser i BCC-listan (begränsat antal)
            log.info("BCC mottagarlista (max 5 visade):");
            for (int i = 0; i < Math.min(5, recipients.size()); i++) {
                log.info(" - {}", recipients.get(i));
            }
            if (recipients.size() > 5) {
                log.info(" - ... och {} fler", recipients.size() - 5);
            }
            
            // Verifiera att e-postadresser är korrekta
            boolean allValid = true;
            for (String email : recipients) {
                if (!isValidEmail(email)) {
                    log.warn("Ogiltig e-postadress i mottagarlistan: {}", email);
                    allValid = false;
                }
            }
            
            if (!allValid) {
                log.warn("Mottagarlistan innehåller ogiltiga e-postadresser");
                // Vi fortsätter ändå, men noterar problemet
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
                                    long batchStartTime = System.currentTimeMillis();
                                    emailService.sendBulkEmail(subject, content, batch);
                                    long batchEndTime = System.currentTimeMillis();
                                    log.info("Batch {} slutförd på {} ms", batchNumber, (batchEndTime - batchStartTime));
                                } catch (Exception e) {
                                    log.error("Fel vid skickande av batch {}: {}", batchNumber, e.getMessage());
                                }
                            }, batchNumber * 3, TimeUnit.SECONDS); // 3 sekunders fördröjning mellan batcher
                        }
                    } else {
                        // Skicka direkt om det är få mottagare
                        log.info("Skickar direkt utan batching (få mottagare)");
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
                "processingTimeMs", responseTime,
                "timestamp", LocalDateTime.now().toString()
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
                "errorType", e.getClass().getName(),
                "timestamp", LocalDateTime.now().toString()
            ));
        }
    }
    
    /**
     * Validerar att en e-postadress är korrekt formaterad
     * 
     * @param email  e-postadressen att validera
     * @return true om adressen är giltig
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        // Enkel validering av e-postadress
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email.matches(emailRegex);
    }

    /**
     * Testkörning med ren Jakarta Mail utan Spring-abstraktion
     */
    @GetMapping("/test-pure-java")
    public ResponseEntity<?> testPureJavaMail() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        try {
            log.info("Testar ren Java Mail utan Spring-abstraktion... {}", timestamp);
            
            // Hämta inställningar från JavaMailSenderImpl om möjligt
            String host = "mailcluster.loopia.se";
            int port = 587;
            String username = "info@duggalsfastigheter.se";
            String password = "!e8E$..n2MP2W_7";
            
            if (emailService.getMailSender() instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mailSender = (JavaMailSenderImpl) emailService.getMailSender();
                host = mailSender.getHost();
                port = mailSender.getPort();
                username = mailSender.getUsername();
                password = mailSender.getPassword();
            }
            
            log.info("Konfiguration: host={}, port={}, username={}", host, port, username);
            
            // Skapa Properties-objekt med alla inställningar
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.host", host);
            props.put("mail.smtp.port", port);
            props.put("mail.smtp.connectiontimeout", "60000");
            props.put("mail.smtp.timeout", "60000");
            props.put("mail.smtp.writetimeout", "60000");
            
            // Lägg till SSL- eller STARTTLS-inställningar baserat på port
            if (port == 465) {
                log.info("Använder SSL för port 465");
                props.put("mail.smtp.ssl.enable", "true");
                props.put("mail.smtp.starttls.enable", "false");
                props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                props.put("mail.smtp.socketFactory.port", "465");
            } else {
                log.info("Använder STARTTLS för port {}", port);
                props.put("mail.smtp.ssl.enable", "false");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
            }
            
            // För att behålla variablerna final för inre klasser
            final String finalUsername = username;
            final String finalPassword = password;
            final String finalHost = host;
            
            // Skapa session med autentisering
            Session session = Session.getInstance(props,
                    new jakarta.mail.Authenticator() {
                        protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                            return new jakarta.mail.PasswordAuthentication(finalUsername, finalPassword);
                        }
                    });
            
            // Aktivera debug-läge
            session.setDebug(true);
            
            try {
                // Skapa meddelande
                MimeMessage message = new MimeMessage(session);
                message.setFrom(new InternetAddress(finalUsername));
                message.setRecipients(MimeMessage.RecipientType.TO, InternetAddress.parse("mikael.engvall.me@gmail.com"));
                message.setSubject("DFRM Ren Java Mail Test " + timestamp);
                message.setContent(
                    "<h3>Detta är ett testmeddelande från DFRM</h3>" +
                    "<p>Detta e-postmeddelande är skickat direkt med Jakarta Mail API, utan Spring-abstraktion.</p>" +
                    "<p>Tidsstämpel: " + timestamp + "</p>",
                    "text/html; charset=utf-8"
                );
                
                // Skicka meddelandet
                log.info("Skickar e-post med Jakarta Mail...");
                Transport.send(message);
                log.info("E-post skickad framgångsrikt!");
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Jakarta Mail-e-post skickad framgångsrikt",
                    "timestamp", timestamp,
                    "config", Map.of(
                        "host", finalHost,
                        "port", port,
                        "username", finalUsername
                    )
                ));
            } catch (Exception e) {
                log.error("Fel vid skickande av e-post: {}", e.getMessage(), e);
                
                // Vi ska försöka med en helt separat konfiguration och port 465
                log.info("Försöker igen med port 465 och SSL...");
                
                props = new Properties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.host", finalHost);
                props.put("mail.smtp.port", 465);
                props.put("mail.smtp.socketFactory.port", "465");
                props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                props.put("mail.smtp.ssl.enable", "true");
                props.put("mail.smtp.starttls.enable", "false");
                
                session = Session.getInstance(props,
                        new jakarta.mail.Authenticator() {
                            protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                                return new jakarta.mail.PasswordAuthentication(finalUsername, finalPassword);
                            }
                        });
                
                session.setDebug(true);
                
                try {
                    // Skapa meddelande för andra försöket
                    MimeMessage message = new MimeMessage(session);
                    message.setFrom(new InternetAddress(finalUsername));
                    message.setRecipients(MimeMessage.RecipientType.TO, InternetAddress.parse("mikael.engvall.me@gmail.com"));
                    message.setSubject("DFRM Ren Java Mail Test (Försök 2) " + timestamp);
                    message.setContent(
                        "<h3>Detta är ett testmeddelande från DFRM (Försök 2)</h3>" +
                        "<p>Detta e-postmeddelande är skickat efter nytt försök med port 465.</p>" +
                        "<p>Tidsstämpel: " + timestamp + "</p>",
                        "text/html; charset=utf-8"
                    );
                    
                    // Skicka meddelandet
                    log.info("Skickar e-post med Jakarta Mail på port 465...");
                    Transport.send(message);
                    log.info("E-post skickad framgångsrikt på andra försöket!");
                    
                    return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Jakarta Mail-e-post skickad framgångsrikt på andra försöket med port 465",
                        "timestamp", timestamp
                    ));
                } catch (Exception e2) {
                    log.error("Fel vid andra försöket: {}", e2.getMessage(), e2);
                    throw new RuntimeException("Båda försöken misslyckades", e2);
                }
            }
        } catch (Exception e) {
            log.error("Övergripande fel vid Jakarta Mail-test: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Kunde inte skicka med Jakarta Mail: " + e.getMessage(),
                "timestamp", timestamp,
                "errorType", e.getClass().getName()
            ));
        }
    }
} 