package com.dfrm.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Admin;
import com.dfrm.repository.AdminRepository;
import com.dfrm.service.JwtService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AdminRepository adminRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AdminRepository adminRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        credentials.get("email"),
                        credentials.get("password")
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails.getUsername());

        Admin admin = adminRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Användare hittades inte"));

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", admin);

        return ResponseEntity.ok(response);
    }
} 