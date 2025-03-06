package com.dfrm.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Data
@Document(collection = "keys")
public class Key {
    @Id
    private String id;
    
    private String type;
    private String serie;
    private String number;
    
    @DBRef
    private Apartment apartment;
    
    @DBRef
    private Tenant tenant;
} 