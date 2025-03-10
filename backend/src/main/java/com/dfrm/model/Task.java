package com.dfrm.model;

import java.time.LocalDate;

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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    
    private String title;
    private String description;
    private LocalDate dueDate;
    private LocalDate completedDate;
    private String status; // "PENDING", "IN_PROGRESS", "COMPLETED", "APPROVED", "REJECTED"
    private String priority; // "LOW", "MEDIUM", "HIGH", "URGENT"
    private String comments;
    
    private boolean isRecurring;
    private String recurringPattern; // "DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"
    
    // Nya fält för assignedTo och assignedBy
    private String assignedToUserId;
    private String assignedByUserId;
    
    // Direkta ID-referenser för lägenhet och hyresgäst
    private String apartmentId;
    private String tenantId;
    
    // Behåller DBRef för bakåtkompatibilitet
    @DBRef
    @JsonIdentityInfo(
            generator = ObjectIdGenerators.PropertyGenerator.class,
            property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private User assignedUser;
    
    @DBRef
    @JsonIdentityInfo(
            generator = ObjectIdGenerators.PropertyGenerator.class,
            property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private Apartment apartment;
    
    @DBRef
    @JsonIdentityInfo(
            generator = ObjectIdGenerators.PropertyGenerator.class,
            property = "id"
    )
    @JsonIdentityReference(alwaysAsId = true)
    private Tenant tenant;
} 