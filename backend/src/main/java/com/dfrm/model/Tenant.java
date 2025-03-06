package com.dfrm.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDate;

@Data
@Document(collection = "tenants")
public class Tenant {
    @Id
    private String id;
    
    private String firstName;
    private String lastName;
    private String personnummer;
    private String phoneNumber;
    private String street;
    private String postalCode;
    private String city;
    private LocalDate movedInDate;
    private LocalDate resiliationDate;
    private String comment;
    
    @DBRef
    private Apartment apartment;
    
    @DBRef
    private Key key;
} 