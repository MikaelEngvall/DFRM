package com.dfrm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

@Component
@Getter
public class JavaMailProperties {
    
    // Huvudkonfiguration för utgående mail (SMTP)
    @Value("${spring.mail.host}")
    private String host;
    
    @Value("${spring.mail.port}")
    private int port;
    
    @Value("${spring.mail.username}")
    private String username;
    
    @Value("${spring.mail.password}")
    private String password;
    
    @Value("${spring.mail.properties.mail.smtp.auth}")
    private boolean auth;
    
    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    private boolean starttlsEnable;
    
    // Separata konfigurationer för inkommande mail (IMAPS)
    @Value("${EMAIL_PORTListening:993}")
    private int listeningPort;
    
    @Value("${EMAIL_USERListening:felanmalan@duggalsfastigheter.se}")
    private String listeningUsername;
    
    @Value("${EMAIL_PASSWORDListening:}")
    private String listeningPassword;
} 