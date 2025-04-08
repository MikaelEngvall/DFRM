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
    
    // Separata konfigurationer för inkommande mail (IMAPS) - felanmälan
    @Value("${EMAIL_PORT:993}")
    private int listeningPort;
    
    @Value("${EMAIL_USER:felanmalan@duggalsfastigheter.se}")
    private String listeningUsername;
    
    @Value("${EMAIL_PASSWORD:}")
    private String listeningPassword;
    
    // Separata konfigurationer för inkommande mail (IMAPS) - intresse
    @Value("${EMAIL_PORT_INTRESSE:993}")
    private int intressePort;
    
    @Value("${EMAIL_USER_INTRESSE:intresse@duggalsfastigheter.se}")
    private String intresseUsername;
    
    @Value("${EMAIL_PASSWORD_INTRESSE:}")
    private String intressePassword;
    
    // Separata konfigurationer för utgående mail (SMTP) - intresse
    @Value("${mail.interest.host:mailcluster.loopia.se}")
    private String interestHost;
    
    @Value("${mail.interest.port:587}")
    private int interestPort;
    
    @Value("${mail.interest.username:info@duggalsfastigheter.se}")
    private String interestUsername;
    
    @Value("${mail.interest.password:}")
    private String interestPassword;
} 