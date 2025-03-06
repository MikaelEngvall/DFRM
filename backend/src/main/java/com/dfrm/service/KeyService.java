package com.dfrm.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Key;
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
        keyRepository.deleteById(id);
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
                            key.setApartment(apartment);
                            return keyRepository.save(key);
                        }));
    }

    public Optional<Key> assignTenant(String keyId, String tenantId) {
        return keyRepository.findById(keyId)
                .flatMap(key -> tenantRepository.findById(tenantId)
                        .map(tenant -> {
                            key.setTenant(tenant);
                            return keyRepository.save(key);
                        }));
    }

    public Optional<Key> removeApartment(String keyId) {
        return keyRepository.findById(keyId)
                .map(key -> {
                    key.setApartment(null);
                    return keyRepository.save(key);
                });
    }

    public Optional<Key> removeTenant(String keyId) {
        return keyRepository.findById(keyId)
                .map(key -> {
                    key.setTenant(null);
                    return keyRepository.save(key);
                });
    }
} 