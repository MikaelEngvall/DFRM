package com.dfrm.service;

import java.util.List;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${mail.interest.username:intresse@duggalsfastigheter.se}")
    private String interestEmail;
    
    /**
     * Skickar ett e-postmeddelande
     * 
     * @param to      mottagarens e-postadress
     * @param subject ämne
     * @param text    innehåll
     */
    public void sendEmail(String to, String subject, String text) {
        try {
            // Konfigurera timeout-värden
            configureTimeouts();
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            log.info("Försöker skicka e-post från {} till: {}", fromEmail, to);
            mailSender.send(message);
            log.info("E-post skickad till: {}", to);
        } catch (Exception e) {
            log.error("Fel vid skickande av e-post till: {}: {}", to, e.getMessage(), e);
            // Vi kastar inte vidare exception för att inte störa programmets flöde om e-post misslyckas
        }
    }
    
    /**
     * Skickar ett e-postmeddelande från intresse-e-postadressen
     * 
     * @param to      mottagarens e-postadress
     * @param subject ämne
     * @param text    innehåll
     */
    public void sendInterestEmail(String to, String subject, String text) {
        try {
            // För intresse-e-post behöver vi skapa en separat sender
            JavaMailSenderImpl interestMailSender = new JavaMailSenderImpl();
            
            // Grundläggande inställningar från JavaMailProperties
            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mainSender = (JavaMailSenderImpl) mailSender;
                
                // Kopiera properties men uppdatera med intresse-specifika värden
                Properties props = new Properties();
                props.putAll(mainSender.getJavaMailProperties());
                
                // Hämta mail properties från configuration
                if (mainSender.getJavaMailProperties().getProperty("mail.smtp.auth") != null) {
                    props.put("mail.smtp.auth", "true");
                }
                
                if (mainSender.getJavaMailProperties().getProperty("mail.smtp.starttls.enable") != null) {
                    props.put("mail.smtp.starttls.enable", "true");
                    props.put("mail.smtp.starttls.required", "true");
                }
                
                // Ställ in timeouts
                props.put("mail.smtp.connectiontimeout", "30000");
                props.put("mail.smtp.timeout", "30000");
                props.put("mail.smtp.writetimeout", "30000");
                
                // Ställ in debug-läge
                props.put("mail.debug", "true");
                
                // Använd samma host men specifik port för intresse
                interestMailSender.setHost(mainSender.getHost());
                interestMailSender.setPort(587); // Port 587 för SMTP
                interestMailSender.setUsername(interestEmail);
                interestMailSender.setPassword(mainSender.getPassword());
                interestMailSender.setJavaMailProperties(props);
                
                log.info("Konfigurerade intresse-mailsender på {}:{} med användarnamn {}", 
                         interestMailSender.getHost(), interestMailSender.getPort(), interestMailSender.getUsername());
            } else {
                // Fallback om huvudmailsender inte är av rätt typ
                log.warn("Huvudmailsender är inte av typen JavaMailSenderImpl, använder defaultvärden för intresse");
                interestMailSender.setHost("mailcluster.loopia.se");
                interestMailSender.setPort(587);
                interestMailSender.setUsername(interestEmail);
                
                // Skapa properties för SMTP
                Properties props = new Properties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
                props.put("mail.smtp.ssl.enable", "false");
                props.put("mail.smtp.connectiontimeout", "30000");
                props.put("mail.smtp.timeout", "30000");
                props.put("mail.smtp.writetimeout", "30000");
                props.put("mail.debug", "true");
                
                interestMailSender.setJavaMailProperties(props);
            }
            
            // Skapa meddelandet
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(interestEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            // Skicka meddelandet
            log.info("Försöker skicka intresse-e-post från {} till: {}", interestEmail, to);
            interestMailSender.send(message);
            log.info("Intresse-e-post skickad till: {}", to);
        } catch (Exception e) {
            log.error("Fel vid skickande av intresse-e-post till: {}: {}", to, e.getMessage(), e);
            // Vi kastar inte vidare exception för att inte störa programmets flöde om e-post misslyckas
        }
    }
    
    /**
     * Konfigurerar timeout-inställningar för mailSender
     */
    private void configureTimeouts() {
        try {
            // Vi behöver kasta JavaMailSender till JavaMailSenderImpl för att få tillgång till properties
            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
                Properties props = mailSenderImpl.getJavaMailProperties();
                
                // Sätt lämpliga timeout-värden för att undvika att anslutningen hänger
                // Öka tidigare timeouts från 30000 till 60000 (60 sekunder)
                props.put("mail.smtp.connectiontimeout", "60000"); // Timeout för anslutning
                props.put("mail.smtp.timeout", "60000");           // Timeout för kommandon
                props.put("mail.smtp.writetimeout", "60000");      // Timeout för skrivoperationer
                
                // Optimera SMTP-konfigurationen
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
                props.put("mail.smtp.ssl.enable", "false");
                props.put("mail.smtp.socketFactory.fallback", "true");
                props.put("mail.debug", "true");
                
                // Sätt pool-inställningar om många e-postmeddelanden ska skickas
                props.put("mail.smtp.quitwait", "false");    // Vänta inte på QUIT-svar
                props.put("mail.transport.protocol", "smtp");
                
                log.info("Konfigurerat SMTP timeoutvärden till 60 sekunder");
            }
        } catch (Exception e) {
            log.warn("Kunde inte konfigurera timeout-värden: {}", e.getMessage());
        }
    }
    
    /**
     * Skickar e-post till flera mottagare som dold kopia (BCC)
     * 
     * @param subject     ämne
     * @param content     innehåll (HTML-format stöds)
     * @param recipients  lista med e-postadresser som ska ta emot meddelandet som dold kopia
     */
    public void sendBulkEmail(String subject, String content, List<String> recipients) {
        try {
            // Konfigurera timeout-värden för att undvika att SMTP-anslutningen hänger
            configureTimeouts();
            
            log.info("Förbereder bulk-e-post med subject: {} till {} mottagare", subject, recipients.size());
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Avsändare
            helper.setFrom(fromEmail);
            
            // Vi skickar meddelandet till avsändaren själv
            helper.setTo(fromEmail);
            
            // Lägg till alla mottagare som dold kopia (BCC)
            if (recipients != null && !recipients.isEmpty()) {
                // Vi loggar endast antalet mottagare för att minska loggstorlek
                log.info("Lägger till {} e-postadresser som BCC-mottagare", recipients.size());
                
                String[] bccArray = recipients.toArray(new String[0]);
                helper.setBcc(bccArray);
            } else {
                log.warn("Inga BCC-mottagare att skicka till!");
            }
            
            helper.setSubject(subject);
            
            // Sätt innehållet som HTML för bättre formatering
            // Konvertera radbrytningar till HTML-br-taggar om innehållet inte redan är HTML
            String htmlContent = content;
            if (!content.trim().startsWith("<html") && !content.trim().startsWith("<!DOCTYPE")) {
                // Ersätt alla radbrytningar med <br> för korrekt visning i e-post
                htmlContent = content.replaceAll("\\r\\n|\\n|\\r", "<br>");
                // Omslut innehållet i HTML-struktur
                htmlContent = "<html><body>" + htmlContent + "</body></html>";
            }
            
            helper.setText(htmlContent, true);
            
            log.info("Skickar bulk-e-post...");
            mailSender.send(message);
            log.info("Bulk-e-post skickad till {} mottagare", recipients.size());
        } catch (Exception e) {
            log.error("Fel vid skickande av bulk-e-post: {}", e.getMessage(), e);
            // Logga mer detaljerad information om felet
            if (e.getCause() != null) {
                log.error("Orsakad av: {}", e.getCause().getMessage(), e.getCause());
            }
            
            // Vi vill kasta vidare exceptionen för att frontend ska få ett felmeddelande
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
} 