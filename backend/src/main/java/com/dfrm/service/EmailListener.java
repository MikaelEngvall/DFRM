package com.dfrm.service;

import java.util.Properties;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.config.JavaMailProperties;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.PendingTaskRepository;
import com.dfrm.repository.TenantRepository;

import jakarta.mail.Address;
import jakarta.mail.BodyPart;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailListener {
    
    private final JavaMailProperties mailProperties;
    private final PendingTaskRepository pendingTaskRepository;
    private final Environment environment;
    private final TranslationService translationService;
    private final GoogleTranslateClient googleTranslateClient;
    private final TenantRepository tenantRepository;
    private final ApartmentRepository apartmentRepository;
    
    private static final String TARGET_RECIPIENT = "felanmalan@duggalsfastigheter.se";
    private static final String TARGET_SENDER = "felanmalan@duggalsfastigheter.se";
    private static final String TARGET_REPLY_TO = "mikael.engvall.me@gmail.com";

    private boolean isDevEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("dev".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    @Scheduled(fixedDelay = 60000) // Kör varje minut
    public void checkEmails() {
        log.info("Checking emails...");
        
        // Skydda mot null-värden
        if (mailProperties == null || 
            mailProperties.getHost() == null || 
            mailProperties.getListeningUsername() == null || 
            mailProperties.getListeningPassword() == null) {
            log.error("Mail properties are not properly configured: {}", mailProperties);
            return;
        }
        
        // I utvecklingsmiljö, logga men fortsätt körningen
        boolean isDev = isDevEnvironment();
        if (isDev) {
            log.info("Running in dev environment - will look for emails with Reply-To: {}", TARGET_REPLY_TO);
            log.info("Mail listening properties: host={}, port={}, username={}", 
                mailProperties.getHost(), mailProperties.getListeningPort(), mailProperties.getListeningUsername());
        }
        
        // Använd port 993 för IMAPS (inkommande e-post) oavsett konfiguration
        Properties properties = System.getProperties();
        properties.put("mail.store.protocol", "imaps");
        properties.put("mail.imaps.host", mailProperties.getHost());
        properties.put("mail.imaps.port", "993");
        
        // SSL-inställningar för IMAPS
        properties.put("mail.imaps.ssl.enable", "true");
        properties.put("mail.imaps.ssl.trust", "*");
        properties.put("mail.imaps.ssl.protocols", "TLSv1.2 TLSv1.1 TLSv1");
        
        // Socket factory för IMAPS SSL
        properties.put("mail.imaps.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        properties.put("mail.imaps.socketFactory.fallback", "false");
        properties.put("mail.imaps.socketFactory.port", "993");
        
        // Debug och timeouts
        properties.put("mail.debug", isDev ? "true" : "false");
        properties.put("mail.imaps.connectiontimeout", "20000");
        properties.put("mail.imaps.timeout", "20000");
        
        // Inaktivera strikta certifikatkontroller för utveckling
        if (isDev) {
            properties.put("mail.imaps.ssl.checkserveridentity", "false");
            log.info("Disabled strict certificate checks for development");
        }

        try {
            log.info("Creating mail session with host: {}, port: 993 (IMAPS)", 
                mailProperties.getHost());
                
            Session session = Session.getInstance(properties);
            session.setDebug(isDev);
            
            log.info("Connecting to mail server with username: {}", mailProperties.getListeningUsername());
            
            // Använd try-with-resources för att säkerställa att Store stängs ordentligt
            try (Store store = session.getStore("imaps")) {
                store.connect(
                    mailProperties.getHost(),
                    mailProperties.getListeningPort(), // Använd den specifika porten för lyssning
                    mailProperties.getListeningUsername(), // Använd det specifika användarnamnet för lyssning
                    mailProperties.getListeningPassword() // Använd det specifika lösenordet för lyssning
                );
                
                log.info("Successfully connected to mail server");

                Folder inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_WRITE);
                
                // Hämta alla olästa meddelanden
                Message[] messages = inbox.search(
                    new jakarta.mail.search.FlagTerm(
                        new jakarta.mail.Flags(jakarta.mail.Flags.Flag.SEEN), 
                        false
                    )
                );
                
                log.info("Found {} unread messages", messages.length);
                
                for (Message message : messages) {
                    try {
                        // Kontrollera reply-to adressen före bearbetning
                        Address[] replyTo = message.getReplyTo();
                        boolean validReplyTo = false;
                        
                        if (replyTo != null && replyTo.length > 0) {
                            for (Address address : replyTo) {
                                if (address instanceof InternetAddress 
                                    && TARGET_REPLY_TO.equals(((InternetAddress) address).getAddress())) {
                                    validReplyTo = true;
                                    break;
                                }
                            }
                        }
                        
                        if (validReplyTo) {
                            processEmail(message);
                        } else {
                            log.info("E-post ignorerad - ogiltig reply-to adress");
                        }
                    } catch (Exception e) {
                        log.error("Fel vid bearbetning av e-post: {}", e.getMessage(), e);
                    }
                }
                
                inbox.close(false);
            }
        } catch (Exception e) {
            log.error("Error checking emails: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                log.error("Caused by: {}", e.getCause().getMessage(), e.getCause());
            }
        }
    }

    private void processEmail(Message message) throws Exception {
        // Denna metod är för lång (över 200 rader) och bör brytas ned i:
        // 1. extractEmailContent(Message) -> String
        // 2. parseEmailFields(String) -> Map<String, String>
        // 3. createPendingTask(Map<String, String>) -> PendingTask
        // 4. enrichTaskData(PendingTask) -> PendingTask (hitta tenant/apartment)
        // 5. saveAndTranslate(PendingTask) -> void
        
        // ... mycket kod ...
    }

    private String getTextFromMessage(Message message) throws Exception {
        log.info("Message type: {}", message.getContentType());
        
        if (message.isMimeType("text/plain")) {
            Object content = message.getContent();
            log.info("Plain text content: {}", content);
            return content.toString();
        }
        
        if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            log.info("Found multipart message with {} parts", mimeMultipart.getCount());
            return getTextFromMimeMultipart(mimeMultipart);
        }
        
        log.warn("Unsupported message type: {}", message.getContentType());
        return message.getContent().toString();
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder result = new StringBuilder();
        int count = mimeMultipart.getCount();
        
        for (int i = 0; i < count; i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            log.info("Processing part {} of type {}", i, bodyPart.getContentType());
            
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            }
            else if (bodyPart.isMimeType("text/html")) {
                log.info("Found HTML content in part {}", i);
                // Extrahera text från HTML
                String htmlContent = bodyPart.getContent().toString();
                result.append(htmlContent);
            }
            else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart)bodyPart.getContent()));
            }
        }
        
        String text = result.toString();
        log.info("Extracted text content (first 200 chars): \n{}", 
            text.length() > 200 ? text.substring(0, 200) + "..." : text);
        return text;
    }

    private String cleanHtmlContent(String content) {
        if (content == null) {
            return "";
        }
        
        // Ta bort HTML-taggar
        String result = content.replaceAll("<[^>]*>", " ");
        
        // Ta bort överflödiga mellanslag
        result = result.replaceAll("\\s+", " ");
        
        // Konvertera HTML-entiteter
        result = result.replaceAll("&nbsp;", " ")
                       .replaceAll("&amp;", "&")
                       .replaceAll("&lt;", "<")
                       .replaceAll("&gt;", ">");
        
        return result.trim();
    }
} 