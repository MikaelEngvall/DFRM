package com.dfrm.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.Data;

@Data
@Document(collection = "tenants")
public class Tenant {
    @Id
    private String id;
    
    private String firstName;
    private String lastName;
    private String personnummer;
    private String email;
    private String phone;
    private String street;
    private String postalCode;
    private String city;
    private LocalDate movedInDate;
    private LocalDate resiliationDate;
    private String comment;
    
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
    private Key key;
} 