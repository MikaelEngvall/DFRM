package com.dfrm.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.Data;

@Data
@Document(collection = "apartments")
public class Apartment {
    @Id
    private String id;
    
    private String street;
    private String number;
    private String apartmentNumber;
    private String postalCode;
    private String city;
    private Integer rooms;
    private Double area;
    private Double price;
    private Boolean electricity;
    private Boolean storage;
    private Boolean internet;
    
    @DBRef
    @JsonManagedReference
    private List<Tenant> tenants;
    
    @DBRef
    @JsonManagedReference
    private List<Key> keys;
} 