package com.dfrm.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Tenant;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.KeyRepository;
import com.dfrm.repository.TenantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final TenantRepository tenantRepository;
    private final ApartmentRepository apartmentRepository;
    private final KeyRepository keyRepository;
    
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

    public Optional<Tenant> assignApartment(String tenantId, String apartmentId) {
        return tenantRepository.findById(tenantId)
                .flatMap(tenant -> apartmentRepository.findById(apartmentId)
                        .map(apartment -> {
                            tenant.setApartment(apartment);
                            return tenantRepository.save(tenant);
                        }));
    }

    public Optional<Tenant> assignKey(String tenantId, String keyId) {
        return tenantRepository.findById(tenantId)
                .flatMap(tenant -> keyRepository.findById(keyId)
                        .map(key -> {
                            tenant.setKey(key);
                            return tenantRepository.save(tenant);
                        }));
    }

    public Optional<Tenant> removeApartment(String tenantId) {
        return tenantRepository.findById(tenantId)
                .map(tenant -> {
                    tenant.setApartment(null);
                    return tenantRepository.save(tenant);
                });
    }

    public Optional<Tenant> removeKey(String tenantId) {
        return tenantRepository.findById(tenantId)
                .map(tenant -> {
                    tenant.setKey(null);
                    return tenantRepository.save(tenant);
                });
    }
} 