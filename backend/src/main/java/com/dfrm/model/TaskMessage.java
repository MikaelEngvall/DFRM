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

/**
 * Modell för meddelanden i en uppgift.
 * Stödjer översättningar av meddelandeinnehåll.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "task_messages")
public class TaskMessage {
    @Id
    private String id;
    
    // Referens till uppgiften som meddelandet tillhör
    private String taskId;
    
    // Användaren som skickade meddelandet
    @DBRef
    @JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private User sender;
    
    // Meddelandets innehåll
    private String content;
    
    // Tidpunkt när meddelandet skickades
    private LocalDateTime timestamp;
    
    // Språket som meddelandet skrevs på
    private Language language;
    
    // Översättningar av meddelandet till andra språk
    private Map<String, String> translations;
} 