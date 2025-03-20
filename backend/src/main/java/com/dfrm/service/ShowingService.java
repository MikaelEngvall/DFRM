package com.dfrm.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Interest;
import com.dfrm.model.Showing;
import com.dfrm.model.User;
import com.dfrm.repository.InterestRepository;
import com.dfrm.repository.ShowingRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ShowingService {
    
    private final ShowingRepository showingRepository;
    private final InterestRepository interestRepository;
    
    public ShowingService(ShowingRepository showingRepository, InterestRepository interestRepository) {
        this.showingRepository = showingRepository;
        this.interestRepository = interestRepository;
    }
    
    public List<Showing> getAllShowings() {
        return showingRepository.findAll();
    }
    
    public Optional<Showing> getShowingById(String id) {
        return showingRepository.findById(id);
    }
    
    public List<Showing> getShowingsByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        return showingRepository.findByDateTimeBetween(start, end);
    }
    
    public List<Showing> getShowingsByAssignedUser(String userId) {
        return showingRepository.findByAssignedToId(userId);
    }
    
    public Showing createShowing(Showing showing) {
        // Sätt skapandedatum
        showing.setCreatedAt(LocalDateTime.now());
        showing.setUpdatedAt(LocalDateTime.now());
        
        // Sätt status till schemalagd om det inte redan är satt
        if (showing.getStatus() == null) {
            showing.setStatus("SCHEDULED");
        }
        
        log.info("Skapar ny visning för: {}, datum: {}", showing.getApartmentAddress(), showing.getDateTime());
        return showingRepository.save(showing);
    }
    
    public Showing createShowingFromInterest(Interest interest, User assignedTo, LocalDateTime dateTime) {
        if (interest == null) {
            throw new IllegalArgumentException("Interest kan inte vara null");
        }
        
        Showing showing = Showing.builder()
                .title("Visning: " + interest.getApartment())
                .description(assignedTo.getFirstName() + " - " + interest.getApartment())
                .dateTime(dateTime)
                .status("SCHEDULED")
                .apartmentAddress(interest.getApartment())
                .assignedTo(assignedTo)
                .relatedInterest(interest)
                .contactName(interest.getName())
                .contactEmail(interest.getEmail())
                .contactPhone(interest.getPhone())
                .createdBy(assignedTo)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        log.info("Skapar visning från intresse: {}, tilldelad: {}, datum: {}", 
            interest.getId(), assignedTo.getFirstName(), dateTime);
        
        return showingRepository.save(showing);
    }
    
    public Showing createShowingFromInterest(String interestId, User assignedTo, LocalDateTime dateTime) {
        Interest interest = interestRepository.findById(interestId)
            .orElseThrow(() -> new IllegalArgumentException("Intresse hittades inte med ID: " + interestId));
        
        return createShowingFromInterest(interest, assignedTo, dateTime);
    }
    
    public Showing updateShowing(String id, Showing updatedShowing) {
        return showingRepository.findById(id)
                .map(showing -> {
                    // Uppdatera fält
                    showing.setTitle(updatedShowing.getTitle());
                    showing.setDescription(updatedShowing.getDescription());
                    showing.setDateTime(updatedShowing.getDateTime());
                    showing.setStatus(updatedShowing.getStatus());
                    showing.setApartmentAddress(updatedShowing.getApartmentAddress());
                    showing.setApartmentDetails(updatedShowing.getApartmentDetails());
                    showing.setAssignedTo(updatedShowing.getAssignedTo());
                    showing.setNotes(updatedShowing.getNotes());
                    showing.setUpdatedAt(LocalDateTime.now());
                    
                    return showingRepository.save(showing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Visning hittades inte med ID: " + id));
    }
    
    public Showing updateShowingStatus(String id, String status) {
        return showingRepository.findById(id)
                .map(showing -> {
                    showing.setStatus(status);
                    showing.setUpdatedAt(LocalDateTime.now());
                    log.info("Uppdaterar status för visning: {}, ny status: {}", id, status);
                    return showingRepository.save(showing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Visning hittades inte med ID: " + id));
    }
    
    public void deleteShowing(String id) {
        showingRepository.deleteById(id);
        log.info("Raderar visning med ID: {}", id);
    }
    
    public List<Showing> getActiveShowings() {
        return showingRepository.findByStatus("SCHEDULED");
    }
} 