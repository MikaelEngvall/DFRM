package com.dfrm.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Tenant;
import com.dfrm.service.TenantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tenants")
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
} 