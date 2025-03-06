package com.dfrm.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonBackReference;

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
    private LocalDate resiliated;
    private String comment;
    
    @DBRef
    @JsonBackReference
    private Apartment apartment;
    
    @DBRef
    @JsonBackReference
    private Key key;
} 