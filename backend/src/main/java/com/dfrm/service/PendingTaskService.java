package com.dfrm.service;

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
    
    public List<PendingTask> findPendingTasksByRequestedBy(String userId) {
        return pendingTaskRepository.findByRequestedById(userId);
    }
    
    public List<PendingTask> findPendingTasksForReview() {
        return pendingTaskRepository.findByReviewedByIsNull();
    }
    
    public PendingTask createPendingTask(Task task, User requestedBy, String comments) {
        task.setStatus(TaskStatus.PENDING.name());
        Task savedTask = taskRepository.save(task);
        
        PendingTask pendingTask = new PendingTask();
        pendingTask.setTask(savedTask);
        pendingTask.setRequestedBy(requestedBy);
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
        
        Task task = pendingTask.getTask();
        task.setStatus(TaskStatus.APPROVED.name());
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
        Optional<PendingTask> emailReportOpt = pendingTaskRepository.findById(emailReportId);
        if (emailReportOpt.isEmpty()) {
            throw new IllegalArgumentException("E-postrapport hittades inte");
        }
        
        PendingTask emailReport = emailReportOpt.get();
        
        // Extrahera data från e-postmeddelandet (requestComments)
        String emailContent = emailReport.getRequestComments();
        log.info("Extraherar information från e-postrapport: {}", emailReport.getId());
        
        if (emailContent != null) {
            try {
                // Extrahera e-postadress
                String email = extractValue(emailContent, "E-post:", true);
                log.info("Extraherad e-postadress: {}", email);
                
                // Extrahera adress
                String address = extractValue(emailContent, "Adress:", true);
                log.info("Extraherad adress: {}", address);
                
                // Extrahera lägenhetsnummer
                String apartmentNumber = extractValue(emailContent, "Lägenhet:", true);
                log.info("Extraherat lägenhetsnummer: {}", apartmentNumber);
                
                // Extrahera telefonnummer
                String phone = extractValue(emailContent, "Telefon:", true);
                log.info("Extraherat telefonnummer: {}", phone);
                
                // Extrahera beskrivning
                String description = extractValue(emailContent, "Beskrivning:", false);
                log.info("Extraherad beskrivning: {}", description);
                
                // Skapa titel baserad på adress och lägenhetsnummer
                String title = address + " lgh " + apartmentNumber;
                newTask.setTitle(title);
                newTask.setDescription(description);
                
                // Om telefonnumret finns, lägg till i beskrivningen
                if (phone != null && !phone.isEmpty()) {
                    newTask.setDescription(description + "\n\nTelefon: " + phone);
                }
                
                // Försök hitta hyresgäst via e-postadressen
                if (email != null && !email.isEmpty()) {
                    try {
                        // Använd TenantRepository för att söka efter hyresgäst
                        Optional<com.dfrm.model.Tenant> tenantOpt = tenantRepository.findByEmail(email);
                        
                        if (tenantOpt.isPresent()) {
                            com.dfrm.model.Tenant tenant = tenantOpt.get();
                            log.info("Hittade hyresgäst: {} {}", tenant.getFirstName(), tenant.getLastName());
                            
                            // Sätt tenant ID och apartment ID från hyresgästen
                            newTask.setTenantId(tenant.getId());
                            
                            if (tenant.getApartment() != null) {
                                newTask.setApartmentId(tenant.getApartment().getId());
                                log.info("Satte lägenhet från hyresgäst: {}", tenant.getApartment().getId());
                            }
                        } else {
                            log.info("Ingen hyresgäst hittades med e-postadressen: {}", email);
                            
                            // Försök hitta lägenhet baserat på adress och lägenhetsnummer
                            if (address != null && !address.isEmpty() && apartmentNumber != null && !apartmentNumber.isEmpty()) {
                                try {
                                    // Använd ApartmentRepository för att söka efter lägenhet
                                    Optional<com.dfrm.model.Apartment> apartmentOpt = 
                                        apartmentRepository.findByStreetAddressAndApartmentNumber(address, apartmentNumber);
                                    
                                    if (apartmentOpt.isPresent()) {
                                        com.dfrm.model.Apartment apartment = apartmentOpt.get();
                                        log.info("Hittade lägenhet: {} {}, {}",
                                                apartment.getStreet(), apartment.getNumber(), apartment.getApartmentNumber());
                                        
                                        // Sätt apartment ID
                                        newTask.setApartmentId(apartment.getId());
                                    } else {
                                        log.info("Ingen lägenhet hittades med adress: {} och lägenhetsnummer: {}", 
                                                address, apartmentNumber);
                                    }
                                } catch (Exception e) {
                                    log.error("Fel vid sökning efter lägenhet: {}", e.getMessage(), e);
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("Fel vid sökning efter hyresgäst: {}", e.getMessage(), e);
                    }
                }
            } catch (Exception e) {
                log.error("Fel vid extrahering av information från e-postrapport: {}", e.getMessage(), e);
            }
        }
        
        // Spara uppgiften
        Task savedTask = taskRepository.save(newTask);
        log.info("Skapade ny uppgift med ID: {}", savedTask.getId());
        
        // Uppdatera e-postrapporten
        emailReport.setStatus("CONVERTED");
        emailReport.setTask(savedTask);
        emailReport.setReviewedBy(reviewedBy);
        emailReport.setReviewedAt(LocalDateTime.now());
        emailReport.setReviewComments("Konverterad till uppgift");
        
        pendingTaskRepository.save(emailReport);
        log.info("Uppdaterade e-postrapport med ID: {} till status CONVERTED", emailReport.getId());
        
        return savedTask;
    }
    
    /**
     * Extraherar ett värde från en sträng baserat på en nyckel
     * 
     * @param content Innehållet att söka i
     * @param key Nyckeln att söka efter
     * @param untilNextSpace Om true, extraheras värdet till nästa mellanslag, annars till slutet av strängen
     * @return Det extraherade värdet eller null om nyckeln inte hittas
     */
    private String extractValue(String content, String key, boolean untilNextSpace) {
        int startIndex = content.indexOf(key);
        if (startIndex == -1) {
            return null;
        }
        
        startIndex += key.length();
        String remaining = content.substring(startIndex).trim();
        
        if (untilNextSpace) {
            // Extrahera till nästa mellanslag
            int endIndex = remaining.indexOf(" ");
            if (endIndex == -1) {
                return remaining;
            }
            return remaining.substring(0, endIndex).trim();
        } else {
            // Extrahera till "---" eller slutet om "---" inte hittas
            int endIndex = remaining.indexOf("---");
            if (endIndex == -1) {
                return remaining.trim();
            }
            return remaining.substring(0, endIndex).trim();
        }
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