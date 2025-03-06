package com.dfrm.controller;

import java.util.List;

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

import com.dfrm.model.Key;
import com.dfrm.service.KeyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/keys")
@RequiredArgsConstructor
public class KeyController {
    private final KeyService keyService;
    
    @GetMapping
    public List<Key> getAllKeys() {
        return keyService.getAllKeys();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Key> getKeyById(@PathVariable String id) {
        return keyService.getKeyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<Key> findBySerieAndNumber(
            @RequestParam String serie,
            @RequestParam String number) {
        return keyService.findBySerieAndNumber(serie, number)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Key createKey(@RequestBody Key key) {
        return keyService.saveKey(key);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Key> updateKey(@PathVariable String id, @RequestBody Key key) {
        return keyService.getKeyById(id)
                .map(existingKey -> {
                    key.setId(id);
                    return ResponseEntity.ok(keyService.saveKey(key));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/apartment")
    public ResponseEntity<Key> assignApartment(
            @PathVariable String id,
            @RequestParam String apartmentId) {
        return keyService.assignApartment(id, apartmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/tenant")
    public ResponseEntity<Key> assignTenant(
            @PathVariable String id,
            @RequestParam String tenantId) {
        return keyService.assignTenant(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}/apartment")
    public ResponseEntity<Key> removeApartment(@PathVariable String id) {
        return keyService.removeApartment(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}/tenant")
    public ResponseEntity<Key> removeTenant(@PathVariable String id) {
        return keyService.removeTenant(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKey(@PathVariable String id) {
        if (keyService.getKeyById(id).isPresent()) {
            keyService.deleteKey(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/search/type/{type}")
    public List<Key> findByType(@PathVariable String type) {
        return keyService.findByType(type);
    }
    
    @GetMapping("/search/apartment/{apartmentId}")
    public List<Key> findByApartmentId(@PathVariable String apartmentId) {
        return keyService.findByApartmentId(apartmentId);
    }
    
    @GetMapping("/search/tenant/{tenantId}")
    public List<Key> findByTenantId(@PathVariable String tenantId) {
        return keyService.findByTenantId(tenantId);
    }
} 