package com.dfrm.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Interest;
import com.dfrm.model.Task;
import com.dfrm.model.User;
import com.dfrm.repository.InterestRepository;
import com.dfrm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterestService {
    
    private final InterestRepository interestRepository;
    private final InterestEmailListener interestEmailListener;
    private final TaskRepository taskRepository;
    private final EmailService emailService;
    private final UserService userService;
    
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
        log.info("Scheduling showing for interest ID: {}, by user: {}, at: {}", id, reviewedBy.getId(), showingDateTime);
        
        Interest interest = interestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found"));
        
        if (!"NEW".equals(interest.getStatus())) {
            throw new IllegalArgumentException("Interest is already processed");
        }
        
        // Uppdatera intresseanmälan
        interest.setStatus("SHOWING_SCHEDULED");
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setShowingDateTime(showingDateTime);
        interest.setResponseMessage(responseMessage);
        
        // Skapa en uppgift för visningen
        Task showingTask = createShowingTask(interest, reviewedBy, showingDateTime);
        interest.setRelatedTask(showingTask);
        
        // Spara uppdaterad intresseanmälan
        Interest savedInterest = interestRepository.save(interest);
        
        // Skicka e-post till intresseanmälaren
        sendShowingConfirmation(interest, showingDateTime, responseMessage);
        
        return savedInterest;
    }
    
    private Task createShowingTask(Interest interest, User assignedTo, LocalDateTime showingDateTime) {
        log.info("Creating showing task for interest ID: {}, assigned to: {}", interest.getId(), assignedTo.getId());
        
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String formattedDateTime = showingDateTime.format(dateFormatter);
            
            Task task = Task.builder()
                    .title("Visning: " + interest.getApartment())
                    .description("Visning för " + interest.getName() + " på " + formattedDateTime)
                    .assignedToUserId(assignedTo.getId())
                    .assignedByUserId(assignedTo.getId())
                    .dueDate(showingDateTime.toLocalDate())
                    .status("PENDING")
                    .priority("MEDIUM")
                    .build();
            
            Task savedTask = taskRepository.save(task);
            log.info("Successfully created showing task with ID: {}", savedTask.getId());
            return savedTask;
        } catch (Exception e) {
            log.error("Failed to create showing task: {}", e.getMessage(), e);
            throw new RuntimeException("Kunde inte skapa visningsuppgift: " + e.getMessage(), e);
        }
    }
    
    private void sendShowingConfirmation(Interest interest, LocalDateTime showingDateTime, String responseMessage) {
        log.info("Sending showing confirmation email to: {}", interest.getEmail());
        
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String formattedDateTime = showingDateTime.format(dateFormatter);
            
            String subject = "Bekräftelse av visningstid för " + interest.getApartment();
            
            String emailBody = responseMessage + "\n\n" +
                    "Visningstid: " + formattedDateTime + "\n\n" +
                    "Med vänliga hälsningar,\n" +
                    interest.getReviewedBy().getFirstName() + " " + interest.getReviewedBy().getLastName();
            
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