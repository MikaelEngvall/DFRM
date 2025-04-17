package com.dfrm.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Interest;
import com.dfrm.model.User;
import com.dfrm.service.EmailService;
import com.dfrm.service.InterestService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;
    private final UserService userService;
    private final EmailService emailService;
    private static final Logger log = LoggerFactory.getLogger(InterestController.class);

    @GetMapping
    public List<Interest> getAllInterests(@RequestParam(required = false, defaultValue = "false") boolean includeShowings) {
        if (includeShowings) {
            log.info("Hämtar alla intresseanmälningar med visningsinformation");
            return interestService.getAllInterestsWithShowings();
        } else {
            return interestService.getAllInterests();
        }
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

    @org.springframework.web.bind.annotation.PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'SUPERADMIN', 'ADMIN') or hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Interest> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusData) {
        
        try {
            log.info("Uppdaterar status för intresse med ID: {}, data: {}", id, statusData);
            
            String status = statusData.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(null);
            }
            
            // Validera status
            if (!status.equals("NEW") && !status.equals("REVIEWED") && !status.equals("REJECTED") && 
                !status.equals("SHOWING_SCHEDULED") && !status.equals("SHOWING_CONFIRMED") && 
                !status.equals("SHOWING_COMPLETED") && !status.equals("SHOWING_CANCELLED") && 
                !status.equals("SHOWING_DECLINED")) {
                return ResponseEntity.badRequest().body(null);
            }
            
            // Hämta intresseanmälan
            Interest interest = interestService.getInterestById(id)
                .orElseThrow(() -> new IllegalArgumentException("Intresse med ID " + id + " hittades inte"));
            
            // Uppdatera status
            interest.setStatus(status);
            interest = interestService.save(interest);
            
            return ResponseEntity.ok(interest);
        } catch (Exception e) {
            log.error("Fel vid uppdatering av status: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/export-sql")
    public ResponseEntity<String> exportToSql() {
        List<Interest> interests = interestService.getAllInterests();
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- SQL export av intresseanmälningar från DFRM\n");
        sql.append("-- Genererat: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
        
        // Skapa INSERT-satser för varje intresseanmälan
        for (Interest interest : interests) {
            sql.append("INSERT INTO interests (id, hashId, name, email, phone, message, apartment, pageUrl, messageLanguage, received, status, showingDateTime, responseMessage, reviewedById, reviewedAt, reviewComments) VALUES (\n");
            sql.append("    '").append(interest.getId()).append("',\n");
            
            // Hantera hashId som kan vara null
            if (interest.getHashId() != null) {
                sql.append("    '").append(interest.getHashId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(escapeSql(interest.getName())).append("',\n");
            sql.append("    '").append(escapeSql(interest.getEmail())).append("',\n");
            sql.append("    '").append(escapeSql(interest.getPhone())).append("',\n");
            sql.append("    '").append(escapeSql(interest.getMessage())).append("',\n");
            sql.append("    '").append(escapeSql(interest.getApartment())).append("',\n");
            sql.append("    '").append(escapeSql(interest.getPageUrl())).append("',\n");
            
            // Hantera messageLanguage som kan vara null
            if (interest.getMessageLanguage() != null) {
                sql.append("    '").append(interest.getMessageLanguage()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera received datum
            if (interest.getReceived() != null) {
                sql.append("    '").append(interest.getReceived()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(interest.getStatus()).append("',\n");
            
            // Hantera showingDateTime som kan vara null
            if (interest.getShowingDateTime() != null) {
                sql.append("    '").append(interest.getShowingDateTime()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(escapeSql(interest.getResponseMessage())).append("',\n");
            
            // Hantera reviewedBy som kan vara null
            if (interest.getReviewedBy() != null) {
                sql.append("    '").append(interest.getReviewedBy().getId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera reviewedAt som kan vara null
            if (interest.getReviewedAt() != null) {
                sql.append("    '").append(interest.getReviewedAt()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(escapeSql(interest.getReviewComments())).append("'\n");
            sql.append(");\n\n");
        }
        
        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=interests_export.sql")
            .contentType(MediaType.TEXT_PLAIN)
            .body(sql.toString());
    }
    
    // Hjälpmetod för att escapa SQL-strängar
    private String escapeSql(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("'", "''");
    }
} 