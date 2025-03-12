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
@Document(collection = "pending_tasks")
public class PendingTask {
    @Id
    private String id;
    
    @DBRef
    private Task task;
    
    @DBRef
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private User requestedBy;
    
    private LocalDateTime requestedAt;
    private String requestComments;
    
    @DBRef
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private User reviewedBy;
    
    private LocalDateTime reviewedAt;
    private String reviewComments;
    
    // Nya fält för felanmälningar via e-post
    private String name;
    private String email;
    private String phone;
    private String address;
    private String apartment;
    private String description;
    private Language descriptionLanguage;
    private Map<Language, String> descriptionTranslations;
    private String status; // NEW, REVIEWED, CONVERTED, REJECTED
    private LocalDateTime received;
    private String subject; // Ämne för e-postrapport
} 