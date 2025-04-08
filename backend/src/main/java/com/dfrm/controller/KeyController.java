package com.dfrm.controller;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/api/keys")
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
    
    @PatchMapping("/{id}/apartment")
    public ResponseEntity<Key> patchAssignApartment(
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
    
    @PatchMapping("/{id}/tenant")
    public ResponseEntity<Key> patchAssignTenant(
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
    
    @PatchMapping("/{id}")
    public ResponseEntity<Key> partialUpdateKey(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return keyService.partialUpdate(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/export-sql")
    public ResponseEntity<String> exportToSql() {
        List<Key> keys = keyService.getAllKeys();
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- SQL export av nycklar från DFRM\n");
        sql.append("-- Genererat: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
        
        // Skapa INSERT-satser för varje nyckel
        for (Key key : keys) {
            sql.append("INSERT INTO `keys` (id, serie, number, copyNumber, type, description, isAvailable, apartmentId, tenantId) VALUES (\n");
            sql.append("    '").append(key.getId()).append("',\n");
            sql.append("    '").append(escapeSql(key.getSerie())).append("',\n");
            sql.append("    '").append(escapeSql(key.getNumber())).append("',\n");
            sql.append("    '").append(escapeSql(key.getCopyNumber())).append("',\n");
            sql.append("    '").append(key.getType()).append("',\n");
            sql.append("    '").append(escapeSql(key.getDescription())).append("',\n");
            sql.append("    ").append(key.getIsAvailable() != null ? key.getIsAvailable() : true).append(",\n");
            
            // Hantera apartmentId som kan vara null
            if (key.getApartment() != null) {
                sql.append("    '").append(key.getApartment().getId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera tenantId som kan vara null
            if (key.getTenant() != null) {
                sql.append("    '").append(key.getTenant().getId()).append("'\n");
            } else {
                sql.append("    NULL\n");
            }
            
            sql.append(");\n\n");
        }
        
        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=keys_export.sql")
            .contentType(MediaType.TEXT_PLAIN)
            .body(sql.toString());
    }
    
    // Hjälpmetod för att escapa SQL-strängar
    private String escapeSql(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("'", "''");
    }
} 