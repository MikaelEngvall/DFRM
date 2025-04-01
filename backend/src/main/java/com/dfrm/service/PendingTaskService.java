package com.dfrm.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.model.PendingTask;
import com.dfrm.model.Task;
import com.dfrm.model.TaskStatus;
import com.dfrm.model.User;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.PendingTaskRepository;
import com.dfrm.repository.TaskRepository;
import com.dfrm.repository.TenantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PendingTaskService {
    
    private final PendingTaskRepository pendingTaskRepository;
    private final TaskRepository taskRepository;
    private final TenantRepository tenantRepository;
    private final ApartmentRepository apartmentRepository;
    private final EmailListener emailListener;
    private final GoogleTranslateClient translateClient;
    
    public List<PendingTask> getAllPendingTasks() {
        return pendingTaskRepository.findAll();
    }
    
    public Optional<PendingTask> getPendingTaskById(String id) {
        return pendingTaskRepository.findById(id);
    }
    
    public List<PendingTask> getTasksByRequestedTenant(String tenantId) {
        return pendingTaskRepository.findByRequestedByTenantId(tenantId);
    }
    
    public List<PendingTask> getTasksByRequestedApartment(String apartmentId) {
        return pendingTaskRepository.findByRequestedByApartmentId(apartmentId);
    }
    
    public List<PendingTask> findPendingTasksForReview() {
        // Hämta alla obehandlade uppgifter
        List<PendingTask> pendingTasks = pendingTaskRepository.findByReviewedByIsNull();
        
        // Filtrera bort intresseanmälningar
        List<PendingTask> filteredTasks = pendingTasks.stream()
            .filter(pendingTask -> {
                // Kontrollera uppgiftens status
                if (pendingTask.getStatus() != null && pendingTask.getStatus().equals("INTEREST")) {
                    return false;
                }
                
                // Kontrollera task-objektets status
                if (pendingTask.getTask() != null && 
                    pendingTask.getTask().getStatus() != null && 
                    pendingTask.getTask().getStatus().equals("INTEREST")) {
                    return false;
                }
                
                // Kontrollera beskrivning och e-post för intresserelaterad text
                boolean containsInterestKeyword = false;
                
                // Kontrollera e-postadressen
                if (pendingTask.getEmail() != null && 
                    pendingTask.getEmail().toLowerCase().contains("intresse")) {
                    containsInterestKeyword = true;
                }
                
                // Kontrollera beskrivningen
                if (pendingTask.getDescription() != null && 
                    pendingTask.getDescription().toLowerCase().contains("intresse")) {
                    containsInterestKeyword = true;
                }
                
                // Kontrollera task-objektets beskrivning
                if (pendingTask.getTask() != null && 
                    pendingTask.getTask().getDescription() != null && 
                    pendingTask.getTask().getDescription().toLowerCase().contains("intresse")) {
                    containsInterestKeyword = true;
                }
                
                // Behåll bara de som INTE matchar intressekriterier
                return !containsInterestKeyword;
            })
            .toList();
            
        log.info("Filtrerade bort {} intresseanmälningar från totalt {} väntande uppgifter", 
                 pendingTasks.size() - filteredTasks.size(), pendingTasks.size());
                 
        return filteredTasks;
    }
    
    public PendingTask createPendingTask(Task task, User requestedBy, String comments) {
        task.setStatus(TaskStatus.PENDING.name());
        Task savedTask = taskRepository.save(task);
        
        PendingTask pendingTask = new PendingTask();
        pendingTask.setTask(savedTask);
        pendingTask.setReviewedBy(requestedBy);
        pendingTask.setRequestedAt(LocalDateTime.now());
        pendingTask.setRequestComments(comments);
        
        return pendingTaskRepository.save(pendingTask);
    }
    
    public Task approveTask(String id, User reviewedBy, String reviewComments) {
        Optional<PendingTask> pendingTaskOpt = pendingTaskRepository.findById(id);
        if (pendingTaskOpt.isEmpty()) {
            throw new IllegalArgumentException("Pending task not found");
        }
        
        PendingTask pendingTask = pendingTaskOpt.get();
        pendingTask.setReviewedBy(reviewedBy);
        pendingTask.setReviewedAt(LocalDateTime.now());
        pendingTask.setReviewComments(reviewComments);
        pendingTask.setStatus("REVIEWED");
        
        Task task = pendingTask.getTask();
        task.setStatus(TaskStatus.REVIEWED.name());
        
        // Översätt beskrivningen till alla språk
        String sourceLanguage = translateClient.detectLanguage(task.getDescription());
        
        // Använd den nya metoden för att översätta till alla språk på en gång
        List<String> targetLanguages = List.of("sv", "en", "pl", "uk");
        Map<String, String> translations = translateClient.translateToMultipleLanguages(
            task.getDescription(), 
            sourceLanguage, 
            targetLanguages
        );
        
        task.setTranslations(translations);
        
        // Spara ändringarna
        Task savedTask = taskRepository.save(task);
        pendingTaskRepository.save(pendingTask);
        
        if (savedTask.getTranslations() == null) {
            log.warn("\u001B[33mInga översättningar sparade!\u001B[0m");
        }
        
        return savedTask;
    }
    
    public PendingTask rejectTask(String id, User reviewedBy, String reviewComments) {
        Optional<PendingTask> pendingTaskOpt = pendingTaskRepository.findById(id);
        if (pendingTaskOpt.isEmpty()) {
            throw new IllegalArgumentException("Pending task not found");
        }
        
        PendingTask pendingTask = pendingTaskOpt.get();
        pendingTask.setReviewedBy(reviewedBy);
        pendingTask.setReviewedAt(LocalDateTime.now());
        pendingTask.setReviewComments(reviewComments);
        
        Task task = pendingTask.getTask();
        task.setStatus(TaskStatus.REJECTED.name());
        taskRepository.save(task);
        
        return pendingTaskRepository.save(pendingTask);
    }
    
    /**
     * Konverterar en e-postrapport till en Task
     * 
     * @param emailReportId ID för e-postrapporten (PendingTask)
     * @param newTask Den nya uppgiften som ska skapas
     * @param reviewedBy Användaren som konverterar uppgiften
     * @return Den skapade uppgiften
     */
    public Task convertEmailReportToTask(String emailReportId, Task newTask, User reviewedBy) {
        // Hitta e-postrapporten
        PendingTask emailReport = pendingTaskRepository.findById(emailReportId)
            .orElseThrow(() -> new IllegalArgumentException("Kan inte hitta e-postrapport med ID: " + emailReportId));
        
        // Säkerställ att uppgiftens data är korrekt
        newTask.setAssignedByUserId(reviewedBy.getId());
        
        // Använd befintliga ID:n från e-postrapporten
        if ((newTask.getTenantId() == null || newTask.getTenantId().isEmpty()) && emailReport.getTenantId() != null) {
            newTask.setTenantId(emailReport.getTenantId());
        }
        
        if ((newTask.getApartmentId() == null || newTask.getApartmentId().isEmpty()) && emailReport.getApartmentId() != null) {
            newTask.setApartmentId(emailReport.getApartmentId());
        }
        
        // Sätt standardvärden för den nya uppgiften om de inte är angivna
        if (newTask.getStatus() == null || newTask.getStatus().isEmpty()) {
            newTask.setStatus("NEW");
        }
        
        if (newTask.getPriority() == null || newTask.getPriority().isEmpty()) {
            newTask.setPriority("MEDIUM");
        }
        
        // Om uppgiften saknar beskrivning, använd beskrivningen från e-postrapporten
        if ((newTask.getDescription() == null || newTask.getDescription().isEmpty()) && 
            emailReport.getDescription() != null && !emailReport.getDescription().isEmpty()) {
            newTask.setDescription(emailReport.getDescription());
        }
        
        // Om titeln inte är angiven, skapa en baserad på adress eller namn från e-postrapporten
        if (newTask.getTitle() == null || newTask.getTitle().isEmpty()) {
            StringBuilder titleBuilder = new StringBuilder();
            
            if (emailReport.getAddress() != null && !emailReport.getAddress().isEmpty()) {
                titleBuilder.append(emailReport.getAddress().trim());
                if (emailReport.getApartment() != null && !emailReport.getApartment().isEmpty()) {
                    titleBuilder.append(" Lgh ").append(emailReport.getApartment().trim());
                }
                newTask.setTitle(titleBuilder.toString());
            }
            else if (emailReport.getName() != null && !emailReport.getName().isEmpty()) {
                newTask.setTitle("Felanmälan från " + emailReport.getName().trim());
            }
            else if (emailReport.getEmail() != null && !emailReport.getEmail().isEmpty()) {
                newTask.setTitle("Felanmälan från " + emailReport.getEmail().trim());
            }
            else {
                newTask.setTitle("Felanmälan " + LocalDate.now());
            }
        }
        
        // Lägg till kontaktinformation i beskrivningen om den finns
        if (emailReport.getName() != null || emailReport.getEmail() != null || emailReport.getPhone() != null) {
            StringBuilder contactInfo = new StringBuilder();
            contactInfo.append("\n\n--- Kontaktinformation ---\n");
            
            if (emailReport.getName() != null && !emailReport.getName().isEmpty()) {
                contactInfo.append("Namn: ").append(emailReport.getName()).append("\n");
            }
            
            if (emailReport.getEmail() != null && !emailReport.getEmail().isEmpty()) {
                contactInfo.append("E-post: ").append(emailReport.getEmail()).append("\n");
            }
            
            if (emailReport.getPhone() != null && !emailReport.getPhone().isEmpty()) {
                contactInfo.append("Telefon: ").append(emailReport.getPhone()).append("\n");
            }
            
            String finalDescription = (newTask.getDescription() != null ? newTask.getDescription() : "") + contactInfo.toString();
            newTask.setDescription(finalDescription);
        }
        
        // Översätt beskrivningen till alla språk
        String sourceLanguage = translateClient.detectLanguage(newTask.getDescription());
        
        // Använd den nya metoden för att översätta till alla språk på en gång
        List<String> targetLanguages = List.of("sv", "en", "pl", "uk");
        Map<String, String> translations = translateClient.translateToMultipleLanguages(
            newTask.getDescription(), 
            sourceLanguage, 
            targetLanguages
        );
        
        newTask.setTranslations(translations);
        
        // Sätt vem som tilldelade uppgiften (den som godkände e-postrapporten)
        newTask.setAssignedByUserId(reviewedBy.getId());
        
        // Spara uppgiften
        Task savedTask = taskRepository.save(newTask);
        
        // Uppdatera e-postrapporten som granskad och konverterad
        emailReport.setReviewedBy(reviewedBy);
        emailReport.setReviewedAt(LocalDateTime.now());
        emailReport.setStatus("CONVERTED");
        emailReport.setTask(savedTask);
        pendingTaskRepository.save(emailReport);
        
        return savedTask;
    }
    
    /**
     * Avvisar en e-postrapport
     * 
     * @param emailReportId ID för e-postrapporten
     * @param reviewedBy Användaren som avvisar
     * @param reason Anledning till avvisning
     * @return Den uppdaterade e-postrapporten
     */
    public PendingTask rejectEmailReport(String emailReportId, User reviewedBy, String reason) {
        Optional<PendingTask> emailReportOpt = pendingTaskRepository.findById(emailReportId);
        if (emailReportOpt.isEmpty()) {
            throw new IllegalArgumentException("E-postrapport hittades inte");
        }
        
        PendingTask emailReport = emailReportOpt.get();
        emailReport.setStatus("REJECTED");
        emailReport.setReviewedBy(reviewedBy);
        emailReport.setReviewedAt(LocalDateTime.now());
        emailReport.setReviewComments(reason);
        
        PendingTask savedReport = pendingTaskRepository.save(emailReport);
        log.info("Avvisade e-postrapport med ID: {}", emailReport.getId());
        
        return savedReport;
    }
    
    public List<PendingTask> findApprovedTasks() {
        // Hämta alla uppgifter istället för att filtrera på reviewedBy
        List<PendingTask> allTasks = pendingTaskRepository.findAll();
        System.out.println("Hittade totalt " + allTasks.size() + " uppgifter");
        
        // Logga varje uppgift för att se vad som finns
        allTasks.forEach(pendingTask -> {
            System.out.println("PendingTask ID: " + pendingTask.getId());
            System.out.println("Task: " + (pendingTask.getTask() != null ? pendingTask.getTask().getId() : "null"));
            System.out.println("Status: " + (pendingTask.getTask() != null ? pendingTask.getTask().getStatus() : "null"));
            System.out.println("ReviewedBy: " + (pendingTask.getReviewedBy() != null ? pendingTask.getReviewedBy().getId() : "null"));
        });
        
        // Filtrera efter uppgifter med status = APPROVED
        List<PendingTask> approvedTasks = allTasks.stream()
            .filter(pendingTask -> pendingTask.getTask() != null && 
                    "REVIEWED".equals(pendingTask.getTask().getStatus()))
            .toList();

        
        return approvedTasks;
    }
    
    public void deletePendingTask(String id) {
        pendingTaskRepository.deleteById(id);
    }
    
    /**
     * Räknar antalet väntande uppgifter med given status
     * 
     * @param status Status att söka efter
     * @return Antal uppgifter
     */
    public long countByStatus(String status) {
        return pendingTaskRepository.countByStatus(status);
    }
    
    /**
     * Hämtar alla väntande uppgifter med given status
     * 
     * @param status Status att söka efter
     * @return Lista med väntande uppgifter
     */
    public List<PendingTask> findPendingTasksByStatus(String status) {
        return pendingTaskRepository.findByStatus(status);
    }
    
    public void checkEmails() {
        log.info("Manuell läsning av felanmälnings-e-post initierad");
        emailListener.checkEmails();
        log.info("Manuell läsning av felanmälnings-e-post slutförd");
    }
} 