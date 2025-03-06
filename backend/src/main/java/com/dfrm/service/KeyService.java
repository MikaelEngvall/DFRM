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
                            
                            // Lägg till nyckeln i den nya lägenheten
                            key.setApartment(apartment);
                            if (apartment.getKeys() == null) {
                                apartment.setKeys(new ArrayList<>());
                            }
                            if (!apartment.getKeys().contains(key)) {
                                apartment.getKeys().add(key);
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
                            
                            // Tilldela nyckeln till den nya hyresgästen
                            key.setTenant(tenant);
                            tenant.setKey(key);
                            
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