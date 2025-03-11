package com.dfrm.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Language {
    SV("sv", "Svenska"),
    EN("en", "English"),
    PL("pl", "Polski"),
    UK("uk", "Українська");
    
    private final String code;
    private final String displayName;
} 