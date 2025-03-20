package com.dfrm.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Interest;
import com.dfrm.model.User;
import com.dfrm.service.InterestService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;
    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(InterestController.class);

    @GetMapping
    public List<Interest> getAllInterests() {
        return interestService.getAllInterests();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interest> getInterestById(@PathVariable String id) {
        return interestService.getInterestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/for-review")
    public List<Interest> getInterestsForReview() {
        return interestService.findInterestsForReview();
    }

    @GetMapping("/reviewed")
    public ResponseEntity<List<Interest>> getReviewedInterests() {
        return ResponseEntity.ok(interestService.findReviewedInterests());
    }
    
    @PostMapping("/{id}/review")
    public ResponseEntity<Interest> reviewInterest(
            @PathVariable String id,
            @RequestBody Map<String, String> reviewData) {
        
        String reviewedById = reviewData.get("reviewedById");
        String comment = reviewData.get("comment");
        
        if (reviewedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Ogiltig användar-ID"));
            
            Interest interest = interestService.reviewInterest(id, reviewedBy, comment);
            return ResponseEntity.ok(interest);
        } catch (IllegalArgumentException e) {
            log.error("Fel vid granskning av intresse: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<Interest> rejectInterest(
            @PathVariable String id,
            @RequestBody Map<String, String> rejectData) {
        
        String reviewedById = rejectData.get("reviewedById");
        String comment = rejectData.get("comment");
        
        if (reviewedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Ogiltig användar-ID"));
            
            Interest interest = interestService.rejectInterest(id, reviewedBy, comment);
            return ResponseEntity.ok(interest);
        } catch (IllegalArgumentException e) {
            log.error("Fel vid avvisning av intresse: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/schedule-showing")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'SUPERADMIN', 'ADMIN') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Interest> scheduleShowing(
            @PathVariable String id,
            @RequestBody Map<String, Object> showingData) {
        
        try {
            log.info("Schemalägger visning för intresse ID: {}, data: {}", id, showingData);
            
            // Hämta aktuell authentication för debugging
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                log.info("Authenticated user: {}, authorities: {}", 
                    authentication.getName(),
                    authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(", ")));
            } else {
                log.warn("No authentication found in security context");
            }
            
            Interest interest = interestService.scheduleShowing(id, showingData);
            return ResponseEntity.ok(interest);
        } catch (IllegalArgumentException e) {
            log.error("Fel vid schemaläggning av visning: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Oväntat fel vid schemaläggning av visning: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterest(@PathVariable String id) {
        return interestService.getInterestById(id)
                .map(interest -> {
                    interestService.deleteInterest(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/unreview-count")
    public ResponseEntity<Long> getUnreviewedCount() {
        long count = interestService.countByStatus("NEW");
        return ResponseEntity.ok(count);
    }
    
    @PostMapping("/check-emails")
    public ResponseEntity<String> checkEmails() {
        try {
            interestService.checkEmails();
            return ResponseEntity.ok("E-postläsning av intresseanmälningar har utförts");
        } catch (Exception e) {
            log.error("Fel vid manuell läsning av intresse-e-post: {}", e.getMessage());
            return ResponseEntity.status(500).body("Fel vid läsning av e-post: " + e.getMessage());
        }
    }

    @GetMapping("/debug/auth")
    public ResponseEntity<Map<String, Object>> debugAuth() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            debugInfo.put("authenticated", authentication.isAuthenticated());
            debugInfo.put("principal", authentication.getPrincipal().toString());
            debugInfo.put("principal_class", authentication.getPrincipal().getClass().getName());
            debugInfo.put("name", authentication.getName());
            
            // Visa användarbehörigheter
            List<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
            debugInfo.put("authorities", authorities);
            
            // Visa om användaren har specifika roller
            debugInfo.put("has_role_superadmin", authorities.contains("ROLE_SUPERADMIN"));
            debugInfo.put("has_superadmin", authorities.contains("SUPERADMIN"));
            debugInfo.put("has_role_admin", authorities.contains("ROLE_ADMIN"));
            debugInfo.put("has_admin", authorities.contains("ADMIN"));
            
            debugInfo.put("details", authentication.getDetails() != null ? authentication.getDetails().toString() : null);
            
            // Testa direkt mot endpointen som kräver behörighet
            boolean canScheduleShowing = 
                authorities.contains("ROLE_SUPERADMIN") || 
                authorities.contains("SUPERADMIN") || 
                authorities.contains("ROLE_ADMIN") || 
                authorities.contains("ADMIN");
            debugInfo.put("can_schedule_showing", canScheduleShowing);
            
            // Om user är en instans av UserDetails, visa extra info
            if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                debugInfo.put("username", userDetails.getUsername());
                debugInfo.put("user_authorities", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
                debugInfo.put("account_non_expired", userDetails.isAccountNonExpired());
                debugInfo.put("account_non_locked", userDetails.isAccountNonLocked());
                debugInfo.put("credentials_non_expired", userDetails.isCredentialsNonExpired());
                debugInfo.put("enabled", userDetails.isEnabled());
            }
        } else {
            debugInfo.put("authenticated", false);
            debugInfo.put("error", "No authentication found in security context");
        }
        
        return ResponseEntity.ok(debugInfo);
    }

    @GetMapping("/debug/token")
    public ResponseEntity<Map<String, Object>> debugToken() {
        Map<String, Object> tokenInfo = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                // Hämta Authorization header från request
                String authHeader = org.springframework.web.context.request.RequestContextHolder
                    .currentRequestAttributes()
                    .getAttribute("org.springframework.web.servlet.HandlerMapping.pathWithinHandlerMapping", 
                        org.springframework.web.context.request.RequestAttributes.SCOPE_REQUEST)
                    .toString();
                
                // Logga header information
                jakarta.servlet.http.HttpServletRequest request = 
                    ((org.springframework.web.context.request.ServletRequestAttributes) 
                    org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest();
                
                String authorizationHeader = request.getHeader("Authorization");
                
                if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                    String token = authorizationHeader.substring(7);
                    tokenInfo.put("raw_token", token);
                    
                    // Försök tolka token
                    try {
                        String[] chunks = token.split("\\.");
                        if (chunks.length >= 2) {
                            String payload = new String(java.util.Base64.getDecoder().decode(chunks[1]), "UTF-8");
                            tokenInfo.put("decoded_payload", payload);
                            
                            // Tolka JSON payload
                            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                            Map<String, Object> payloadMap = mapper.readValue(payload, Map.class);
                            tokenInfo.put("parsed_payload", payloadMap);
                            
                            // Extrahera specifika fält
                            tokenInfo.put("subject", payloadMap.get("sub"));
                            tokenInfo.put("role", payloadMap.get("role"));
                            tokenInfo.put("userId", payloadMap.get("userId"));
                            tokenInfo.put("exp", payloadMap.get("exp"));
                        }
                    } catch (Exception e) {
                        tokenInfo.put("decode_error", e.getMessage());
                    }
                } else {
                    tokenInfo.put("error", "No Authorization header found or not starting with 'Bearer '");
                }
            } else {
                tokenInfo.put("error", "No authentication found in security context");
            }
        } catch (Exception e) {
            tokenInfo.put("error", "Exception: " + e.getMessage());
            tokenInfo.put("stack_trace", e.getStackTrace());
        }
        
        return ResponseEntity.ok(tokenInfo);
    }
} 