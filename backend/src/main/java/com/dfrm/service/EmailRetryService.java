package com.dfrm.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * En tjänst för att hantera återförsök av misslyckade e-postutskick.
 * Lagrar misslyckade e-postutskick och försöker skicka dem igen enligt ett schema.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailRetryService {

    private final EmailService emailService;
    
    // Kö med misslyckade e-postmeddelanden som ska skickas igen
    private final ConcurrentLinkedQueue<EmailBatch> retryQueue = new ConcurrentLinkedQueue<>();
    
    // Map som håller statistik över återförsök per meddelande-ID
    private final ConcurrentHashMap<String, AtomicInteger> retryCountMap = new ConcurrentHashMap<>();
    
    // Maximala antal återförsök innan meddelandet betraktas som permanent misslyckat
    private static final int MAX_RETRY_ATTEMPTS = 5;
    
    // Tidsintervall mellan återförsök (millisekunder) - exponentiell backoff
    private static final long[] RETRY_INTERVALS = {
        1 * 60 * 1000,    // 1 minut
        5 * 60 * 1000,    // 5 minuter
        15 * 60 * 1000,   // 15 minuter
        30 * 60 * 1000,   // 30 minuter
        60 * 60 * 1000    // 1 timme
    };
    
    /**
     * Klass som representerar ett e-postbatch som ska skickas eller skickas igen
     */
    public static class EmailBatch {
        private final String id;                   // Unikt ID för e-postbatchen
        private final String subject;              // E-postens ämne
        private final String content;              // E-postens innehåll
        private final List<String> recipients;     // Mottagarlistan
        private final LocalDateTime createdAt;     // Tidpunkt då meddelandet lades till i kön
        private LocalDateTime nextRetryTime;       // Nästa tidpunkt då ett återförsök ska göras
        private int attemptCount;                  // Antal försök hittills
        private String lastErrorMessage;           // Senaste felmeddelande
        
        public EmailBatch(String subject, String content, List<String> recipients) {
            this.id = generateUniqueId();
            this.subject = subject;
            this.content = content;
            this.recipients = new ArrayList<>(recipients);
            this.createdAt = LocalDateTime.now();
            this.nextRetryTime = LocalDateTime.now();
            this.attemptCount = 0;
        }
        
        private String generateUniqueId() {
            return "email-" + System.currentTimeMillis() + "-" + System.nanoTime() % 10000;
        }
        
        public String getId() {
            return id;
        }
        
        public String getSubject() {
            return subject;
        }
        
        public String getContent() {
            return content;
        }
        
        public List<String> getRecipients() {
            return Collections.unmodifiableList(recipients);
        }
        
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        public LocalDateTime getNextRetryTime() {
            return nextRetryTime;
        }
        
        public void setNextRetryTime(LocalDateTime nextRetryTime) {
            this.nextRetryTime = nextRetryTime;
        }
        
        public int getAttemptCount() {
            return attemptCount;
        }
        
        public void incrementAttemptCount() {
            this.attemptCount++;
        }
        
        public String getLastErrorMessage() {
            return lastErrorMessage;
        }
        
        public void setLastErrorMessage(String lastErrorMessage) {
            this.lastErrorMessage = lastErrorMessage;
        }
    }
    
    /**
     * Lägger till ett nytt e-postbatch i återförsökskön.
     * 
     * @param subject E-postens ämne
     * @param content E-postens innehåll
     * @param recipients Mottagarlistan
     * @return Ett unikt ID för det schemalagda e-postbatchet
     */
    public String scheduleEmailBatch(String subject, String content, List<String> recipients) {
        EmailBatch batch = new EmailBatch(subject, content, recipients);
        retryQueue.add(batch);
        log.info("Schemalagt e-postbatch med ID {} för {} mottagare", batch.getId(), recipients.size());
        return batch.getId();
    }
    
    /**
     * Markerar ett specifikt e-postbatch som misslyckat och schemalägg ett nytt försök.
     * 
     * @param batchId ID för det misslyckade e-postbatchet
     * @param errorMessage Felmeddelande som beskriver misslyckandet
     */
    public void markBatchAsFailed(String batchId, String errorMessage) {
        log.warn("E-postbatch {} misslyckades: {}", batchId, errorMessage);
        
        // Hittar batchen i kön
        for (EmailBatch batch : retryQueue) {
            if (batch.getId().equals(batchId)) {
                batch.incrementAttemptCount();
                batch.setLastErrorMessage(errorMessage);
                
                int attemptCount = batch.getAttemptCount();
                
                if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                    log.error("E-postbatch {} har överskridit maximalt antal återförsök ({}). Markeras som permanent misslyckat.", 
                             batchId, MAX_RETRY_ATTEMPTS);
                    retryQueue.remove(batch);
                } else {
                    // Beräkna nästa återförsökstid med exponentiell backoff
                    int intervalIndex = Math.min(attemptCount - 1, RETRY_INTERVALS.length - 1);
                    long backoffInterval = RETRY_INTERVALS[intervalIndex];
                    LocalDateTime nextRetry = LocalDateTime.now().plusNanos(backoffInterval * 1_000_000);
                    
                    batch.setNextRetryTime(nextRetry);
                    log.info("Nytt försök för batch {} schemalagt till {}", batchId, nextRetry);
                }
                break;
            }
        }
    }
    
    /**
     * Schemalagd uppgift som kör återförsök för misslyckade e-postbatchar.
     * Körs var 30:e sekund.
     */
    @Scheduled(fixedDelay = 30000)
    @Async
    public void processRetryQueue() {
        LocalDateTime now = LocalDateTime.now();
        log.debug("Behandlar återförsökskön för e-post, nuvarande tidpunkt: {}", now);
        
        int processedCount = 0;
        
        List<EmailBatch> processedBatches = new ArrayList<>();
        for (EmailBatch batch : retryQueue) {
            // Om nästa återförsökstid har passerats
            if (batch.getNextRetryTime().isBefore(now)) {
                processedCount++;
                processedBatches.add(batch);
                
                try {
                    log.info("Försöker skicka e-postbatch {} igen (försök {}/{})", 
                           batch.getId(), batch.getAttemptCount() + 1, MAX_RETRY_ATTEMPTS);
                    
                    boolean success = sendBatchWithRetryLogic(batch);
                    
                    if (success) {
                        log.info("E-postbatch {} skickades framgångsrikt vid återförsök {}", 
                                batch.getId(), batch.getAttemptCount() + 1);
                        retryQueue.remove(batch);
                    } else {
                        markBatchAsFailed(batch.getId(), "Misslyckades vid återförsök " + (batch.getAttemptCount() + 1));
                    }
                } catch (Exception e) {
                    log.error("Fel vid återförsök av e-postbatch {}: {}", batch.getId(), e.getMessage(), e);
                    markBatchAsFailed(batch.getId(), e.getMessage());
                }
            }
        }
        
        // Tar bort alla batchar som har bearbetats och överskridit max försök
        for (EmailBatch batch : processedBatches) {
            if (batch.getAttemptCount() >= MAX_RETRY_ATTEMPTS) {
                log.warn("Tar bort permanent misslyckat e-postbatch {}", batch.getId());
                retryQueue.remove(batch);
            }
        }
        
        if (processedCount > 0) {
            log.info("Bearbetade {} e-postbatchar i återförsökskön. Kvarvarande i kön: {}", 
                    processedCount, retryQueue.size());
        }
    }
    
    /**
     * Skickar ett e-postbatch med återförsökslogik.
     * Använder olika strategier beroende på tidigare försök.
     * 
     * @param batch E-postbatchet som ska skickas
     * @return true om utskicket lyckades, false annars
     */
    private boolean sendBatchWithRetryLogic(EmailBatch batch) {
        try {
            int attemptCount = batch.getAttemptCount();
            batch.incrementAttemptCount();
            
            // Använd olika strategier för olika återförsök
            if (attemptCount == 0) {
                // Första återförsöket: vanlig batch-sending
                return emailService.sendBulkEmail(batch.getSubject(), batch.getContent(), batch.getRecipients());
            } else if (attemptCount == 1) {
                // Andra återförsöket: mindre batchstorlek
                return sendInSmallerBatches(batch);
            } else {
                // Tredje och senare återförsök: direkt SMTP-metod
                try {
                    String fromEmail = emailService.getFromEmail(); // Använd getFromEmail istället för getUsername
                    return emailService.sendBatchWithDirectMethod(
                        fromEmail, 
                        batch.getRecipients(), 
                        batch.getSubject(), 
                        batch.getContent()
                    );
                } catch (Exception e) {
                    log.error("Fel vid direktmetoden: {}", e.getMessage(), e);
                    return false;
                }
            }
        } catch (Exception e) {
            log.error("Fel vid återförsök av e-postbatch {}: {}", batch.getId(), e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Skickar e-post i mindre batchar än standard.
     * Används som en strategi för återförsök.
     * 
     * @param batch E-postbatchet som ska skickas
     * @return true om alla utskick lyckades, false om något misslyckades
     */
    private boolean sendInSmallerBatches(EmailBatch batch) {
        List<String> allRecipients = batch.getRecipients();
        int batchSize = 10; // Mindre batchstorlek för återförsök
        int totalRecipients = allRecipients.size();
        int successCount = 0;
        
        for (int i = 0; i < totalRecipients; i += batchSize) {
            int endIndex = Math.min(i + batchSize, totalRecipients);
            List<String> batchRecipients = allRecipients.subList(i, endIndex);
            
            try {
                log.info("Skickar mindre batch {}/{} med {} mottagare för e-postbatch {}", 
                        (i/batchSize)+1, (int)Math.ceil((double)totalRecipients/batchSize), 
                        batchRecipients.size(), batch.getId());
                
                boolean success = emailService.sendBulkEmail(
                    batch.getSubject(), batch.getContent(), batchRecipients);
                
                if (success) {
                    successCount += batchRecipients.size();
                }
                
                // Längre paus mellan mindre batchar vid återförsök
                if (endIndex < totalRecipients) {
                    log.info("Pausar i 5 sekunder före nästa mindre batch");
                    Thread.sleep(5000);
                }
            } catch (Exception e) {
                log.error("Fel vid skickande av mindre batch {}/{} för e-postbatch {}: {}", 
                        (i/batchSize)+1, (int)Math.ceil((double)totalRecipients/batchSize), 
                        batch.getId(), e.getMessage(), e);
            }
        }
        
        log.info("Mindre batch-utskick för e-postbatch {} slutfört. {} av {} mottagare lyckades.", 
                batch.getId(), successCount, totalRecipients);
        
        return successCount == totalRecipients;
    }
    
    /**
     * Returnerar statistik om återförsökskön.
     * 
     * @return Map med statistik om återförsökskön
     */
    public Map<String, Object> getQueueStatistics() {
        return Map.of(
            "queueSize", retryQueue.size(),
            "inProgress", retryQueue.stream()
                .filter(batch -> batch.getAttemptCount() > 0)
                .count(),
            "pending", retryQueue.stream()
                .filter(batch -> batch.getAttemptCount() == 0)
                .count(),
            "failedBatches", retryQueue.stream()
                .filter(batch -> batch.getAttemptCount() >= MAX_RETRY_ATTEMPTS)
                .count()
        );
    }
} 