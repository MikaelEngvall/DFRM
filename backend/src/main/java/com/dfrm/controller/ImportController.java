package com.dfrm.controller;

import com.dfrm.service.ImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@Slf4j
public class ImportController {

    private final ImportService importService;

    @PostMapping("/tenant-apartment")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> importTenantsAndApartments(@RequestParam("filePath") String filePath) {
        log.info("Börjar importera hyresgäster och lägenheter från {}", filePath);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            importService.importTenantsAndApartments(filePath);
            response.put("success", true);
            response.put("message", "Import slutförd. Se serverloggar för detaljer.");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Fel vid import: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Fel vid import: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/upload-tenant-apartment")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<?> uploadTenantsAndApartments(@RequestParam("file") MultipartFile file) {
        log.info("Börjar importera hyresgäster och lägenheter från uppladdad fil: {}", file.getOriginalFilename());
        
        Map<String, Object> response = new HashMap<>();
        
        // Kolla att filen är en Excel-fil
        String filename = file.getOriginalFilename();
        if (filename == null || !(filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
            response.put("success", false);
            response.put("message", "Endast Excel-filer (.xlsx, .xls) är tillåtna.");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            importService.importTenantsAndApartmentsFromInputStream(file.getInputStream());
            response.put("success", true);
            response.put("message", "Import slutförd. Se serverloggar för detaljer.");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Fel vid import: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Fel vid import: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 