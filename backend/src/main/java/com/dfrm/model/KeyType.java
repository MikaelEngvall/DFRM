package com.dfrm.model;

/**
 * Enumeration för nyckeltyper
 * D - Dörr
 * P - Post
 * T - Tvätt
 * F - Förråd
 * G - Garage
 * HN - Huvudnyckel
 * Ö - Övrigt
 */
public enum KeyType {
    D("Dörr"),
    P("Post"),
    T("Tvätt"),
    F("Förråd"),
    G("Garage"),
    HN("Huvudnyckel"),
    Ö("Övrigt");
    
    private final String description;
    
    KeyType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
} 