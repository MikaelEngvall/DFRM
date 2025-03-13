package com.dfrm.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Avsändare
            helper.setFrom(fromEmail);
            
            // Vi skickar meddelandet till avsändaren själv
            helper.setTo(fromEmail);
            
            // Lägg till alla mottagare som dold kopia (BCC)
            if (recipients != null && !recipients.isEmpty()) {
                String[] bccArray = recipients.toArray(new String[0]);
                helper.setBcc(bccArray);
            }
            
            helper.setSubject(subject);
            
            // Sätt innehållet som HTML för bättre formatering
            helper.setText(content, true);
            
            mailSender.send(message);
            log.info("Bulk-e-post skickad till {} mottagare", recipients.size());
        } catch (Exception e) {
            log.error("Fel vid skickande av bulk-e-post", e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
} 