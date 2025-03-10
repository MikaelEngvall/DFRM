package com.dfrm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
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
} 