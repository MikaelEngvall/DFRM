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
                .apartmentId(null) // Kan inte koppla direkt eftersom vi bara har lägenhetsnamnet, inte ID
                .build();
        
        return taskRepository.save(task);
    }
    
    private void sendShowingConfirmation(Interest interest, LocalDateTime showingDateTime, String responseMessage) {
        log.info("Sending showing confirmation email to: {}", interest.getEmail());
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String formattedDateTime = showingDateTime.format(dateFormatter);
        
        String subject = "Bekräftelse av visningstid för " + interest.getApartment();
        
        String emailBody = responseMessage + "\n\n" +
                "Visningstid: " + formattedDateTime + "\n\n" +
                "Med vänliga hälsningar,\n" +
                interest.getReviewedBy().getFirstName() + " " + interest.getReviewedBy().getLastName();
        
        try {
            emailService.sendEmail(interest.getEmail(), subject, emailBody);
            log.info("Showing confirmation email sent successfully");
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
        String reviewedById = (String) requestData.get("reviewedById");
        String responseMessage = (String) requestData.get("responseMessage");
        String showingDateTimeStr = (String) requestData.get("showingDateTime");
        
        if (reviewedById == null || responseMessage == null || showingDateTimeStr == null) {
            throw new IllegalArgumentException("Missing required fields for scheduling showing");
        }
        
        User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
        
        LocalDateTime showingDateTime = LocalDateTime.parse(showingDateTimeStr);
        
        return scheduleShowing(id, reviewedBy, responseMessage, showingDateTime);
    }
} 