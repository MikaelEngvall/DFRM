package com.dfrm.config;

import org.springframework.context.annotation.Configuration;

import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserService userService;

    /* @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            // Skapa standardanvändare om den inte redan finns
            if (!userService.existsByEmail("mikael.engvall.me@gmail.com")) {
                User user = User.builder()
                        .email("mikael.engvall.me@gmail.com")
                        .password("Admin123!")
                        .firstName("Mikael")
                        .lastName("Engvall")
                        .role("ADMIN")
                        .active(true)
                        .build();
                
                userService.createUser(user);
                System.out.println("Standardanvändare har skapats.");
            }
        };
    } */
} 