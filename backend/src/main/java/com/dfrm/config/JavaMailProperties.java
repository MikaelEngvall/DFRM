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
    @Value("${EMAIL_PORT_LISTENING:993}")
    private int listeningPort;
    
    @Value("${EMAIL_USER_LISTENING:felanmalan@duggalsfastigheter.se}")
    private String listeningUsername;
    
    @Value("${EMAIL_PASSWORD_LISTENING:}")
    private String listeningPassword;
} 