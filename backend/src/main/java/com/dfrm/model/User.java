package com.dfrm.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String firstName;
    private String lastName;
    private String password;
    private String phoneNumber;
    private String role;
    private String preferredLanguage;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 