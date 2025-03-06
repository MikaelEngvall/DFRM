package com.dfrm.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.Data;

@Data
@Document(collection = "keys")
public class Key {
    @Id
    private String id;
    private String keyNumber;
    private String type;
    private String description;
    private Boolean isAvailable;
    
    @DBRef
    @JsonBackReference
    private Apartment apartment;
    
    @DBRef
    @JsonBackReference
    private Tenant tenant;
} 