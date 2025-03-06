package com.dfrm.service;

import com.dfrm.model.Key;
import com.dfrm.repository.KeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KeyService {
    private final KeyRepository keyRepository;
    
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
} 