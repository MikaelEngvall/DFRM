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

import com.dfrm.model.Apartment;
import com.dfrm.service.ApartmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/apartments")
@RequiredArgsConstructor
public class ApartmentController {
    private final ApartmentService apartmentService;
    
    @GetMapping
    public List<Apartment> getAllApartments() {
        return apartmentService.getAllApartments();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Apartment> getApartmentById(@PathVariable String id) {
        return apartmentService.getApartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Apartment createApartment(@RequestBody Apartment apartment) {
        return apartmentService.saveApartment(apartment);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Apartment> updateApartment(@PathVariable String id, @RequestBody Apartment apartment) {
        return apartmentService.getApartmentById(id)
                .map(existingApartment -> {
                    apartment.setId(id);
                    return ResponseEntity.ok(apartmentService.saveApartment(apartment));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApartment(@PathVariable String id) {
        if (apartmentService.getApartmentById(id).isPresent()) {
            apartmentService.deleteApartment(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/search/city/{city}")
    public List<Apartment> findByCity(@PathVariable String city) {
        return apartmentService.findByCity(city);
    }
    
    @GetMapping("/search/rooms/{minRooms}")
    public List<Apartment> findByRooms(@PathVariable Integer minRooms) {
        return apartmentService.findByRoomsGreaterThanEqual(minRooms);
    }
    
    @GetMapping("/search/price/{maxPrice}")
    public List<Apartment> findByPrice(@PathVariable Double maxPrice) {
        return apartmentService.findByPriceLessThanEqual(maxPrice);
    }
    
    @GetMapping("/search/address")
    public List<Apartment> findByAddress(
            @RequestParam String street,
            @RequestParam String number,
            @RequestParam String apartmentNumber) {
        return apartmentService.findByAddress(street, number, apartmentNumber);
    }

    @PutMapping("/{id}/tenant")
    public ResponseEntity<Apartment> assignTenant(
            @PathVariable String id,
            @RequestParam String tenantId) {
        return apartmentService.assignTenant(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/tenant")
    public ResponseEntity<Apartment> patchAssignTenant(
            @PathVariable String id,
            @RequestParam String tenantId) {
        return apartmentService.assignTenant(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/key")
    public ResponseEntity<Apartment> assignKey(
            @PathVariable String id,
            @RequestParam String keyId) {
        return apartmentService.assignKey(id, keyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/key")
    public ResponseEntity<Apartment> patchAssignKey(
            @PathVariable String id,
            @RequestParam String keyId) {
        return apartmentService.assignKey(id, keyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/tenant/{tenantId}")
    public ResponseEntity<Apartment> removeTenant(
            @PathVariable String id,
            @PathVariable String tenantId) {
        return apartmentService.removeTenant(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/key/{keyId}")
    public ResponseEntity<Apartment> removeKey(
            @PathVariable String id,
            @PathVariable String keyId) {
        return apartmentService.removeKey(id, keyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Apartment> partialUpdateApartment(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return apartmentService.partialUpdate(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export-sql")
    public ResponseEntity<String> exportToSql() {
        List<Apartment> apartments = apartmentService.getAllApartments();
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- SQL export av lägenheter från DFRM\n");
        sql.append("-- Genererat: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
        
        // Skapa INSERT-satser för varje lägenhet
        for (Apartment apartment : apartments) {
            sql.append("INSERT INTO apartments (id, street, number, apartmentNumber, postalCode, city, rooms, area, price, electricity, storage, internet, isTemporary) VALUES (\n");
            sql.append("    '").append(apartment.getId()).append("',\n");
            sql.append("    '").append(escapeSql(apartment.getStreet())).append("',\n");
            sql.append("    '").append(escapeSql(apartment.getNumber())).append("',\n");
            sql.append("    '").append(escapeSql(apartment.getApartmentNumber())).append("',\n");
            sql.append("    '").append(escapeSql(apartment.getPostalCode())).append("',\n");
            sql.append("    '").append(escapeSql(apartment.getCity())).append("',\n");
            sql.append("    ").append(apartment.getRooms()).append(",\n");
            sql.append("    ").append(apartment.getArea()).append(",\n");
            sql.append("    ").append(apartment.getPrice()).append(",\n");
            sql.append("    ").append(apartment.getElectricity() != null ? apartment.getElectricity() : false).append(",\n");
            sql.append("    ").append(apartment.getStorage() != null ? apartment.getStorage() : false).append(",\n");
            sql.append("    ").append(apartment.getInternet() != null ? apartment.getInternet() : false).append(",\n");
            sql.append("    ").append(apartment.getIsTemporary()).append("\n");
            sql.append(");\n\n");
        }
        
        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=apartments_export.sql")
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