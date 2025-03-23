package com.dfrm.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dfrm.model.Interest;
import com.dfrm.model.User;
import com.dfrm.repository.InterestRepository;
import com.dfrm.repository.TaskRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class InterestService {
    
    private final InterestRepository interestRepository;
    private final InterestEmailListener interestEmailListener;
    private final TaskRepository taskRepository;
    private final EmailService emailService;
    private final UserService userService;
    
    @Autowired
    private ShowingService showingService;
    
    @Autowired
    public InterestService(
            InterestRepository interestRepository,
            InterestEmailListener interestEmailListener,
            TaskRepository taskRepository,
            EmailService emailService,
            UserService userService) {
        this.interestRepository = interestRepository;
        this.interestEmailListener = interestEmailListener;
        this.taskRepository = taskRepository;
        this.emailService = emailService;
        this.userService = userService;
    }
    
    public List<Interest> getAllInterests() {
        return interestRepository.findAll();
    }
    
    public Optional<Interest> getInterestById(String id) {
        return interestRepository.findById(id);
    }
    
    public List<Interest> findInterestsForReview() {
        return interestRepository.findByStatusOrderByReceivedDesc("NEW");
    }
    
    public List<Interest> findReviewedInterests() {
        return interestRepository.findByStatusNotOrderByReviewedAtDesc("NEW");
    }
    
    public Interest reviewInterest(String id, User reviewedBy, String comment) {
        Interest interest = interestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found"));
        
        if (!"NEW".equals(interest.getStatus())) {
            throw new IllegalArgumentException("Interest is already reviewed");
        }
        
        interest.setStatus("REVIEWED");
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setReviewComments(comment);
        
        return interestRepository.save(interest);
    }
    
    public Interest rejectInterest(String id, User reviewedBy, String comment) {
        Interest interest = interestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found"));
        
        if (!"NEW".equals(interest.getStatus())) {
            throw new IllegalArgumentException("Interest is already reviewed");
        }
        
        interest.setStatus("REJECTED");
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setReviewComments(comment);
        
        return interestRepository.save(interest);
    }
    
    public Interest scheduleShowing(String id, User reviewedBy, String responseMessage, LocalDateTime showingDateTime) {
        Interest interest = interestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found with ID: " + id));
        
        if (!"NEW".equals(interest.getStatus())) {
            throw new IllegalArgumentException("Interest is already processed");
        }
        
        // Uppdatera intresseanmälan
        interest.setStatus("SHOWING_SCHEDULED");
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setShowingDateTime(showingDateTime);
        interest.setResponseMessage(responseMessage);
        
        // Spara uppdaterad intresseanmälan innan den används för att skapa Showing
        Interest savedInterest = interestRepository.save(interest);
        
        // Skapa en Showing i den nya kollektionen
        try {
            showingService.createShowingFromInterest(savedInterest, reviewedBy, showingDateTime);
            log.info("Successfully created showing entry for interest ID: {}", savedInterest.getId());
        } catch (Exception e) {
            log.error("Failed to create showing entry: {}", e.getMessage(), e);
            // Fortsätt trots fel
        }
        
        // Skicka e-post till intresseanmälaren
        sendShowingConfirmation(savedInterest, showingDateTime, responseMessage);
        
        return savedInterest;
    }
    
    private void sendShowingConfirmation(Interest interest, LocalDateTime showingDateTime, String responseMessage) {
        log.info("Sending showing confirmation email to: {}", interest.getEmail());
        
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd 'kl.' HH:mm");
            String formattedDateTime = showingDateTime.format(dateFormatter);
            
            String subject = "Bekräftelse av visningstid för " + interest.getApartment();
            
            // Kontrollera om responseMessage redan innehåller visningstiden
            boolean containsDateTime = responseMessage.contains("Visningstid:") || 
                                      responseMessage.contains(formattedDateTime);
            
            // Bygg e-postmeddelandet
            String emailBody;
            if (containsDateTime) {
                // Om visningstiden redan finns i meddelandet, använd bara meddelandet som det är
                emailBody = responseMessage + "\n\n" +
                        "Med vänliga hälsningar,\n" +
                        "Duggals Fastigheter";
            } else {
                // Annars lägg till visningstiden som tidigare
                emailBody = responseMessage + "\n\n" +
                        "Visningstid: " + formattedDateTime + "\n\n" +
                        "Med vänliga hälsningar,\n" +
                        "Duggals Fastigheter";
            }
            
            // Använd intresse-e-post för att skicka bekräftelse
            emailService.sendInterestEmail(interest.getEmail(), subject, emailBody);
            log.info("Showing confirmation email sent successfully to: {}", interest.getEmail());
        } catch (Exception e) {
            log.error("Failed to send showing confirmation email: {}", e.getMessage(), e);
            // Vi fortsätter trots e-postfel - uppgiften och bokningen finns fortfarande
        }
    }
    
    public void deleteInterest(String id) {
        interestRepository.deleteById(id);
    }
    
    public long countByStatus(String status) {
        return interestRepository.countByStatus(status);
    }
    
    public void checkEmails() {
        log.info("Manuell läsning av intresse-e-post initierad");
        interestEmailListener.checkEmails();
        log.info("Manuell läsning av intresse-e-post slutförd");
    }
    
    // Helper method for mapping from request DTO
    public Interest scheduleShowing(String id, Map<String, Object> requestData) {
        try {
            String reviewedById = (String) requestData.get("reviewedById");
            String responseMessage = (String) requestData.get("responseMessage");
            String showingDateTimeStr = (String) requestData.get("showingDateTime");
            
            log.info("Scheduling showing for interest ID: {}, reviewedById: {}, showingDateTime: {}", 
                id, reviewedById, showingDateTimeStr);
            
            // Logga aktuella behörigheter
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                log.info("Aktuell användare: {}, behörigheter: {}", 
                    auth.getName(), 
                    auth.getAuthorities().stream()
                        .map(a -> a.getAuthority())
                        .collect(java.util.stream.Collectors.joining(", ")));
            } else {
                log.warn("Ingen autentisering hittad i SecurityContext");
            }
            
            if (reviewedById == null || responseMessage == null || showingDateTimeStr == null) {
                log.error("Missing required fields for scheduling showing. reviewedById: {}, responseMessage: {}, showingDateTime: {}", 
                    reviewedById != null ? "present" : "missing", 
                    responseMessage != null ? "present" : "missing", 
                    showingDateTimeStr != null ? "present" : "missing");
                throw new IllegalArgumentException("Saknas obligatoriska fält för bokning av visning");
            }
            
            // Försök hämta användare
            Optional<User> userOpt = userService.getUserById(reviewedById);
            if (userOpt.isEmpty()) {
                log.error("User not found for ID: {}", reviewedById);
                throw new IllegalArgumentException("Användaren med ID " + reviewedById + " hittades inte");
            }
            User reviewedBy = userOpt.get();
            
            log.info("Found user: {}, with role: {}", reviewedBy.getEmail(), reviewedBy.getRole());
            
            LocalDateTime showingDateTime;
            try {
                showingDateTime = LocalDateTime.parse(showingDateTimeStr);
            } catch (Exception e) {
                log.error("Invalid date format for showingDateTime: {}", showingDateTimeStr, e);
                throw new IllegalArgumentException("Ogiltigt datumformat: " + showingDateTimeStr);
            }
            
            log.info("All validation passed, proceeding to schedule showing");
            return scheduleShowing(id, reviewedBy, responseMessage, showingDateTime);
        } catch (Exception e) {
            log.error("Error scheduling showing: {}", e.getMessage(), e);
            throw e;
        }
    }
} 