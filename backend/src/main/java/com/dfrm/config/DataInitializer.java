package com.dfrm.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.dfrm.model.Admin;
import com.dfrm.service.AdminService;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final AdminService adminService;

    @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            // Skapa standardadmin om den inte redan finns
            if (!adminService.existsByEmail("mikael.engvall.me@gmail.com")) {
                Admin admin = Admin.builder()
                        .email("mikael.engvall.me@gmail.com")
                        .password("Admin123!")
                        .firstName("Mikael")
                        .lastName("Engvall")
                        .role("ADMIN")
                        .active(true)
                        .build();
                
                adminService.createAdmin(admin);
                System.out.println("Standardadministratör har skapats.");
            }
        };
    }
} 