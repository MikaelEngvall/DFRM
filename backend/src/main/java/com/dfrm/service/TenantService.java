package com.dfrm.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Tenant;
import com.dfrm.repository.TenantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final TenantRepository tenantRepository;
    
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }
    
    public Optional<Tenant> getTenantById(String id) {
        return tenantRepository.findById(id);
    }
    
    public Optional<Tenant> getTenantByPersonnummer(String personnummer) {
        return tenantRepository.findByPersonnummer(personnummer);
    }
    
    public Tenant saveTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }
    
    public void deleteTenant(String id) {
        tenantRepository.deleteById(id);
    }
    
    public List<Tenant> findByLastName(String lastName) {
        return tenantRepository.findByLastName(lastName);
    }
    
    public List<Tenant> findByMovedInDateBetween(LocalDate startDate, LocalDate endDate) {
        return tenantRepository.findByMovedInDateBetween(startDate, endDate);
    }
    
    public List<Tenant> findTenantsWithResiliated() {
        return tenantRepository.findByResiliationDateIsNotNull();
    }
} 