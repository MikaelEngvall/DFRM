package com.dfrm.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.KeyRepository;
import com.dfrm.repository.TenantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

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

                            // Lägg till hyresgästen i den nya lägenheten - säkerställ att vi inte får dubbletter
                            if (apartment.getTenants() == null) {
                                apartment.setTenants(new ArrayList<>());
                            }
                            
                            // Först ta bort hyresgästen om den redan finns för att undvika duplicering
                            // Detta är en extra säkerhetsåtgärd utöver kontroll av dubbletter
                            apartment.getTenants().removeIf(t -> t.getId().equals(tenant.getId()));
                            
                            // Kontrollera om hyresgästen (med samma ID) redan finns i lägenheten (undvik dubbletter)
                            boolean alreadyExists = apartment.getTenants().stream()
                                .anyMatch(t -> t.getId().equals(tenant.getId()));
                                
                            if (!alreadyExists) {
                                apartment.getTenants().add(tenant);
                            } else {
                                // Logga varning om dubbletter upptäcks
                                System.out.println("VARNING: Försök att lägga till hyresgäst " + tenant.getId() + 
                                    " i lägenhet " + apartment.getId() + " misslyckades eftersom hyresgästen redan finns.");
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

                            // Lägg till nyckeln i den nya lägenheten - säkerställ att vi inte får dubbletter
                            if (apartment.getKeys() == null) {
                                apartment.setKeys(new ArrayList<>());
                            }
                            
                            // Kontrollera om nyckeln redan finns i lägenheten (undvik dubbletter)
                            boolean alreadyExists = apartment.getKeys().stream()
                                .anyMatch(k -> k.getId().equals(key.getId()));
                                
                            if (!alreadyExists) {
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

    public Optional<Apartment> partialUpdate(String id, Map<String, Object> updates) {
        return apartmentRepository.findById(id)
                .map(existingApartment -> {
                    // Applicera uppdateringarna till lägenheten, men ignorera relations-fält
                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        objectMapper.registerModule(new JavaTimeModule()); // Stöd för LocalDate
                        
                        // Konvertera existerande lägenhet till Map
                        Map<String, Object> apartmentMap = objectMapper.convertValue(existingApartment, Map.class);
                        
                        // Applicera endast de fält som skickats in
                        for (Map.Entry<String, Object> entry : updates.entrySet()) {
                            // Ignorera ID-fältet och relationsfält
                            if (!entry.getKey().equals("id") && !entry.getKey().equals("tenants") && !entry.getKey().equals("keys")) {
                                apartmentMap.put(entry.getKey(), entry.getValue());
                            }
                        }
                        
                        // Konvertera tillbaka till Apartment-objekt med uppdaterade fält
                        Apartment updatedApartment = objectMapper.convertValue(apartmentMap, Apartment.class);
                        
                        // Behåll original-ID och relationer
                        updatedApartment.setId(id);
                        updatedApartment.setTenants(existingApartment.getTenants());
                        updatedApartment.setKeys(existingApartment.getKeys());
                        
                        // Spara och returnera uppdaterad lägenhet
                        return apartmentRepository.save(updatedApartment);
                    } catch (Exception e) {
                        e.printStackTrace();
                        return existingApartment; // Vid fel, returnera originalet
                    }
                });
    }

    public Optional<Apartment> findByStreetAddressAndApartmentNumber(String streetAddress, String apartmentNumber) {
        return apartmentRepository.findByStreetAddressAndApartmentNumber(streetAddress, apartmentNumber);
    }
} 