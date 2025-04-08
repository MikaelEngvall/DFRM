package com.dfrm.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.model.Tenant;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.KeyRepository;
import com.dfrm.repository.TenantRepository;

import lombok.RequiredArgsConstructor;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final TenantRepository tenantRepository;
    private final KeyRepository keyRepository;
    private final EntityReferenceService entityReferenceService;
    private static final Logger log = LoggerFactory.getLogger(ApartmentService.class);
    
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
                            // Använd EntityReferenceService för att hantera relationen
                            Apartment updatedApartment = entityReferenceService.assignTenantToApartment(apartment, tenant);
                            return apartmentRepository.save(updatedApartment);
                        }));
    }

    public Optional<Apartment> assignKey(String apartmentId, String keyId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> keyRepository.findById(keyId)
                        .map(key -> {
                            // Använd EntityReferenceService för att hantera relationen
                            Apartment updatedApartment = entityReferenceService.assignKeyToApartment(apartment, key);
                            return apartmentRepository.save(updatedApartment);
                        }));
    }

    public Optional<Apartment> removeTenant(String apartmentId, String tenantId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> tenantRepository.findById(tenantId)
                        .map(tenant -> {
                            // Använd EntityReferenceService för att hantera relationen
                            Apartment updatedApartment = entityReferenceService.removeTenantFromApartment(apartment, tenant);
                            return apartmentRepository.save(updatedApartment);
                        }));
    }

    public Optional<Apartment> removeKey(String apartmentId, String keyId) {
        return apartmentRepository.findById(apartmentId)
                .flatMap(apartment -> keyRepository.findById(keyId)
                        .map(key -> {
                            // Använd EntityReferenceService för att hantera relationen
                            Apartment updatedApartment = entityReferenceService.removeKeyFromApartment(apartment, key);
                            return apartmentRepository.save(updatedApartment);
                        }));
    }

    public Optional<Apartment> partialUpdate(String id, Map<String, Object> updates) {
        return apartmentRepository.findById(id)
                .map(apartment -> {
                    // Uppdatera grundläggande fält
                    if (updates.containsKey("street")) {
                        apartment.setStreet((String) updates.get("street"));
                    }
                    if (updates.containsKey("number")) {
                        apartment.setNumber((String) updates.get("number"));
                    }
                    if (updates.containsKey("city")) {
                        apartment.setCity((String) updates.get("city"));
                    }
                    if (updates.containsKey("rooms")) {
                        apartment.setRooms((Integer) updates.get("rooms"));
                    }
                    if (updates.containsKey("price")) {
                        apartment.setPrice((Double) updates.get("price"));
                    }
                    
                    // Hantera hyresgäster
                    if (updates.containsKey("tenants")) {
                        @SuppressWarnings("unchecked")
                        List<String> tenantIds = (List<String>) updates.get("tenants");
                        
                        // Om listan är tom eller null, ta bort alla hyresgäster
                        if (tenantIds == null || tenantIds.isEmpty()) {
                            apartment.setTenants(new ArrayList<>());
                        } else {
                            // Hämta alla hyresgäster baserat på ID:n
                            List<Tenant> tenants = tenantRepository.findAllById(tenantIds);
                            apartment.setTenants(tenants);
                        }
                    }
                    
                    return apartmentRepository.save(apartment);
                });
    }

    public Optional<Apartment> findByStreetAddressAndApartmentNumber(String streetAddress, String apartmentNumber) {
        return apartmentRepository.findByStreetAddressAndApartmentNumber(streetAddress, apartmentNumber);
    }

    /**
     * Migrerar alla lägenheter som har 'Valhallav.' som gatadress till 'Valhallavägen'
     *
     * @return Antal uppdaterade lägenheter
     */
    public int migrateValhallavagen() {
        // Hitta alla lägenheter med 'Valhallav.' som gatuadress
        List<Apartment> apartments = apartmentRepository.findAll()
                .stream()
                .filter(apt -> apt.getStreet() != null && apt.getStreet().equals("Valhallav."))
                .toList();
        
        // Uppdatera varje lägenhet
        for (Apartment apartment : apartments) {
            apartment.setStreet("Valhallavägen");
            apartmentRepository.save(apartment);
        }
        
        return apartments.size();
    }

    /**
     * Körs vid uppstart för att säkerställa att alla Valhallav. uppdateras till Valhallavägen
     */
    @PostConstruct
    public void initMigration() {
        log.info("Kontrollerar och migrerar Valhallav. till Valhallavägen vid uppstart");
        int count = migrateValhallavagen();
        if (count > 0) {
            log.info("Migrerade {} lägenheter från Valhallav. till Valhallavägen", count);
        } else {
            log.info("Inga lägenheter behövde migreras från Valhallav. till Valhallavägen");
        }
    }
} 