package com.dfrm.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Tenant;
import com.dfrm.service.TenantService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {
    private final TenantService tenantService;
    
    @GetMapping
    public List<Tenant> getAllTenants() {
        return tenantService.getAllTenants();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable String id) {
        return tenantService.getTenantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/personnummer/{personnummer}")
    public ResponseEntity<Tenant> getTenantByPersonnummer(@PathVariable String personnummer) {
        return tenantService.getTenantByPersonnummer(personnummer)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Tenant createTenant(@RequestBody Tenant tenant) {
        return tenantService.saveTenant(tenant);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable String id, @RequestBody Tenant tenant) {
        return tenantService.getTenantById(id)
                .map(existingTenant -> {
                    tenant.setId(id);
                    return ResponseEntity.ok(tenantService.saveTenant(tenant));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/apartment")
    public ResponseEntity<Tenant> assignApartment(
            @PathVariable String id,
            @RequestParam String apartmentId) {
        return tenantService.assignApartment(id, apartmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/key")
    public ResponseEntity<Tenant> assignKey(
            @PathVariable String id,
            @RequestParam String keyId) {
        return tenantService.assignKey(id, keyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}/apartment")
    public ResponseEntity<Tenant> removeApartment(@PathVariable String id) {
        return tenantService.removeApartment(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}/key")
    public ResponseEntity<Tenant> removeKey(@PathVariable String id) {
        return tenantService.removeKey(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable String id) {
        if (tenantService.getTenantById(id).isPresent()) {
            tenantService.deleteTenant(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/search/lastname/{lastName}")
    public List<Tenant> findByLastName(@PathVariable String lastName) {
        return tenantService.findByLastName(lastName);
    }
    
    @GetMapping("/search/movedin")
    public List<Tenant> findByMovedInDateBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return tenantService.findByMovedInDateBetween(startDate, endDate);
    }
    
    @GetMapping("/search/resiliated")
    public List<Tenant> findTenantsWithResiliated() {
        return tenantService.findTenantsWithResiliated();
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Tenant> partialUpdateTenant(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return tenantService.getTenantById(id)
                .map(existingTenant -> {
                    try {
                        // Vi gör en partiell uppdatering genom att endast uppdatera angivna fält
                        ObjectMapper objectMapper = new ObjectMapper();
                        objectMapper.registerModule(new JavaTimeModule()); // Stöd för LocalDate
                        
                        // Konvertera existerande hyresgäst till Map
                        Map<String, Object> tenantMap = objectMapper.convertValue(existingTenant, Map.class);
                        
                        // Applicera endast de fält som skickats in
                        for (Map.Entry<String, Object> entry : updates.entrySet()) {
                            // Ignorera ID-fältet och relationsfält (kan inte uppdateras direkt)
                            if (!entry.getKey().equals("id") && !entry.getKey().equals("apartment") && !entry.getKey().equals("key")) {
                                tenantMap.put(entry.getKey(), entry.getValue());
                            }
                        }
                        
                        // Konvertera tillbaka till Tenant-objekt med uppdaterade fält
                        Tenant updatedTenant = objectMapper.convertValue(tenantMap, Tenant.class);
                        
                        // Behåll original-ID
                        updatedTenant.setId(id);
                        
                        // Behåll originalrelationer
                        updatedTenant.setApartment(existingTenant.getApartment());
                        updatedTenant.setKey(existingTenant.getKey());
                        
                        // Spara och returnera uppdaterad hyresgäst
                        Tenant savedTenant = tenantService.saveTenant(updatedTenant);
                        return ResponseEntity.ok(savedTenant);
                    } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 