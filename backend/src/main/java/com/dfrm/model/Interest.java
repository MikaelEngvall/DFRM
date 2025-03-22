package com.dfrm.model;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interests")
public class Interest {
    @Id
    private String id;
    
    private String name;
    private String email;
    private String phone;
    private String message;
    private String apartment; // Lägenhetsinformation baserat på ämnet i e-postmeddelandet
    private String pageUrl;   // URL för lägenheten från meddelandet
    
    private Language messageLanguage;
    private Map<Language, String> messageTranslations;
    
    private LocalDateTime received;
    private String status; // NEW, REVIEWED, REJECTED, SHOWING_SCHEDULED
    
    // Nya fält för visningstider
    private LocalDateTime showingDateTime;
    private String responseMessage;
    
    @DBRef
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private User reviewedBy;
    
    private LocalDateTime reviewedAt;
    private String reviewComments;
    
    // Referens till uppgiften som skapas för visningen (nu optional)
    @DBRef
    private Task relatedTask;
} 