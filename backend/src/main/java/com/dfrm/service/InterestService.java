package com.dfrm.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dfrm.model.Interest;
import com.dfrm.model.Task;
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
        
        // Spara uppdaterad intresseanmälan innan den används för att skapa Showing
        Interest savedInterest = interestRepository.save(interest);
        
        // Skapa en Showing i den nya kollektionen
        try {
            showingService.createShowingFromInterest(savedInterest, reviewedBy, showingDateTime);
            log.info("Successfully created showing entry for interest ID: {}", savedInterest.getId());
        } catch (Exception e) {
            log.error("Failed to create showing entry: {}", e.getMessage(), e);
            // Fortsätt trots fel, uppgiften skapades fortfarande
        }
        
        // Skicka e-post till intresseanmälaren
        sendShowingConfirmation(savedInterest, showingDateTime, responseMessage);
        
        return savedInterest;
    }
    
    private Task createShowingTask(Interest interest, User assignedTo, LocalDateTime showingDateTime) {
        log.info("Creating showing task for interest ID: {}, assigned to: {}", interest.getId(), assignedTo.getId());
        
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String formattedDateTime = showingDateTime.format(dateFormatter);
            
            Task task = Task.builder()
                    .title("Visning: " + interest.getApartment())
                    .description(assignedTo.getFirstName() + " - " + interest.getApartment())
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

    // Modifiera processEmail-metoden för att förhindra dubbletter
    public void processEmail(Message message) throws Exception {
        // Existerande kod...
        
        try {
            // ... logga e-postmottagning ...
            
            // Extrahera meddelandetext från e-post
            String emailContent = extractEmail(message);
            String senderEmail = extractSenderEmail(message);
            
            if (emailContent == null || emailContent.trim().isEmpty()) {
                log.warn("Tomt e-postmeddelande - hoppas över bearbetning");
                return;
            }
            
            if (senderEmail == null || senderEmail.trim().isEmpty()) {
                log.warn("Ingen avsändaradress hittad - hoppas över bearbetning");
                return;
            }
            
            log.info("Kontrollerar om intresseanmälan redan finns för avsändare: {}", senderEmail);
            
            // Kontrollera om det redan finns en intresseanmälan med samma e-post och liknande meddelande
            List<Interest> existingInterests = interestRepository.findByEmail(senderEmail);
            
            if (!existingInterests.isEmpty()) {
                for (Interest existing : existingInterests) {
                    // Jämför meddelanden (ta bort whitespace för enklare jämförelse)
                    String cleanExistingMessage = existing.getMessage().replaceAll("\\s+", "");
                    String cleanNewMessage = emailContent.replaceAll("\\s+", "");
                    
                    if (cleanExistingMessage.equals(cleanNewMessage)) {
                        log.warn("Hittade en identisk intresseanmälan, hoppar över dubbletten från: {}", senderEmail);
                        return;
                    }
                    
                    // Alternativt, kontrollera om meddelandena överlappar betydligt (t.ex. om det är nästan identiskt)
                    if (cleanExistingMessage.length() > 30 && cleanNewMessage.length() > 30) {
                        // Om det är långa meddelanden, kontrollera om de är 80% lika
                        if (cleanExistingMessage.contains(cleanNewMessage.substring(0, (int)(cleanNewMessage.length() * 0.8))) || 
                            cleanNewMessage.contains(cleanExistingMessage.substring(0, (int)(cleanExistingMessage.length() * 0.8)))) {
                            log.warn("Hittade en liknande intresseanmälan, hoppar över möjlig dubblett från: {}", senderEmail);
                            return;
                        }
                    }
                }
            }
            
            // Fortsätt bearbetning om det inte är en dubblett
            // (existerande kod för att skapa intresseanmälan)
            Interest interest = Interest.builder()
                .name(extractName(message))
                .email(senderEmail)
                .phone(extractPhone(emailContent))
                .message(emailContent)
                .received(LocalDateTime.now())
                .status("NEW")
                .apartment(extractApartment(emailContent, message.getSubject()))
                .build();
            
            log.info("Sparar ny intresseanmälan från: {}", interest.getEmail());
            Interest savedInterest = interestRepository.save(interest);
            log.info("Sparad intresseanmälan med ID: {}", savedInterest.getId());
        } catch (Exception e) {
            log.error("Fel vid bearbetning av intresseanmälan: {}", e.getMessage(), e);
            throw e;
        }
    }
} 