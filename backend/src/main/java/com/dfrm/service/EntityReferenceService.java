package com.dfrm.service;

import java.time.LocalDate;
import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.model.Key;
import com.dfrm.model.Task;
import com.dfrm.model.Tenant;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.KeyRepository;
import com.dfrm.repository.TaskRepository;
import com.dfrm.repository.TenantRepository;
import com.dfrm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Hjälptjänst för att hantera referenser mellan entiteter.
 * Denna klass används för att centralisera logiken för att hantera referenser
 * mellan entiteter som lägenheter, hyresgäster, användare och uppgifter.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EntityReferenceService {
    
    private final ApartmentRepository apartmentRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final KeyRepository keyRepository;
    
    /**
     * Synkroniserar task-references genom att sätta både ID och referens baserat på den information som finns
     * 
     * @param task Uppgiften som ska uppdateras
     * @return Uppdaterad uppgift med korrekta referenser
     */
    public Task syncTaskReferences(Task task) {
        // Synkronisera lägenhet och lägenhets-ID
        syncApartmentReferenceWithTask(task);
        
        // Synkronisera hyresgäst och hyresgäst-ID
        syncTenantReferenceWithTask(task);
        
        // Synkronisera tilldelad användare och användar-ID
        syncUserReferenceWithTask(task);
        
        // Normalisera dueDate för att säkerställa konsekvent dataformat
        normalizeDueDate(task);
        
        return task;
    }
    
    /**
     * Synkroniserar lägenhet och lägenhets-ID
     * 
     * @param task Uppgiften som ska uppdateras
     */
    private void syncApartmentReferenceWithTask(Task task) {
        // Om vi har apartment-referens men inget apartmentId, sätt ID:t
        if (task.getApartment() != null && (task.getApartmentId() == null || task.getApartmentId().isEmpty())) {
            task.setApartmentId(task.getApartment().getId());
            log.debug("Satte apartmentId baserat på apartment-referens: {}", task.getApartmentId());
        } 
        // Om vi har apartmentId men ingen apartment-referens, försök att hitta och sätta den
        else if (task.getApartmentId() != null && !task.getApartmentId().isEmpty() && task.getApartment() == null) {
            apartmentRepository.findById(task.getApartmentId()).ifPresent(apartment -> {
                task.setApartment(apartment);
                log.debug("Satte apartment-referens baserat på apartmentId: {}", apartment.getId());
            });
        }
    }
    
    /**
     * Synkroniserar hyresgäst och hyresgäst-ID
     * 
     * @param task Uppgiften som ska uppdateras
     */
    private void syncTenantReferenceWithTask(Task task) {
        // Om vi har tenant-referens men inget tenantId, sätt ID:t
        if (task.getTenant() != null && (task.getTenantId() == null || task.getTenantId().isEmpty())) {
            task.setTenantId(task.getTenant().getId());
            log.debug("Satte tenantId baserat på tenant-referens: {}", task.getTenantId());
        } 
        // Om vi har tenantId men ingen tenant-referens, försök att hitta och sätta den
        else if (task.getTenantId() != null && !task.getTenantId().isEmpty() && task.getTenant() == null) {
            tenantRepository.findById(task.getTenantId()).ifPresent(tenant -> {
                task.setTenant(tenant);
                log.debug("Satte tenant-referens baserat på tenantId: {}", tenant.getId());
            });
        }
    }
    
    /**
     * Synkroniserar användare och användar-ID
     * 
     * @param task Uppgiften som ska uppdateras
     */
    private void syncUserReferenceWithTask(Task task) {
        // Om vi har assignedUser-referens men inget assignedToUserId, sätt ID:t
        if (task.getAssignedUser() != null && (task.getAssignedToUserId() == null || task.getAssignedToUserId().isEmpty())) {
            task.setAssignedToUserId(task.getAssignedUser().getId());
            log.debug("Satte assignedToUserId baserat på assignedUser-referens: {}", task.getAssignedToUserId());
        } 
        // Om vi har assignedToUserId men ingen assignedUser-referens, försök att hitta och sätta den
        else if (task.getAssignedToUserId() != null && !task.getAssignedToUserId().isEmpty() && task.getAssignedUser() == null) {
            userRepository.findById(task.getAssignedToUserId()).ifPresent(user -> {
                task.setAssignedUser(user);
                log.debug("Satte assignedUser-referens baserat på assignedToUserId: {}", user.getId());
            });
        }
    }
    
    /**
     * Normaliserar dueDate för att säkerställa konsekvent dataformat
     * 
     * @param task Uppgiften som ska uppdateras
     */
    private void normalizeDueDate(Task task) {
        if (task.getDueDate() != null) {
            // Garantera att vi bara har LocalDate utan tidsdel
            LocalDate dueDate = task.getDueDate();
            task.setDueDate(dueDate);
            log.debug("Normaliserade dueDate: {}", dueDate);
        }
    }
    
    /**
     * Hanterar relationen mellan lägenhet och hyresgäst
     * 
     * @param apartment Lägenheten
     * @param tenant Hyresgästen
     * @return Uppdaterad lägenhet med korrekt relation till hyresgästen
     */
    public Apartment assignTenantToApartment(Apartment apartment, Tenant tenant) {
        if (apartment == null || tenant == null) {
            throw new IllegalArgumentException("Både lägenhet och hyresgäst måste anges");
        }
        
        // Ta bort hyresgästen från tidigare lägenhet om den finns
        if (tenant.getApartment() != null) {
            Apartment oldApartment = tenant.getApartment();
            if (oldApartment.getTenants() != null) {
                oldApartment.getTenants().remove(tenant);
                apartmentRepository.save(oldApartment);
            }
        }
        
        // Initiera tenants-listan om den inte finns
        if (apartment.getTenants() == null) {
            apartment.setTenants(new ArrayList<>());
        }
        
        // Ta bort eventuell existerande kopia av hyresgästen för att undvika duplicering
        apartment.getTenants().removeIf(t -> t.getId().equals(tenant.getId()));
        
        // Lägg till hyresgästen i lägenheten
        apartment.getTenants().add(tenant);
        
        // Uppdatera hyresgästens lägenhet
        tenant.setApartment(apartment);
        
        // Spara hyresgästen
        tenantRepository.save(tenant);
        
        // Returnera den uppdaterade lägenheten
        return apartment;
    }
    
    /**
     * Tar bort en hyresgäst från en lägenhet
     * 
     * @param apartment Lägenheten
     * @param tenant Hyresgästen
     * @return Uppdaterad lägenhet utan hyresgästen
     */
    public Apartment removeTenantFromApartment(Apartment apartment, Tenant tenant) {
        if (apartment == null || tenant == null) {
            throw new IllegalArgumentException("Både lägenhet och hyresgäst måste anges");
        }
        
        if (apartment.getTenants() != null) {
            apartment.getTenants().remove(tenant);
        }
        
        tenant.setApartment(null);
        tenantRepository.save(tenant);
        
        return apartment;
    }
    
    /**
     * Hanterar relationen mellan lägenhet och nyckel
     * 
     * @param apartment Lägenheten
     * @param key Nyckeln
     * @return Uppdaterad lägenhet med korrekt relation till nyckeln
     */
    public Apartment assignKeyToApartment(Apartment apartment, Key key) {
        if (apartment == null || key == null) {
            throw new IllegalArgumentException("Både lägenhet och nyckel måste anges");
        }
        
        // Ta bort nyckeln från tidigare lägenhet om den finns
        if (key.getApartment() != null) {
            Apartment oldApartment = key.getApartment();
            if (oldApartment.getKeys() != null) {
                oldApartment.getKeys().remove(key);
                apartmentRepository.save(oldApartment);
            }
        }
        
        // Initiera keys-listan om den inte finns
        if (apartment.getKeys() == null) {
            apartment.setKeys(new ArrayList<>());
        }
        
        // Ta bort eventuell existerande kopia av nyckeln för att undvika duplicering
        apartment.getKeys().removeIf(k -> k.getId().equals(key.getId()));
        
        // Lägg till nyckeln i lägenheten
        apartment.getKeys().add(key);
        
        // Uppdatera nyckelns lägenhet
        key.setApartment(apartment);
        
        // Spara nyckeln
        keyRepository.save(key);
        
        // Returnera den uppdaterade lägenheten
        return apartment;
    }
    
    /**
     * Tar bort en nyckel från en lägenhet
     * 
     * @param apartment Lägenheten
     * @param key Nyckeln
     * @return Uppdaterad lägenhet utan nyckeln
     */
    public Apartment removeKeyFromApartment(Apartment apartment, Key key) {
        if (apartment == null || key == null) {
            throw new IllegalArgumentException("Både lägenhet och nyckel måste anges");
        }
        
        if (apartment.getKeys() != null) {
            apartment.getKeys().remove(key);
        }
        
        key.setApartment(null);
        keyRepository.save(key);
        
        return apartment;
    }
} 