package com.dfrm.service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.TenantRepository;
import com.dfrm.repository.KeyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final TenantRepository tenantRepository;
    private final KeyRepository keyRepository;
    
    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }
    
    public Optional<Apartment> getApartmentById(String id) {
        return apartmentRepository.findById(id);
    }
    
    public Apartment saveApartment(Apartment apartment) {
        return apartmentRepository.save(apartment);
    }
    
    public void deleteApartment(String id) {
        apartmentRepository.deleteById(id);
    }
    
    public List<Apartment> findByCity(String city) {
        return apartmentRepository.findByCity(city);
    }
    
    public List<Apartment> findByRoomsGreaterThanEqual(Integer minRooms) {
        return apartmentRepository.findByRoomsGreaterThanEqual(minRooms);
    }
    
    public List<Apartment> findByPriceLessThanEqual(Double maxPrice) {
        return apartmentRepository.findByPriceLessThanEqual(maxPrice);
    }
    
    public List<Apartment> findByAddress(String street, String number, String apartmentNumber) {
        return apartmentRepository.findByStreetAndNumberAndApartmentNumber(street, number, apartmentNumber);
    }

    public Optional<Apartment> addTenant(String apartmentId, String tenantId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> tenantRepository.findById(tenantId)
                        .map(tenant -> {
                            if (apartment.getTenants() == null) {
                                apartment.setTenants(new ArrayList<>());
                            }
                            apartment.getTenants().add(tenant);
                            return apartmentRepository.save(apartment);
                        }));
    }

    public Optional<Apartment> addKey(String apartmentId, String keyId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> keyRepository.findById(keyId)
                        .map(key -> {
                            if (apartment.getKeys() == null) {
                                apartment.setKeys(new ArrayList<>());
                            }
                            apartment.getKeys().add(key);
                            return apartmentRepository.save(apartment);
                        }));
    }

    public Optional<Apartment> removeTenant(String apartmentId, String tenantId) {
        return apartmentRepository.findById(apartmentId)
                .map(apartment -> {
                    if (apartment.getTenants() != null) {
                        apartment.getTenants().removeIf(tenant -> tenant.getId().equals(tenantId));
                        return apartmentRepository.save(apartment);
                    }
                    return apartment;
                });
    }

    public Optional<Apartment> removeKey(String apartmentId, String keyId) {
        return apartmentRepository.findById(apartmentId)
                .map(apartment -> {
                    if (apartment.getKeys() != null) {
                        apartment.getKeys().removeIf(key -> key.getId().equals(keyId));
                        return apartmentRepository.save(apartment);
                    }
                    return apartment;
                });
    }
} 