package com.dfrm.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.model.Key;
import com.dfrm.model.Tenant;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.KeyRepository;
import com.dfrm.repository.TenantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

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
                            
                            // Säkerställ att lägenheten har en lista med hyresgäster
                            if (apartment.getTenants() == null) {
                                apartment.setTenants(new ArrayList<>());
                            }
                            
                            // Kontrollera om hyresgästen redan finns i lägenheten (undvik dubbletter)
                            boolean alreadyExists = apartment.getTenants().stream()
                                .anyMatch(t -> t.getId().equals(tenant.getId()));
                                
                            if (!alreadyExists) {
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

    public Optional<Tenant> partialUpdate(String id, Map<String, Object> updates) {
        return tenantRepository.findById(id)
                .map(existingTenant -> {
                    // Applicera uppdateringarna till hyresgästen, men ignorera relations-fält
                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        objectMapper.registerModule(new JavaTimeModule()); // Stöd för LocalDate
                        
                        // Konvertera existerande hyresgäst till Map
                        Map<String, Object> tenantMap = objectMapper.convertValue(existingTenant, Map.class);
                        
                        // Applicera endast de fält som skickats in
                        for (Map.Entry<String, Object> entry : updates.entrySet()) {
                            // Ignorera ID-fältet och relationsfält
                            if (!entry.getKey().equals("id") && !entry.getKey().equals("apartment") && !entry.getKey().equals("key")) {
                                tenantMap.put(entry.getKey(), entry.getValue());
                            }
                        }
                        
                        // Konvertera tillbaka till Tenant-objekt med uppdaterade fält
                        Tenant updatedTenant = objectMapper.convertValue(tenantMap, Tenant.class);
                        
                        // Behåll original-ID och relationer
                        updatedTenant.setId(id);
                        updatedTenant.setApartment(existingTenant.getApartment());
                        updatedTenant.setKey(existingTenant.getKey());
                        
                        // Spara och returnera uppdaterad hyresgäst
                        return tenantRepository.save(updatedTenant);
                    } catch (Exception e) {
                        e.printStackTrace();
                        return existingTenant; // Vid fel, returnera originalet
                    }
                });
    }
} 