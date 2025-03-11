package com.dfrm.config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class MailConfiguration {
    
    private final Environment environment;
    
    @Value("${spring.mail.host:mailcluster.loopia.se}")
    private String host;
    
    @Value("${spring.mail.port:993}")
    private int port;
    
    @Value("${spring.mail.username:felanmalan@duggalsfastigheter.se}")
    private String username;
    
    @Value("${spring.mail.password:}")
    private String password;
    
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        // Grundläggande inställningar
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        
        // Logga konfigurationen (utan lösenord)
        log.info("Configuring JavaMailSender with host={}, port={}, username={}", 
            mailSender.getHost(), mailSender.getPort(), mailSender.getUsername());
            
        Properties props = mailSender.getJavaMailProperties();
        
        // SMTP-inställningar
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        
        // IMAPS-inställningar
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.ssl.enable", "true");
        props.put("mail.imaps.ssl.trust", "*");
        props.put("mail.imaps.ssl.protocols", "TLSv1.2 TLSv1.1 TLSv1");
        props.put("mail.imaps.connectiontimeout", "20000");
        props.put("mail.imaps.timeout", "20000");
        
        // Socket factory för SSL
        props.put("mail.imaps.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        props.put("mail.imaps.socketFactory.fallback", "false");
        props.put("mail.imaps.socketFactory.port", String.valueOf(port));
        
        // Debug för utveckling
        boolean isDev = isDevelopmentEnvironment();
        if (isDev) {
            props.put("mail.debug", "true");
            props.put("mail.imaps.ssl.checkserveridentity", "false");
            log.info("Running in development mode - mail debugging enabled");
        }
        
        return mailSender;
    }
    
    private boolean isDevelopmentEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("dev".equals(profile)) {
                return true;
            }
        }
        return false;
    }
} 