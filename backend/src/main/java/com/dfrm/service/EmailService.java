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
            
            log.info("Försöker skicka e-post till: {}", to);
            mailSender.send(message);
            log.info("E-post skickad till: {}", to);
        } catch (Exception e) {
            log.error("Fel vid skickande av e-post till: {}", to, e);
            // Vi kastar inte vidare exception för att inte störa programmets flöde om e-post misslyckas
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
            
            log.info("Förbereder bulk-e-post med subject: {}", subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Avsändare
            helper.setFrom(fromEmail);
            log.info("Avsändare: {}", fromEmail);
            
            // Vi skickar meddelandet till avsändaren själv
            helper.setTo(fromEmail);
            log.info("Primär mottagare: {}", fromEmail);
            
            // Lägg till alla mottagare som dold kopia (BCC)
            if (recipients != null && !recipients.isEmpty()) {
                // Logga detaljerad information om BCC-mottagarna
                log.info("Lägger till följande e-postadresser som BCC-mottagare:");
                for (int i = 0; i < recipients.size(); i++) {
                    log.info("  [{}] {}", i+1, recipients.get(i));
                }
                
                String[] bccArray = recipients.toArray(new String[0]);
                helper.setBcc(bccArray);
                
                // Logga det faktiska BCC-arrayen som används
                log.info("BCC-array längd: {}", bccArray.length);
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
                log.info("Konverterade text med radbrytningar till HTML-format");
            }
            
            helper.setText(htmlContent, true);
            
            log.info("Försöker skicka bulk-e-post...");
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
    
    /**
     * Konfigurerar timeout-inställningar för mailSender
     */
    private void configureTimeouts() {
        try {
            // Vi behöver kasta JavaMailSender till JavaMailSenderImpl för att få tillgång till properties
            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
                Properties props = mailSenderImpl.getJavaMailProperties();
                
                // Sätt längre timeout-värden (30 sekunder)
                props.put("mail.smtp.connectiontimeout", "30000");
                props.put("mail.smtp.timeout", "30000");
                props.put("mail.smtp.writetimeout", "30000");
                
                // Sätt också för IMAPS
                props.put("mail.imaps.connectiontimeout", "30000");
                props.put("mail.imaps.timeout", "30000");
                
                // Säkerställ att STARTTLS är korrekt konfigurerat för SMTP (port 587)
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
                props.put("mail.smtp.ssl.enable", "false");
                
                // Debug-läge för att få mer information
                props.put("mail.debug", "true");
                
                // Logga alla konfigurerade egenskaper
                log.info("Mail configuration för host {}:{}, protocol: {}", 
                    mailSenderImpl.getHost(), mailSenderImpl.getPort(), 
                    props.getProperty("mail.transport.protocol", "smtp"));
                log.info("SMTP STARTTLS enabled: {}, required: {}, Auth: {}", 
                    props.getProperty("mail.smtp.starttls.enable", "false"),
                    props.getProperty("mail.smtp.starttls.required", "false"),
                    props.getProperty("mail.smtp.auth", "false"));
                
                log.info("Konfigurerade timeouts för mailSender: {} ({}ms)", 
                    mailSenderImpl.getHost(), props.getProperty("mail.smtp.timeout", "5000"));
            } else {
                log.warn("Kunde inte konfigurera timeouts: mailSender är inte av typen JavaMailSenderImpl");
            }
        } catch (Exception e) {
            log.warn("Kunde inte konfigurera timeouts för mailSender: {}", e.getMessage());
        }
    }
} 