package com.dfrm.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.util.List;

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
    private List<Tenant> tenants;
    
    @DBRef
    private List<Key> keys;
} 