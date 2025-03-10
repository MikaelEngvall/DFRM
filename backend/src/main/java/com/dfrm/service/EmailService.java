package com.dfrm.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
} 