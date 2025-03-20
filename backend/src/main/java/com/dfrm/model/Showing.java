package com.dfrm.model;

import java.time.LocalDateTime;

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
@Document(collection = "showings")
public class Showing {
    @Id
    private String id;
    
    private String title;           // Titel för visningen som visas i kalendern
    private String description;     // Beskrivning med mer detaljer
    private LocalDateTime dateTime; // Datum och tid för visningen
    private String status;          // SCHEDULED, COMPLETED, CANCELLED
    
    // Referens till lägenheten som visas
    private String apartmentAddress; // Adress till lägenheten
    private String apartmentDetails; // Ytterligare detaljer om lägenheten
    
    // Referens till användaren som ansvarar för visningen
    @DBRef
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private User assignedTo;
    
    // Referens till den intresseanmälan som skapade visningen
    @DBRef
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private Interest relatedInterest;
    
    // Kontaktdetaljer för den som bokat visningen
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    
    // Vem som skapade visningen
    @DBRef
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private User createdBy;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String notes;           // Ytterligare anteckningar om visningen
} 