package com.dfrm.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.User;
import com.dfrm.repository.UserRepository;
import com.dfrm.service.JwtService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "E-postadressen är redan registrerad"));
        }

        // Sätt standardvärden
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        
        // Hasha lösenordet
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", savedUser.getId(),
            "email", savedUser.getEmail(),
            "firstName", savedUser.getFirstName(),
            "lastName", savedUser.getLastName(),
            "role", savedUser.getRole(),
            "preferredLanguage", savedUser.getPreferredLanguage()
        ));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Fel användarnamn eller lösenord"));
            }
            
            User user = userOpt.get();
            
            // Uppdatera senaste inloggningstid
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            
            String token = jwtService.generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            
            // Använd HashMap istället för Map.of för att kunna lägga till fler fält
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("role", user.getRole());
            userMap.put("preferredLanguage", user.getPreferredLanguage());
            userMap.put("lastLoginAt", user.getLastLoginAt());
            
            response.put("user", userMap);
            
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Fel användarnamn eller lösenord"));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        User user = userOpt.get();
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("role", user.getRole());
        userMap.put("lastLoginAt", user.getLastLoginAt());
        userMap.put("preferredLanguage", user.getPreferredLanguage());
        
        return ResponseEntity.ok(userMap);
    }
} 