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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final TenantRepository tenantRepository;
    private final ApartmentRepository apartmentRepository;
    private final KeyRepository keyRepository;
    
    private static final Logger log = LoggerFactory.getLogger(TenantService.class);
    
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
            
            // Ta bort hyresgästens referens från alla nycklar om de finns
            if (tenant.getKeys() != null && !tenant.getKeys().isEmpty()) {
                for (Key key : new ArrayList<>(tenant.getKeys())) {
                    key.setTenant(null);
                    keyRepository.save(key);
                }
                tenant.getKeys().clear();
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
                            
                            // Ta först bort hyresgästen om den redan finns (för att undvika dubbletter)
                            apartment.getTenants().removeIf(t -> t.getId().equals(tenant.getId()));
                            
                            // Lägg till hyresgästen i lägenheten
                            apartment.getTenants().add(tenant);

                            // Spara först lägenheten för att uppdatera dess hyresgästlista
                            apartmentRepository.save(apartment);
                            
                            // Spara och returnera den uppdaterade hyresgästen
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
                                // Säkerställ att nyckelreferensen tas bort från gamla hyresgästens lista
                                if (oldTenant.getKeys() != null) {
                                    oldTenant.getKeys().removeIf(k -> k.getId().equals(key.getId()));
                                    tenantRepository.save(oldTenant);
                                }
                            }

                            // Tilldela nyckeln till den nya hyresgästen
                            // Initiera keys-listan om den är null
                            if (tenant.getKeys() == null) {
                                tenant.setKeys(new ArrayList<>());
                            }
                            
                            // Lägg bara till nyckeln om den inte redan finns i listan
                            if (tenant.getKeys().stream().noneMatch(k -> k.getId().equals(key.getId()))) {
                                tenant.getKeys().add(key);
                            }
                            
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

    public Optional<Tenant> removeKey(String tenantId, String keyId) {
        return tenantRepository.findById(tenantId)
                .flatMap(tenant -> keyRepository.findById(keyId)
                        .map(key -> {
                            // Ta bort nyckeln från hyresgästens lista
                            if (tenant.getKeys() != null) {
                                tenant.getKeys().removeIf(k -> k.getId().equals(key.getId()));
                            }
                            
                            // Återställ tenant-referensen i nyckeln
                            if (key.getTenant() != null && key.getTenant().getId().equals(tenant.getId())) {
                                key.setTenant(null);
                                keyRepository.save(key);
                            }
                            
                            return tenantRepository.save(tenant);
                        }));
    }

    public Optional<Tenant> removeAllKeys(String tenantId) {
        return tenantRepository.findById(tenantId)
                .map(tenant -> {
                    if (tenant.getKeys() != null && !tenant.getKeys().isEmpty()) {
                        // Ta bort tenant-referensen från alla nycklar
                        for (Key key : tenant.getKeys()) {
                            key.setTenant(null);
                            keyRepository.save(key);
                        }
                        // Rensa nyckel-listan
                        tenant.getKeys().clear();
                    }
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
                        
                        // Applicera uppdateringarna - men hoppa över specifika fält
                        updates.forEach((key, value) -> {
                            // Hoppa över relations-fält och fält som inte finns i modellen
                            if (!key.equals("apartment") && !key.equals("keys") && 
                                !key.equals("id") && !key.equals("_id") && 
                                // Hoppa över adressfält som inte längre finns i modellen
                                !key.equals("street") && !key.equals("postalCode") && !key.equals("city") && 
                                tenantMap.containsKey(key)) {
                                tenantMap.put(key, value);
                            }
                        });
                        
                        // Konvertera tillbaka till Tenant-objekt men behåll relationer
                        Tenant updatedTenant = objectMapper.convertValue(tenantMap, Tenant.class);
                        updatedTenant.setId(existingTenant.getId());
                        updatedTenant.setApartment(existingTenant.getApartment());
                        updatedTenant.setKeys(existingTenant.getKeys());
                        
                        return tenantRepository.save(updatedTenant);
                    } catch (Exception e) {
                        log.error("Fel vid uppdatering av hyresgäst: {}", e.getMessage());
                        throw new RuntimeException("Fel vid uppdatering av hyresgäst", e);
                    }
                });
    }

    public Optional<Tenant> assignTenant(String keyId, String tenantId) {
        return tenantRepository.findById(tenantId)
                .flatMap(tenant -> keyRepository.findById(keyId)
                        .map(key -> {
                            // Ta bort nyckeln från tidigare hyresgäst om den finns
                            if (key.getTenant() != null) {
                                Tenant oldTenant = key.getTenant();
                                if (oldTenant.getKeys() != null) {
                                    oldTenant.getKeys().removeIf(k -> k.getId().equals(key.getId()));
                                    tenantRepository.save(oldTenant);
                                }
                            }
                            
                            // Tilldela nyckeln till den nya hyresgästen
                            key.setTenant(tenant);
                            
                            // Initiera keys-listan om den är null
                            if (tenant.getKeys() == null) {
                                tenant.setKeys(new ArrayList<>());
                            }
                            
                            // Lägg bara till nyckeln om den inte redan finns i listan
                            if (tenant.getKeys().stream().noneMatch(k -> k.getId().equals(key.getId()))) {
                                tenant.getKeys().add(key);
                            }
                            
                            keyRepository.save(key);
                            return tenant;
                        }));
    }

    public Optional<Tenant> findTenantByEmail(String email) {
        return tenantRepository.findByEmail(email);
    }
} 