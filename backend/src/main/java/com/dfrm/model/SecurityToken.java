package com.dfrm.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "security_tokens")
public class SecurityToken {
    
    public enum TokenType {
        PASSWORD_RESET,
        EMAIL_CHANGE
    }
    
    @Id
    private String id;
    
    private String token;
    
    @DBRef
    private User user;
    
    private TokenType tokenType;
    
    private String newEmail; // används endast för TOKEN_TYPE.EMAIL_CHANGE
    
    private LocalDateTime expiryDate;
    
    private boolean used;
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
} 