package com.dfrm.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.KeyRepository;
import com.dfrm.repository.TenantRepository;

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
        apartmentRepository.findById(id).ifPresent(apartment -> {
            // Ta bort lägenhetens referens från alla hyresgäster
            if (apartment.getTenants() != null) {
                apartment.getTenants().forEach(tenant -> {
                    tenant.setApartment(null);
                    tenantRepository.save(tenant);
                });
            }
            
            // Ta bort lägenhetens referens från alla nycklar
            if (apartment.getKeys() != null) {
                apartment.getKeys().forEach(key -> {
                    key.setApartment(null);
                    keyRepository.save(key);
                });
            }
            
            apartmentRepository.deleteById(id);
        });
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

    public Optional<Apartment> assignTenant(String apartmentId, String tenantId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> tenantRepository.findById(tenantId)
                        .map(tenant -> {
                            // Ta bort hyresgästen från tidigare lägenhet om den finns
                            if (tenant.getApartment() != null) {
                                Apartment oldApartment = tenant.getApartment();
                                oldApartment.getTenants().remove(tenant);
                                apartmentRepository.save(oldApartment);
                            }

                            // Lägg till hyresgästen i den nya lägenheten
                            if (apartment.getTenants() == null) {
                                apartment.setTenants(new ArrayList<>());
                            }
                            if (!apartment.getTenants().contains(tenant)) {
                                apartment.getTenants().add(tenant);
                            }
                            tenant.setApartment(apartment);

                            tenantRepository.save(tenant);
                            return apartmentRepository.save(apartment);
                        }));
    }

    public Optional<Apartment> assignKey(String apartmentId, String keyId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> keyRepository.findById(keyId)
                        .map(key -> {
                            // Ta bort nyckeln från tidigare lägenhet om den finns
                            if (key.getApartment() != null) {
                                Apartment oldApartment = key.getApartment();
                                oldApartment.getKeys().remove(key);
                                apartmentRepository.save(oldApartment);
                            }

                            // Lägg till nyckeln i den nya lägenheten
                            if (apartment.getKeys() == null) {
                                apartment.setKeys(new ArrayList<>());
                            }
                            if (!apartment.getKeys().contains(key)) {
                                apartment.getKeys().add(key);
                            }
                            key.setApartment(apartment);

                            keyRepository.save(key);
                            return apartmentRepository.save(apartment);
                        }));
    }

    public Optional<Apartment> removeTenant(String apartmentId, String tenantId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> tenantRepository.findById(tenantId)
                        .map(tenant -> {
                            apartment.getTenants().remove(tenant);
                            tenant.setApartment(null);
                            tenantRepository.save(tenant);
                            return apartmentRepository.save(apartment);
                        }));
    }

    public Optional<Apartment> removeKey(String apartmentId, String keyId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> keyRepository.findById(keyId)
                        .map(key -> {
                            apartment.getKeys().remove(key);
                            key.setApartment(null);
                            keyRepository.save(key);
                            return apartmentRepository.save(apartment);
                        }));
    }
} 