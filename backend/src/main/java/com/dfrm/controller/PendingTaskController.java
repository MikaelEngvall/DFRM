package com.dfrm.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Apartment;
import com.dfrm.model.PendingTask;
import com.dfrm.model.Task;
import com.dfrm.model.Tenant;
import com.dfrm.model.User;
import com.dfrm.repository.PendingTaskRepository;
import com.dfrm.service.ApartmentService;
import com.dfrm.service.PendingTaskService;
import com.dfrm.service.TaskService;
import com.dfrm.service.TenantService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pending-tasks")
@RequiredArgsConstructor
public class PendingTaskController {

    private final PendingTaskService pendingTaskService;
    private final TaskService taskService;
    private final UserService userService;
    private final PendingTaskRepository pendingTaskRepository;
    private final TenantService tenantService;
    private final ApartmentService apartmentService;

    @GetMapping
    public List<PendingTask> getAllPendingTasks() {
        return pendingTaskService.getAllPendingTasks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PendingTask> getPendingTaskById(@PathVariable String id) {
        return pendingTaskService.getPendingTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/requested-by/{userId}")
    public List<PendingTask> getPendingTasksByRequestedBy(@PathVariable String userId) {
        return pendingTaskService.findPendingTasksByRequestedBy(userId);
    }

    @GetMapping("/for-review")
    public List<PendingTask> getPendingTasksForReview() {
        return pendingTaskService.findPendingTasksForReview();
    }

    @GetMapping("/approved")
    public ResponseEntity<List<PendingTask>> getApprovedTasks() {
        return ResponseEntity.ok(pendingTaskRepository.findByReviewedByIsNotNullOrderByReviewedAtDesc());
    }

    @PostMapping("/request-approval")
    public ResponseEntity<PendingTask> requestApproval(
            @RequestBody Map<String, String> requestData) {
        
        String taskId = requestData.get("taskId");
        String requestedById = requestData.get("requestedById");
        String comment = requestData.get("comment");
        
        if (taskId == null || requestedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Task task = taskService.getTaskById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid task ID"));
            
            // Hämta requestedBy användare
            User requestedBy = userService.getUserById(requestedById)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
            
            PendingTask pendingTask = pendingTaskService.createPendingTask(task, requestedBy, comment);
            return ResponseEntity.ok(pendingTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<Task> approveTask(
            @PathVariable String id,
            @RequestBody Map<String, String> approvalData) {
        
        String reviewedById = approvalData.get("reviewedById");
        String comment = approvalData.get("comment");
        
        if (reviewedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
            
            Task task = pendingTaskService.approveTask(id, reviewedBy, comment);
            return ResponseEntity.ok(task);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<PendingTask> rejectTask(
            @PathVariable String id,
            @RequestBody Map<String, String> rejectionData) {
        
        String reviewedById = rejectionData.get("reviewedById");
        String comment = rejectionData.get("comment");
        
        if (reviewedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
            
            PendingTask pendingTask = pendingTaskService.rejectTask(id, reviewedBy, comment);
            return ResponseEntity.ok(pendingTask);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePendingTask(@PathVariable String id) {
        return pendingTaskService.getPendingTaskById(id)
                .map(pendingTask -> {
                    pendingTaskService.deletePendingTask(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/unreview-count")
    public ResponseEntity<Long> getUnreviewedCount() {
        return ResponseEntity.ok(pendingTaskService.countByStatus("NEW"));
    }
    
    @GetMapping("/email-reports")
    public ResponseEntity<List<PendingTask>> getEmailReports() {
        List<PendingTask> emailReports = pendingTaskService.findPendingTasksByStatus("NEW");
        
        // Manuellt hantera requestedBy för e-postrapporter som kan ha tillfälliga användare
        for (PendingTask report : emailReports) {
            // Försök hitta hyresgäst baserat på e-post eller namn
            if (report.getEmail() != null && !report.getEmail().isEmpty()) {
                try {
                    Optional<Tenant> tenant = tenantService.findTenantByEmail(report.getEmail());
                    if (tenant.isPresent()) {
                        Tenant foundTenant = tenant.get();
                        report.setTenantId(foundTenant.getId());
                        report.setRequestedByTenant(foundTenant);
                        
                        // Om hyresgästen har en lägenhet, sätt även den
                        if (foundTenant.getApartment() != null) {
                            report.setApartmentId(foundTenant.getApartment().getId());
                            report.setRequestedByApartment(foundTenant.getApartment());
                        }
                    }
                } catch (Exception e) {
                    // Logga felet men fortsätt processen
                    System.err.println("Kunde inte hitta hyresgäst för e-post: " + report.getEmail());
                }
            }
            
            // Om vi inte hittade hyresgäst via e-post, försök med namn och lägenhetsnummer
            if (report.getRequestedByTenant() == null && report.getName() != null && 
                !report.getName().isEmpty() && report.getApartment() != null && report.getAddress() != null) {
                try {
                    Optional<Apartment> apartment = apartmentService.findByStreetAddressAndApartmentNumber(
                        report.getAddress(), 
                        report.getApartment()
                    );
                    if (apartment.isPresent()) {
                        Apartment foundApartment = apartment.get();
                        report.setApartmentId(foundApartment.getId());
                        report.setRequestedByApartment(foundApartment);
                        
                        // Försök matcha hyresgäst i lägenheten baserat på namn
                        for (Tenant tenant : foundApartment.getTenants()) {
                            String fullName = tenant.getFirstName() + " " + tenant.getLastName();
                            if (report.getName().equalsIgnoreCase(fullName)) {
                                report.setTenantId(tenant.getId());
                                report.setRequestedByTenant(tenant);
                                break;
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Kunde inte hitta lägenhet/hyresgäst för: " + report.getAddress() + " " + report.getApartment());
                }
            }

            // Skapa en temporär Tenant om vi inte kunde hitta en matchande
            if (report.getRequestedByTenant() == null && report.getName() != null && !report.getName().isEmpty()) {
                Tenant tempTenant = new Tenant();
                String[] nameParts = report.getName().split(" ");
                if (nameParts.length > 1) {
                    tempTenant.setFirstName(nameParts[0]);
                    tempTenant.setLastName(nameParts[nameParts.length - 1]);
                } else {
                    tempTenant.setFirstName(report.getName());
                    tempTenant.setLastName("");
                }
                tempTenant.setEmail(report.getEmail());
                tempTenant.setPhone(report.getPhone());
                report.setRequestedByTenant(tempTenant);
            }
            
            // Sätt ett standardvärde för subject om det saknas
            if (report.getSubject() == null || report.getSubject().isEmpty()) {
                if (report.getDescription() != null && !report.getDescription().isEmpty()) {
                    String shortDesc = report.getDescription().length() > 50 
                        ? report.getDescription().substring(0, 47) + "..." 
                        : report.getDescription();
                    report.setSubject("Felanmälan: " + shortDesc);
                } else {
                    report.setSubject("Felanmälan via e-post");
                }
            }
        }
        
        return ResponseEntity.ok(emailReports);
    }
    
    @PostMapping("/{id}/convert-to-task")
    public ResponseEntity<Task> convertEmailToTask(@PathVariable String id, @RequestBody Task taskData) {
        try {
            Optional<PendingTask> pendingTaskOpt = pendingTaskService.getPendingTaskById(id);
            if (pendingTaskOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            String reviewedById = taskData.getAssignedByUserId(); // Använd assignedByUserId från taskData
            if (reviewedById == null) {
                return ResponseEntity.badRequest().build();
            }
            
            // Hämta användaren som granskar
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
            
            // Skapa en ny uppgift
            Task task = new Task();
            task.setTitle(taskData.getTitle());
            task.setDescription(taskData.getDescription());
            task.setStatus(taskData.getStatus());
            task.setPriority(taskData.getPriority());
            
            // Sätt referenser till lägenhet, användare och hyresgäst om de anges
            if (taskData.getApartmentId() != null && !taskData.getApartmentId().isEmpty()) {
                task.setApartmentId(taskData.getApartmentId());
            }
            
            if (taskData.getAssignedToUserId() != null && !taskData.getAssignedToUserId().isEmpty()) {
                task.setAssignedToUserId(taskData.getAssignedToUserId());
            }
            
            if (taskData.getDueDate() != null) {
                task.setDueDate(taskData.getDueDate());
            }
            
            // Konvertera e-postrapporten till en uppgift
            Task savedTask = pendingTaskService.convertEmailReportToTask(id, task, reviewedBy);
            return ResponseEntity.ok(savedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/reject-email")
    public ResponseEntity<PendingTask> rejectEmailReport(@PathVariable String id, @RequestBody Map<String, String> rejectData) {
        try {
            String reviewedById = rejectData.get("reviewedById");
            String reason = rejectData.get("reason");
            
            if (reviewedById == null) {
                return ResponseEntity.badRequest().build();
            }
            
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
            
            PendingTask updatedReport = pendingTaskService.rejectEmailReport(id, reviewedBy, reason);
            return ResponseEntity.ok(updatedReport);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 