package com.dfrm.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.User;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        // Användare kan hämta sin egen information
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName(); // Detta är e-postadressen
        
        Optional<User> targetUser = userService.getUserById(id);
        if (targetUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Om det inte är den egna profilen och användaren inte är ADMIN/SUPERADMIN
        if (!targetUser.get().getEmail().equals(currentUsername) && 
            !auth.getAuthorities().stream().anyMatch(a -> 
                a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPERADMIN"))) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        return ResponseEntity.ok(targetUser.get());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // Kontrollera att ADMIN inte skapar SUPERADMIN
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSuperAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN"));
            
        // Om ADMIN försöker skapa SUPERADMIN
        if (isAdmin && !isSuperAdmin && "SUPERADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du har inte behörighet att skapa SUPERADMIN-användare"));
        }
        
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) {
        Optional<User> existingUserOpt = userService.getUserById(id);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User existingUser = existingUserOpt.get();
        
        // Kontrollera behörigheter
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSuperAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN"));
        
        // Användare kan bara uppdatera sig själva
        boolean isOwnProfile = existingUser.getEmail().equals(currentUsername);
        
        // Om det inte är egen profil och användaren inte är ADMIN/SUPERADMIN
        if (!isOwnProfile && !isAdmin && !isSuperAdmin) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du har inte behörighet att uppdatera andra användare"));
        }
        
        // ADMIN kan inte uppdatera SUPERADMIN
        if (isAdmin && !isSuperAdmin && "SUPERADMIN".equals(existingUser.getRole())) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du har inte behörighet att uppdatera SUPERADMIN-användare"));
        }
        
        // Vanliga användare kan inte ändra sin egen roll
        if (isOwnProfile && !isAdmin && !isSuperAdmin && 
            !existingUser.getRole().equals(user.getRole())) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du har inte behörighet att ändra din roll"));
        }
        
        // Behåll befintligt lösenord om inget nytt anges
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword(existingUser.getPassword());
        }
        
        user.setId(id);
        return ResponseEntity.ok(userService.updateUser(user));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patchUser(@PathVariable String id, @RequestBody User patchUser) {
        Optional<User> existingUserOpt = userService.getUserById(id);
        if (existingUserOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User existingUser = existingUserOpt.get();
        
        // Kontrollera behörigheter
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSuperAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN"));
        
        // Användare kan bara uppdatera sig själva
        boolean isOwnProfile = existingUser.getEmail().equals(currentUsername);
        
        // Om det inte är egen profil och användaren inte är ADMIN/SUPERADMIN
        if (!isOwnProfile && !isAdmin && !isSuperAdmin) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du har inte behörighet att uppdatera andra användare"));
        }
        
        // ADMIN kan inte uppdatera SUPERADMIN
        if (isAdmin && !isSuperAdmin && "SUPERADMIN".equals(existingUser.getRole())) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du har inte behörighet att uppdatera SUPERADMIN-användare"));
        }
        
        // Uppdatera endast fält som inte är null i patchUser
        if (patchUser.getEmail() != null) {
            existingUser.setEmail(patchUser.getEmail());
        }
        if (patchUser.getFirstName() != null) {
            existingUser.setFirstName(patchUser.getFirstName());
        }
        if (patchUser.getLastName() != null) {
            existingUser.setLastName(patchUser.getLastName());
        }
        if (patchUser.getPassword() != null && !patchUser.getPassword().isEmpty()) {
            existingUser.setPassword(patchUser.getPassword());
        }
        if (patchUser.getRole() != null) {
            // Vanliga användare kan inte ändra sin egen roll
            if (isOwnProfile && !isAdmin && !isSuperAdmin && 
                !existingUser.getRole().equals(patchUser.getRole())) {
                return ResponseEntity.status(403)
                    .body(Map.of("message", "Du har inte behörighet att ändra din roll"));
            }
            existingUser.setRole(patchUser.getRole());
        }
        
        return ResponseEntity.ok(userService.updateUser(existingUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        Optional<User> userToDeleteOpt = userService.getUserById(id);
        if (userToDeleteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User userToDelete = userToDeleteOpt.get();
        
        // Kontrollera behörigheter
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSuperAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN"));
        
        // Kontrollera om användaren försöker radera sig själv
        boolean isDeletingSelf = userToDelete.getEmail().equals(currentUsername);
        if (isDeletingSelf) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du kan inte radera ditt eget konto"));
        }
        
        // ADMIN kan inte radera SUPERADMIN
        if (isAdmin && !isSuperAdmin && "SUPERADMIN".equals(userToDelete.getRole())) {
            return ResponseEntity.status(403)
                .body(Map.of("message", "Du har inte behörighet att radera SUPERADMIN-användare"));
        }
        
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/password")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Void> updatePassword(@PathVariable String id, @RequestBody Map<String, String> passwordData) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        String newPassword = passwordData.get("password");
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = userOpt.get();
        user.setPassword(newPassword);
        userService.updateUser(user);
        
        return ResponseEntity.ok().build();
    }
} 