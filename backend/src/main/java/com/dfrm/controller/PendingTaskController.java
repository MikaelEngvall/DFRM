package com.dfrm.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
    private static final Logger log = LoggerFactory.getLogger(PendingTaskController.class);

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

    @GetMapping("/requested/{userId}")
    public ResponseEntity<List<PendingTask>> getTasksByRequestedTenant(@PathVariable String userId) {
        return ResponseEntity.ok(pendingTaskService.getTasksByRequestedTenant(userId));
    }

    @GetMapping("/for-review")
    public List<PendingTask> getPendingTasksForReview() {
        return pendingTaskService.findPendingTasksForReview();
    }

    @GetMapping("/approved")
    public ResponseEntity<List<PendingTask>> getApprovedTasks() {
        List<PendingTask> approvedTasks = pendingTaskRepository.findByReviewedByIsNotNullOrderByReviewedAtDesc();
        log.info("Hämtar godkända uppgifter, hittade {} uppgifter", approvedTasks.size());
        
        // Logga detaljer för debugging
        for (PendingTask task : approvedTasks) {
            log.info("Godkänd uppgift - ID: {}, ReviewedBy: {}, Task: {}", 
                    task.getId(), 
                    task.getReviewedBy() != null ? task.getReviewedBy().getFirstName() : "null", 
                    task.getTask() != null ? task.getTask().getTitle() : "null");
        }
        
        return ResponseEntity.ok(approvedTasks);
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
            @RequestBody Map<String, Object> approvalData) {
        
        String reviewedById = (String) approvalData.get("reviewedById");
        String comment = (String) approvalData.get("comment");
        
        if (reviewedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
            
            // Hämta den väntande uppgiften
            PendingTask pendingTask = pendingTaskService.getPendingTaskById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid pending task ID"));
            
            // Uppdatera uppgiften med nya värden från approvalData
            Task task = pendingTask.getTask();
            if (approvalData.containsKey("dueDate")) {
                String dueDateStr = (String) approvalData.get("dueDate");
                task.setDueDate(LocalDate.parse(dueDateStr.substring(0, 10))); // Ta bara YYYY-MM-DD delen
            }
            if (approvalData.containsKey("assignedToUserId")) {
                String assignedToUserId = (String) approvalData.get("assignedToUserId");
                User assignedTo = userService.getUserById(assignedToUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid assigned user ID"));
                task.setAssignedUser(assignedTo); // Sätt assignedUser referensen
                task.setAssignedToUserId(assignedToUserId); // Sätt assignedToUserId
            }
            if (approvalData.containsKey("priority")) {
                task.setPriority((String) approvalData.get("priority"));
            }
            
            // Godkänn uppgiften
            Task updatedTask = pendingTaskService.approveTask(id, reviewedBy, comment);
            return ResponseEntity.ok(updatedTask);
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
        long newCount = pendingTaskService.countByStatus("NEW");
        long pendingCount = pendingTaskService.countByStatus("PENDING");
        return ResponseEntity.ok(newCount + pendingCount);
    }
    
    @PostMapping("/check-emails") 
    public ResponseEntity<String> checkEmails() {
        try {
            pendingTaskService.checkEmails();
            return ResponseEntity.ok("E-postläsning av felanmälningar har utförts");
        } catch (Exception e) {
            log.error("Fel vid manuell läsning av felanmälnings-e-post: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Fel vid läsning av e-post: " + e.getMessage());
        }
    }
    
    @GetMapping("/email-reports")
    public ResponseEntity<List<PendingTask>> getEmailReports() {
        // Ändrad från att bara hämta NEW-status till att hämta alla e-postrapporter utan Task-objekt
        // Detta gör att vi fångar upp både nya och eventuellt manuellt skapade e-postrapporter
        List<PendingTask> allTasks = pendingTaskRepository.findAll();
        
        // Filtrera ut e-postrapporter - de som inte har Task-objekt och troligen kommer från EmailListener
        List<PendingTask> emailReports = allTasks.stream()
            .filter(task -> task.getTask() == null) // Måste vara utan Task-objekt för att vara en e-postrapport
            .filter(task -> task.getDescription() != null) // Måste ha beskrivning
            .collect(java.util.stream.Collectors.toList());
        
        log.info("Hittade {} potentiella e-postrapporter av totalt {} väntande uppgifter", 
                emailReports.size(), allTasks.size());
        
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
                    log.error("Kunde inte hitta hyresgäst för e-post: {}", report.getEmail(), e);
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
                    log.error("Kunde inte hitta lägenhet/hyresgäst för: {} {}", 
                              report.getAddress(), report.getApartment(), e);
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
            
            // Se till att alla rapporter har rätt status
            if (report.getStatus() == null || report.getStatus().isEmpty()) {
                report.setStatus("NEW");
            }
            
            // Logga information om varje rapport för felsökning
            log.debug("E-postrapport: id={}, name={}, email={}, status={}, reviewedBy={}", 
                    report.getId(), report.getName(), report.getEmail(), 
                    report.getStatus(), report.getReviewedBy() != null ? report.getReviewedBy().getFirstName() : "null");
        }
        
        return ResponseEntity.ok(emailReports);
    }
    
    @PostMapping("/{id}/convert-to-task")
    public ResponseEntity<Task> convertEmailToTask(@PathVariable String id, @RequestBody Task taskData) {
        try {
            Optional<PendingTask> pendingTaskOpt = pendingTaskService.getPendingTaskById(id);
            if (!pendingTaskOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            PendingTask pendingTask = pendingTaskOpt.get();
            log.info("Konverterar e-postrapport till uppgift: ID={}, Tenant ID={}, Apartment ID={}", 
                pendingTask.getId(), pendingTask.getTenantId(), pendingTask.getApartmentId());
            
            // Validera och sätt alla nödvändiga fält
            if (taskData.getTitle() == null || taskData.getTitle().trim().isEmpty()) {
                // Skapa titel från adress och lägenhetsnummer
                StringBuilder titleBuilder = new StringBuilder();
                if (pendingTask.getAddress() != null && !pendingTask.getAddress().isEmpty()) {
                    titleBuilder.append(pendingTask.getAddress().trim());
                    if (pendingTask.getApartment() != null && !pendingTask.getApartment().isEmpty()) {
                        titleBuilder.append(" Lgh ").append(pendingTask.getApartment().trim());
                    }
                } else if (pendingTask.getName() != null && !pendingTask.getName().isEmpty()) {
                    titleBuilder.append("Felanmälan från ").append(pendingTask.getName());
                }
                taskData.setTitle(titleBuilder.toString());
                log.info("Satte titel till: {}", taskData.getTitle());
            }
            
            // Sätt hyresgäst och lägenhet från PendingTask om de inte redan är angivna i taskData
            if ((taskData.getTenantId() == null || taskData.getTenantId().isEmpty()) && pendingTask.getTenantId() != null) {
                taskData.setTenantId(pendingTask.getTenantId());
                log.info("Satte tenant ID till: {}", pendingTask.getTenantId());
            }
            
            if ((taskData.getApartmentId() == null || taskData.getApartmentId().isEmpty()) && pendingTask.getApartmentId() != null) {
                taskData.setApartmentId(pendingTask.getApartmentId());
                log.info("Satte apartment ID till: {}", pendingTask.getApartmentId());
            }
            
            // Om description är tom eller null, använd beskrivningen från pendingTask
            if (taskData.getDescription() == null || taskData.getDescription().trim().isEmpty()) {
                taskData.setDescription(pendingTask.getDescription());
                log.info("Använde beskrivning från e-postrapport: {}", 
                         pendingTask.getDescription() != null ? 
                             pendingTask.getDescription().substring(0, Math.min(50, pendingTask.getDescription().length())) + "..." : null);
            }
            
            // Sätt standardvärden om de saknas
            if (taskData.getStatus() == null || taskData.getStatus().trim().isEmpty()) {
                taskData.setStatus("NEW");
            }
            
            if (taskData.getPriority() == null || taskData.getPriority().trim().isEmpty()) {
                taskData.setPriority("MEDIUM");
            }
            
            if (taskData.getDueDate() == null) {
                taskData.setDueDate(LocalDate.now().plusDays(7));
            }
            
            User reviewedBy = null;
            if (taskData.getAssignedByUserId() != null && !taskData.getAssignedByUserId().isEmpty()) {
                Optional<User> userOpt = userService.getUserById(taskData.getAssignedByUserId());
                if (userOpt.isPresent()) {
                    reviewedBy = userOpt.get();
                }
            }
            
            if (reviewedBy == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Task newTask = pendingTaskService.convertEmailReportToTask(id, taskData, reviewedBy);
            return ResponseEntity.ok(newTask);
        } catch (Exception e) {
            log.error("Fel vid konvertering av e-postrapport till uppgift", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<PendingTask>> getTasksByTenant(@PathVariable String tenantId) {
        return ResponseEntity.ok(pendingTaskService.getTasksByRequestedTenant(tenantId));
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<PendingTask>> getTasksByApartment(@PathVariable String apartmentId) {
        return ResponseEntity.ok(pendingTaskService.getTasksByRequestedApartment(apartmentId));
    }

    /**
     * Uppdaterar en väntande uppgift
     */
    @PatchMapping("/{id}")
    public ResponseEntity<PendingTask> updatePendingTask(
            @PathVariable String id,
            @RequestBody Map<String, Object> updateData) {
        try {
            Optional<PendingTask> existingTaskOpt = pendingTaskService.getPendingTaskById(id);
            if (existingTaskOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PendingTask existingTask = existingTaskOpt.get();
            
            // Uppdatera fält om de finns i updateData
            if (updateData.containsKey("subject")) {
                existingTask.setSubject((String) updateData.get("subject"));
            }
            if (updateData.containsKey("description")) {
                existingTask.setDescription((String) updateData.get("description"));
            }
            if (updateData.containsKey("name")) {
                existingTask.setName((String) updateData.get("name"));
            }
            if (updateData.containsKey("email")) {
                existingTask.setEmail((String) updateData.get("email"));
            }
            if (updateData.containsKey("phone")) {
                existingTask.setPhone((String) updateData.get("phone"));
            }
            
            // Hantera hyresgäst - null eller tom sträng betyder ta bort hyresgäst
            if (updateData.containsKey("tenantId")) {
                String tenantId = (String) updateData.get("tenantId");
                if (tenantId == null || tenantId.isEmpty()) {
                    existingTask.setRequestedByTenant(null);
                    existingTask.setTenantId(null);
                } else {
                    Optional<Tenant> tenantOpt = tenantService.getTenantById(tenantId);
                    if (tenantOpt.isPresent()) {
                        existingTask.setRequestedByTenant(tenantOpt.get());
                        existingTask.setTenantId(tenantId);
                    }
                }
            }
            
            // Hantera lägenhet - null eller tom sträng betyder ta bort lägenhet
            if (updateData.containsKey("apartmentId")) {
                String apartmentId = (String) updateData.get("apartmentId");
                if (apartmentId == null || apartmentId.isEmpty()) {
                    existingTask.setRequestedByApartment(null);
                    existingTask.setApartmentId(null);
                } else {
                    Optional<Apartment> apartmentOpt = apartmentService.getApartmentById(apartmentId);
                    if (apartmentOpt.isPresent()) {
                        existingTask.setRequestedByApartment(apartmentOpt.get());
                        existingTask.setApartmentId(apartmentId);
                    }
                }
            }

            PendingTask updatedTask = pendingTaskRepository.save(existingTask);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/export-sql")
    public ResponseEntity<String> exportToSql() {
        List<PendingTask> pendingTasks = pendingTaskService.getAllPendingTasks();
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- SQL export av väntande uppgifter från DFRM\n");
        sql.append("-- Genererat: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
        
        // Skapa INSERT-satser för varje väntande uppgift
        for (PendingTask pendingTask : pendingTasks) {
            sql.append("INSERT INTO pending_tasks (id, taskId, requestedByTenantId, requestedByApartmentId, requestedAt, requestComments, reviewedByUserId, reviewedAt, reviewComments, name, email, phone, address, apartment, description, descriptionLanguage, status) VALUES (\n");
            sql.append("    '").append(pendingTask.getId()).append("',\n");
            
            // Hantera taskId som kan vara null
            if (pendingTask.getTask() != null) {
                sql.append("    '").append(pendingTask.getTask().getId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera requestedByTenantId som kan vara null
            if (pendingTask.getRequestedByTenant() != null) {
                sql.append("    '").append(pendingTask.getRequestedByTenant().getId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera requestedByApartmentId som kan vara null
            if (pendingTask.getRequestedByApartment() != null) {
                sql.append("    '").append(pendingTask.getRequestedByApartment().getId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera requestedAt
            if (pendingTask.getRequestedAt() != null) {
                sql.append("    '").append(pendingTask.getRequestedAt()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(escapeSql(pendingTask.getRequestComments())).append("',\n");
            
            // Hantera reviewedByUserId som kan vara null
            if (pendingTask.getReviewedBy() != null) {
                sql.append("    '").append(pendingTask.getReviewedBy().getId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera reviewedAt
            if (pendingTask.getReviewedAt() != null) {
                sql.append("    '").append(pendingTask.getReviewedAt()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(escapeSql(pendingTask.getReviewComments())).append("',\n");
            sql.append("    '").append(escapeSql(pendingTask.getName())).append("',\n");
            sql.append("    '").append(escapeSql(pendingTask.getEmail())).append("',\n");
            sql.append("    '").append(escapeSql(pendingTask.getPhone())).append("',\n");
            sql.append("    '").append(escapeSql(pendingTask.getAddress())).append("',\n");
            sql.append("    '").append(escapeSql(pendingTask.getApartment())).append("',\n");
            sql.append("    '").append(escapeSql(pendingTask.getDescription())).append("',\n");
            
            // Hantera descriptionLanguage
            if (pendingTask.getDescriptionLanguage() != null) {
                sql.append("    '").append(pendingTask.getDescriptionLanguage()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(pendingTask.getStatus()).append("'\n");
            sql.append(");\n\n");
        }
        
        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=pending_tasks_export.sql")
            .contentType(MediaType.TEXT_PLAIN)
            .body(sql.toString());
    }
    
    // Hjälpmetod för att escapa SQL-strängar
    private String escapeSql(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("'", "''");
    }
} 