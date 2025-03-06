package com.dfrm.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.model.Key;
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
        tenantRepository.findById(id).ifPresent(tenant -> {
            // Ta bort hyresgästen från lägenheten om den finns
            if (tenant.getApartment() != null) {
                Apartment apartment = tenant.getApartment();
                apartment.getTenants().remove(tenant);
                apartmentRepository.save(apartment);
            }
            
            // Ta bort hyresgästens referens från nyckeln om den finns
            if (tenant.getKey() != null) {
                Key key = tenant.getKey();
                key.setTenant(null);
                keyRepository.save(key);
            }
            
            tenantRepository.deleteById(id);
        });
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
                            // Ta bort hyresgästen från tidigare lägenhet om den finns
                            if (tenant.getApartment() != null) {
                                Apartment oldApartment = tenant.getApartment();
                                oldApartment.getTenants().remove(tenant);
                                apartmentRepository.save(oldApartment);
                            }

                            // Lägg till hyresgästen i den nya lägenheten
                            tenant.setApartment(apartment);
                            if (apartment.getTenants() == null) {
                                apartment.setTenants(new ArrayList<>());
                            }
                            if (!apartment.getTenants().contains(tenant)) {
                                apartment.getTenants().add(tenant);
                            }

                            apartmentRepository.save(apartment);
                            return tenantRepository.save(tenant);
                        }));
    }

    public Optional<Tenant> assignKey(String tenantId, String keyId) {
        return tenantRepository.findById(tenantId)
                .flatMap(tenant -> keyRepository.findById(keyId)
                        .map(key -> {
                            // Ta bort nyckeln från tidigare hyresgäst om den finns
                            if (key.getTenant() != null) {
                                Tenant oldTenant = key.getTenant();
                                oldTenant.setKey(null);
                                tenantRepository.save(oldTenant);
                            }

                            // Tilldela nyckeln till den nya hyresgästen
                            tenant.setKey(key);
                            key.setTenant(tenant);

                            keyRepository.save(key);
                            return tenantRepository.save(tenant);
                        }));
    }

    public Optional<Tenant> removeApartment(String tenantId) {
        return tenantRepository.findById(tenantId)
                .map(tenant -> {
                    if (tenant.getApartment() != null) {
                        Apartment apartment = tenant.getApartment();
                        apartment.getTenants().remove(tenant);
                        apartmentRepository.save(apartment);
                    }
                    tenant.setApartment(null);
                    return tenantRepository.save(tenant);
                });
    }

    public Optional<Tenant> removeKey(String tenantId) {
        return tenantRepository.findById(tenantId)
                .map(tenant -> {
                    if (tenant.getKey() != null) {
                        Key key = tenant.getKey();
                        key.setTenant(null);
                        keyRepository.save(key);
                    }
                    tenant.setKey(null);
                    return tenantRepository.save(tenant);
                });
    }
} 