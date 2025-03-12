package com.dfrm.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.PendingTask;
import com.dfrm.model.Task;
import com.dfrm.model.User;
import com.dfrm.repository.PendingTaskRepository;
import com.dfrm.service.PendingTaskService;
import com.dfrm.service.TaskService;
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
    @PreAuthorize("permitAll()")
    public List<PendingTask> getApprovedTasks() {
        // Skapa en helt hårdkodad uppgift för testning
        PendingTask testTask = new PendingTask();
        testTask.setId("67c5f1710fec671fd842aa16");
        
        // Skapa en Task
        Task task = new Task();
        task.setId("67c5f1710fec671fd842aa15");
        task.setTitle("Test Task");
        task.setDescription("Detta är en testuppgift");
        task.setStatus("APPROVED");
        
        // Skapa en User
        User user = new User();
        user.setId("67c45b7908f53e4d2bbfbe8f");
        user.setFirstName("Engvall");
        user.setLastName("Mikael");
        user.setEmail("mikael.engvall.me@gmail.com");
        
        // Sätt relationer
        testTask.setTask(task);
        testTask.setRequestedBy(user);
        testTask.setReviewedBy(user);
        testTask.setRequestedAt(LocalDateTime.now().minusDays(1));
        testTask.setReviewedAt(LocalDateTime.now());
        
        return List.of(testTask);
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
            if (report.getRequestedBy() != null) {
                // Om användaren har ett ID men inte har firstName/lastName, försök ladda den från databasen
                if (report.getRequestedBy().getId() != null && 
                    (report.getRequestedBy().getFirstName() == null || 
                     report.getRequestedBy().getLastName() == null)) {
                    try {
                        userService.getUserById(report.getRequestedBy().getId())
                                  .ifPresent(report::setRequestedBy);
                    } catch (Exception e) {
                        // Om användaren inte kan laddas, skapa en tillfällig
                        if (report.getName() != null && !report.getName().isEmpty()) {
                            User tempUser = new User();
                            // Försök tolka namn
                            String[] nameParts = report.getName().split(" ");
                            if (nameParts.length > 1) {
                                tempUser.setFirstName(nameParts[0]);
                                tempUser.setLastName(nameParts[nameParts.length - 1]);
                            } else {
                                tempUser.setFirstName(report.getName());
                                tempUser.setLastName("");
                            }
                            tempUser.setEmail(report.getEmail());
                            report.setRequestedBy(tempUser);
                        }
                    }
                }
            } else if (report.getName() != null && !report.getName().isEmpty()) {
                // Skapa en tillfällig användare om det inte finns någon requestedBy men det finns namn
                User tempUser = new User();
                // Försök tolka namn
                String[] nameParts = report.getName().split(" ");
                if (nameParts.length > 1) {
                    tempUser.setFirstName(nameParts[0]);
                    tempUser.setLastName(nameParts[nameParts.length - 1]);
                } else {
                    tempUser.setFirstName(report.getName());
                    tempUser.setLastName("");
                }
                tempUser.setEmail(report.getEmail());
                report.setRequestedBy(tempUser);
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