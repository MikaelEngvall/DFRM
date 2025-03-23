package com.dfrm.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Showing;
import com.dfrm.model.User;
import com.dfrm.service.ShowingService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/showings")
@RequiredArgsConstructor
@Slf4j
public class ShowingController {
    
    private final ShowingService showingService;
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_USER', 'SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<Showing>> getAllShowings() {
        return ResponseEntity.ok(showingService.getAllShowings());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_USER', 'SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<Showing> getShowingById(@PathVariable String id) {
        return showingService.getShowingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/calendar")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_USER', 'SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<Showing>> getShowingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(showingService.getShowingsByDateRange(startDate, endDate));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'SUPERADMIN', 'ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<Showing>> getShowingsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(showingService.getShowingsByAssignedUser(userId));
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_USER', 'SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<Showing>> getActiveShowings() {
        return ResponseEntity.ok(showingService.getActiveShowings());
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Showing> createShowing(@RequestBody Showing showing, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            showing.setCreatedBy(currentUser);
        }
        
        return ResponseEntity.ok(showingService.createShowing(showing));
    }
    
    @PostMapping("/from-interest/{interestId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Showing> createShowingFromInterest(
            @PathVariable String interestId,
            @RequestBody Map<String, Object> showingData,
            Authentication authentication) {
        
        try {
            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                return ResponseEntity.badRequest().build();
            }
            
            User currentUser = (User) authentication.getPrincipal();
            String assignedToUserId = (String) showingData.get("assignedToUserId");
            String dateTimeStr = (String) showingData.get("dateTime");
            
            // Om ingen ansvarig användare anges, använd nuvarande användare
            User assignedTo;
            if (assignedToUserId != null && !assignedToUserId.isEmpty()) {
                Optional<User> userOpt = userService.getUserById(assignedToUserId);
                if (userOpt.isEmpty()) {
                    return ResponseEntity.badRequest().build();
                }
                assignedTo = userOpt.get();
            } else {
                assignedTo = currentUser;
            }
            
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_DATE_TIME);
            
            Showing showing = showingService.createShowingFromInterest(interestId, assignedTo, dateTime);
            return ResponseEntity.ok(showing);
        } catch (Exception e) {
            log.error("Fel vid skapande av visning från intresse: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Showing> updateShowing(@PathVariable String id, @RequestBody Map<String, Object> showingData) {
        try {
            // Hämta den befintliga visningen
            Optional<Showing> existingShowingOpt = showingService.getShowingById(id);
            if (existingShowingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Showing existingShowing = existingShowingOpt.get();

            // Uppdatera fält från request
            if (showingData.get("title") != null) existingShowing.setTitle((String) showingData.get("title"));
            if (showingData.get("description") != null) existingShowing.setDescription((String) showingData.get("description"));
            if (showingData.get("dateTime") != null) {
                existingShowing.setDateTime(LocalDateTime.parse((String) showingData.get("dateTime"), 
                    DateTimeFormatter.ISO_DATE_TIME));
            }
            if (showingData.get("status") != null) existingShowing.setStatus((String) showingData.get("status"));
            if (showingData.get("apartmentAddress") != null) existingShowing.setApartmentAddress((String) showingData.get("apartmentAddress"));
            if (showingData.get("apartmentDetails") != null) existingShowing.setApartmentDetails((String) showingData.get("apartmentDetails"));
            if (showingData.get("notes") != null) existingShowing.setNotes((String) showingData.get("notes"));
            
            // Hantera assignedToUserId
            String assignedToUserId = (String) showingData.get("assignedToUserId");
            if (assignedToUserId != null) {
                Optional<User> userOpt = userService.getUserById(assignedToUserId);
                if (userOpt.isPresent()) {
                    existingShowing.setAssignedTo(userOpt.get());
                } else {
                    return ResponseEntity.badRequest().build();
                }
            }

            // Hantera kontaktinformation
            if (showingData.get("contactName") != null) existingShowing.setContactName((String) showingData.get("contactName"));
            if (showingData.get("contactEmail") != null) existingShowing.setContactEmail((String) showingData.get("contactEmail"));
            if (showingData.get("contactPhone") != null) existingShowing.setContactPhone((String) showingData.get("contactPhone"));

            // Uppdatera timestamp
            existingShowing.setUpdatedAt(LocalDateTime.now());

            Showing updatedShowing = showingService.updateShowing(id, existingShowing);
            return ResponseEntity.ok(updatedShowing);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Fel vid uppdatering av visning: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Showing> updateShowingStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        
        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Showing showing = showingService.updateShowingStatus(id, newStatus);
            return ResponseEntity.ok(showing);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Void> deleteShowing(@PathVariable String id) {
        try {
            showingService.deleteShowing(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Showing> assignShowing(
            @PathVariable String id,
            @RequestBody Map<String, String> assignData) {
        
        String userId = assignData.get("userId");
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Showing showing = showingService.assignShowingToUser(id, userId);
            return ResponseEntity.ok(showing);
        } catch (IllegalArgumentException e) {
            log.error("Fel vid tilldelning av visning: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Showing> patchShowing(@PathVariable String id, @RequestBody Map<String, Object> showingData) {
        try {
            // Hämta den befintliga visningen
            Optional<Showing> existingShowingOpt = showingService.getShowingById(id);
            if (existingShowingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Showing existingShowing = existingShowingOpt.get();

            // Uppdatera endast de fält som finns i request
            if (showingData.get("title") != null) existingShowing.setTitle((String) showingData.get("title"));
            if (showingData.get("description") != null) existingShowing.setDescription((String) showingData.get("description"));
            if (showingData.get("dateTime") != null) {
                existingShowing.setDateTime(LocalDateTime.parse((String) showingData.get("dateTime"), 
                    DateTimeFormatter.ISO_DATE_TIME));
            }
            if (showingData.get("status") != null) existingShowing.setStatus((String) showingData.get("status"));
            if (showingData.get("apartmentAddress") != null) existingShowing.setApartmentAddress((String) showingData.get("apartmentAddress"));
            if (showingData.get("apartmentDetails") != null) existingShowing.setApartmentDetails((String) showingData.get("apartmentDetails"));
            if (showingData.get("notes") != null) existingShowing.setNotes((String) showingData.get("notes"));
            
            // Hantera assignedToUserId
            String assignedToUserId = (String) showingData.get("assignedToUserId");
            if (assignedToUserId != null) {
                Optional<User> userOpt = userService.getUserById(assignedToUserId);
                userOpt.ifPresent(existingShowing::setAssignedTo);
            }

            // Hantera kontaktinformation
            if (showingData.get("contactName") != null) existingShowing.setContactName((String) showingData.get("contactName"));
            if (showingData.get("contactEmail") != null) existingShowing.setContactEmail((String) showingData.get("contactEmail"));
            if (showingData.get("contactPhone") != null) existingShowing.setContactPhone((String) showingData.get("contactPhone"));

            // Uppdatera timestamp
            existingShowing.setUpdatedAt(LocalDateTime.now());

            Showing updatedShowing = showingService.updateShowing(id, existingShowing);
            return ResponseEntity.ok(updatedShowing);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Fel vid uppdatering av visning: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
} 