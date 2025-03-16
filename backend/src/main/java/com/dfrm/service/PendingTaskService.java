package com.dfrm.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

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
        return pendingTaskRepository.findByReviewedByIsNull();
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
        
        // Uppdatera granskningsinformation
        pendingTask.setReviewedBy(reviewedBy);
        pendingTask.setReviewedAt(LocalDateTime.now());
        pendingTask.setReviewComments(reviewComments);
        pendingTask.setStatus("REVIEWED");
        
        // Uppdatera uppgiftens status
        Task task = pendingTask.getTask();
        task.setStatus(TaskStatus.APPROVED.name());
        
        // Spara ändringarna
        Task savedTask = taskRepository.save(task);
        pendingTaskRepository.save(pendingTask);
        
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
        log.info("Konverterar e-postrapport {} till uppgift", emailReportId);
        
        // Hitta e-postrapporten
        PendingTask emailReport = pendingTaskRepository.findById(emailReportId)
            .orElseThrow(() -> new IllegalArgumentException("Kan inte hitta e-postrapport med ID: " + emailReportId));
        
        // Säkerställ att uppgiftens data är korrekt
        newTask.setAssignedByUserId(reviewedBy.getId());
        
        // Använd befintliga ID:n från e-postrapporten
        if ((newTask.getTenantId() == null || newTask.getTenantId().isEmpty()) && emailReport.getTenantId() != null) {
            log.info("Använder tenantId från e-postrapporten: {}", emailReport.getTenantId());
            newTask.setTenantId(emailReport.getTenantId());
        }
        
        if ((newTask.getApartmentId() == null || newTask.getApartmentId().isEmpty()) && emailReport.getApartmentId() != null) {
            log.info("Använder apartmentId från e-postrapporten: {}", emailReport.getApartmentId());
            newTask.setApartmentId(emailReport.getApartmentId());
        }
        
        // Sätt standardvärden för den nya uppgiften om de inte är angivna
        if (newTask.getStatus() == null || newTask.getStatus().isEmpty()) {
            newTask.setStatus("NEW");
        }
        
        if (newTask.getPriority() == null || newTask.getPriority().isEmpty()) {
            newTask.setPriority("MEDIUM");
        }
        
        if (newTask.getDueDate() == null) {
            // Sätt standard förfallodatum till 7 dagar från nu
            newTask.setDueDate(LocalDate.now().plusDays(7));
        }
        
        // Om description är tom, använd beskrivningen från emailReport
        if (newTask.getDescription() == null || newTask.getDescription().isEmpty()) {
            newTask.setDescription(emailReport.getDescription());
            log.info("Använde beskrivning från e-postrapporten");
        }
        
        // Sätt standardvärden för den nya uppgiften om de inte är angivna
        if (newTask.getTitle() == null || newTask.getTitle().isEmpty()) {
            if (emailReport.getAddress() != null && emailReport.getApartment() != null) {
                newTask.setTitle(emailReport.getAddress() + " lgh " + emailReport.getApartment());
            } else if (emailReport.getAddress() != null) {
                newTask.setTitle(emailReport.getAddress());
            } else {
                newTask.setTitle("Felanmälan från " + emailReport.getName());
            }
        }
        
        // Överför kontaktinformation
        StringBuilder contactInfo = new StringBuilder();
        if (emailReport.getName() != null && !emailReport.getName().isEmpty()) {
            contactInfo.append("Kontaktperson: ").append(emailReport.getName()).append("\n");
        }
        if (emailReport.getEmail() != null && !emailReport.getEmail().isEmpty()) {
            contactInfo.append("E-post: ").append(emailReport.getEmail()).append("\n");
        }
        if (emailReport.getPhone() != null && !emailReport.getPhone().isEmpty()) {
            contactInfo.append("Telefon: ").append(emailReport.getPhone()).append("\n");
        }
        
        // Lägg till kontaktinformation om det finns någon
        if (contactInfo.length() > 0) {
            newTask.setDescription(
                contactInfo.toString() + 
                "\n---\n" + 
                (newTask.getDescription() != null ? newTask.getDescription() : "")
            );
        }
        
        // Sätt vem som tilldelade uppgiften (den som godkände e-postrapporten)
        newTask.setAssignedByUserId(reviewedBy.getId());
        
        // Spara uppgiften
        Task savedTask = taskRepository.save(newTask);
        log.info("Sparade ny uppgift med ID: {} från e-postrapport: {}", savedTask.getId(), emailReportId);
        
        // Uppdatera e-postrapporten som granskad och konverterad
        emailReport.setReviewedBy(reviewedBy);
        emailReport.setReviewedAt(LocalDateTime.now());
        emailReport.setStatus("CONVERTED");
        emailReport.setTask(savedTask);
        pendingTaskRepository.save(emailReport);
        log.info("Uppdaterade e-postrapport {} som konverterad", emailReportId);
        
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
                    "APPROVED".equals(pendingTask.getTask().getStatus()))
            .toList();
        
        System.out.println("Efter filtrering: " + approvedTasks.size() + " godkända uppgifter");
        
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
} 