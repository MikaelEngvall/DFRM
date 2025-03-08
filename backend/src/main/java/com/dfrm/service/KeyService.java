package com.dfrm.service;

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
public class KeyService {
    private final KeyRepository keyRepository;
    private final ApartmentRepository apartmentRepository;
    private final TenantRepository tenantRepository;
    
    public List<Key> getAllKeys() {
        return keyRepository.findAll();
    }
    
    public Optional<Key> getKeyById(String id) {
        return keyRepository.findById(id);
    }
    
    public Optional<Key> findBySerieAndNumber(String serie, String number) {
        return keyRepository.findBySerieAndNumber(serie, number);
    }
    
    public Key saveKey(Key key) {
        return keyRepository.save(key);
    }
    
    public void deleteKey(String id) {
        keyRepository.findById(id).ifPresent(key -> {
            // Ta bort nyckelreferensen från lägenheten
            if (key.getApartment() != null) {
                Apartment apartment = key.getApartment();
                apartment.getKeys().remove(key);
                apartmentRepository.save(apartment);
            }
            
            // Ta bort nyckelreferensen från hyresgästen
            if (key.getTenant() != null) {
                Tenant tenant = key.getTenant();
                tenant.setKey(null);
                tenantRepository.save(tenant);
            }
            
            keyRepository.deleteById(id);
        });
    }
    
    public List<Key> findByType(String type) {
        return keyRepository.findByType(type);
    }
    
    public List<Key> findByApartmentId(String apartmentId) {
        return keyRepository.findByApartmentId(apartmentId);
    }
    
    public List<Key> findByTenantId(String tenantId) {
        return keyRepository.findByTenantId(tenantId);
    }

    public Optional<Key> assignApartment(String keyId, String apartmentId) {
        return keyRepository.findById(keyId)
                .flatMap(key -> apartmentRepository.findById(apartmentId)
                        .map(apartment -> {
                            // Ta bort nyckeln från tidigare lägenhet om den finns
                            if (key.getApartment() != null) {
                                Apartment oldApartment = key.getApartment();
                                oldApartment.getKeys().remove(key);
                                apartmentRepository.save(oldApartment);
                            }
                            
                            // Spara referensen till hyresgästen om nyckeln har en
                            Tenant keyTenant = key.getTenant();
                            
                            // Lägg till nyckeln i den nya lägenheten
                            key.setApartment(apartment);
                            if (apartment.getKeys() == null) {
                                apartment.setKeys(new ArrayList<>());
                            }
                            if (!apartment.getKeys().contains(key)) {
                                apartment.getKeys().add(key);
                            }
                            
                            // Om nyckeln har en hyresgäst, se till att hyresgästen också läggs till i lägenheten
                            if (keyTenant != null) {
                                // Om hyresgästen redan har en lägenhet som är ANNAN än den nya
                                if (keyTenant.getApartment() != null && !keyTenant.getApartment().getId().equals(apartment.getId())) {
                                    // Ta bort hyresgästen från den gamla lägenheten
                                    Apartment oldTenantApartment = keyTenant.getApartment();
                                    if (oldTenantApartment.getTenants() != null) {
                                        oldTenantApartment.getTenants().remove(keyTenant);
                                        apartmentRepository.save(oldTenantApartment);
                                    }
                                }
                                
                                // Sätt den nya lägenheten som hyresgästens lägenhet
                                keyTenant.setApartment(apartment);
                                
                                // Lägg till hyresgästen i lägenhetens hyresgästlista om den inte redan finns där
                                if (apartment.getTenants() == null) {
                                    apartment.setTenants(new ArrayList<>());
                                }
                                if (!apartment.getTenants().contains(keyTenant)) {
                                    apartment.getTenants().add(keyTenant);
                                }
                                
                                tenantRepository.save(keyTenant);
                            }
                            
                            apartmentRepository.save(apartment);
                            return keyRepository.save(key);
                        }));
    }

    public Optional<Key> assignTenant(String keyId, String tenantId) {
        return keyRepository.findById(keyId)
                .flatMap(key -> tenantRepository.findById(tenantId)
                        .map(tenant -> {
                            // Ta bort nyckeln från tidigare hyresgäst om den finns
                            if (key.getTenant() != null) {
                                Tenant oldTenant = key.getTenant();
                                oldTenant.setKey(null);
                                tenantRepository.save(oldTenant);
                            }
                            
                            // Spara referensen till lägenheten om nyckeln har en
                            Apartment keyApartment = key.getApartment();
                            
                            // Tilldela nyckeln till den nya hyresgästen
                            key.setTenant(tenant);
                            
                            // Ta bort tidigare nyckel från hyresgästen om den finns
                            if (tenant.getKey() != null) {
                                Key oldKey = tenant.getKey();
                                oldKey.setTenant(null);
                                keyRepository.save(oldKey);
                            }
                            
                            tenant.setKey(key);
                            
                            // Om hyresgästen inte redan är associerad med nyckelns lägenhet
                            // och nyckeln har en lägenhet, uppdatera dessa relationer också
                            if (keyApartment != null) {
                                // Om hyresgästen redan har en lägenhet som är ANNAN än nyckelns
                                if (tenant.getApartment() != null && !tenant.getApartment().getId().equals(keyApartment.getId())) {
                                    // Ta bort hyresgästen från den gamla lägenheten
                                    Apartment oldApartment = tenant.getApartment();
                                    if (oldApartment.getTenants() != null) {
                                        oldApartment.getTenants().remove(tenant);
                                        apartmentRepository.save(oldApartment);
                                    }
                                }
                                
                                // Sätt nyckelns lägenhet som hyresgästens lägenhet
                                tenant.setApartment(keyApartment);
                                
                                // Lägg till hyresgästen i lägenhetens hyresgästlista om den inte redan finns där
                                if (keyApartment.getTenants() == null) {
                                    keyApartment.setTenants(new ArrayList<>());
                                }
                                if (!keyApartment.getTenants().contains(tenant)) {
                                    keyApartment.getTenants().add(tenant);
                                    apartmentRepository.save(keyApartment);
                                }
                            }
                            
                            tenantRepository.save(tenant);
                            return keyRepository.save(key);
                        }));
    }

    public Optional<Key> removeApartment(String keyId) {
        return keyRepository.findById(keyId)
                .map(key -> {
                    if (key.getApartment() != null) {
                        Apartment apartment = key.getApartment();
                        apartment.getKeys().remove(key);
                        apartmentRepository.save(apartment);
                    }
                    key.setApartment(null);
                    return keyRepository.save(key);
                });
    }

    public Optional<Key> removeTenant(String keyId) {
        return keyRepository.findById(keyId)
                .map(key -> {
                    if (key.getTenant() != null) {
                        Tenant tenant = key.getTenant();
                        tenant.setKey(null);
                        tenantRepository.save(tenant);
                    }
                    key.setTenant(null);
                    return keyRepository.save(key);
                });
    }
} 