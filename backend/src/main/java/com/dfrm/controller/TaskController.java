package com.dfrm.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Task;
import com.dfrm.service.TaskService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Task> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String apartmentId,
            @RequestParam(required = false) String assignedToUserId,
            @RequestParam(required = false) String assignedByUserId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Boolean isOverdue) {
        
        log.debug("Hämtar uppgifter med filtreringsparametrar: status={}, priority={}, tenantId={}, apartmentId={}, " +
                "assignedToUserId={}, assignedByUserId={}, startDate={}, endDate={}, isOverdue={}",
                status, priority, tenantId, apartmentId, assignedToUserId, assignedByUserId, startDate, endDate, isOverdue);
        
        // Använd den mer kraftfulla getFilteredTasks-metoden som stödjer alla parametrar
        return taskService.getFilteredTasks(
            status, priority, tenantId, apartmentId, 
            assignedToUserId, assignedByUserId, 
            startDate, endDate, isOverdue
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Task createTask(@RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task task) {
        if (!taskService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        task.setId(id);
        return ResponseEntity.ok(taskService.saveTask(task));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN', 'ROLE_ADMIN', 'ROLE_USER', 'SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<Task> patchTask(@PathVariable String id, @RequestBody Task patchTask) {
        log.debug("PATCH-anrop mottaget för task ID: {}", id);
        log.debug("Data mottagen: {}", patchTask);
        
        Optional<Task> existingTaskOpt = taskService.getTaskById(id);
        
        if (existingTaskOpt.isEmpty()) {
            log.debug("Uppgift med ID {} hittades inte", id);
            return ResponseEntity.notFound().build();
        }
        
        Task existingTask = existingTaskOpt.get();
        log.debug("Befintlig uppgift: {}", existingTask);
        
        // Detta kunde ersättas med reflection eller en utility-metod
        // som applicerar ändringar från patchTask till existingTask
        if (patchTask.getTitle() != null) {
            existingTask.setTitle(patchTask.getTitle());
        }
        if (patchTask.getDescription() != null) {
            existingTask.setDescription(patchTask.getDescription());
        }
        if (patchTask.getDueDate() != null) {
            existingTask.setDueDate(patchTask.getDueDate());
        }
        if (patchTask.getCompletedDate() != null) {
            existingTask.setCompletedDate(patchTask.getCompletedDate());
        }
        if (patchTask.getStatus() != null) {
            existingTask.setStatus(patchTask.getStatus());
        }
        if (patchTask.getPriority() != null) {
            existingTask.setPriority(patchTask.getPriority());
        }
        if (patchTask.getComments() != null) {
            existingTask.setComments(patchTask.getComments());
        }
        if (patchTask.getAssignedUser() != null) {
            existingTask.setAssignedUser(patchTask.getAssignedUser());
        }
        if (patchTask.getAssignedToUserId() != null) {
            existingTask.setAssignedToUserId(patchTask.getAssignedToUserId());
        }
        if (patchTask.getAssignedByUserId() != null) {
            existingTask.setAssignedByUserId(patchTask.getAssignedByUserId());
        }
        if (patchTask.getApartment() != null) {
            existingTask.setApartment(patchTask.getApartment());
        }
        if (patchTask.getApartmentId() != null) {
            existingTask.setApartmentId(patchTask.getApartmentId());
        }
        if (patchTask.getTenant() != null) {
            existingTask.setTenant(patchTask.getTenant());
        }
        if (patchTask.getTenantId() != null) {
            existingTask.setTenantId(patchTask.getTenantId());
        }
        if (patchTask.getRecurringPattern() != null) {
            existingTask.setRecurringPattern(patchTask.getRecurringPattern());
        }
        existingTask.setRecurring(patchTask.isRecurring());
        
        Task savedTask = taskService.saveTask(existingTask);
        log.debug("Uppgift uppdaterad och sparad: {}", savedTask);
        
        return ResponseEntity.ok(savedTask);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (!taskService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        if (!taskService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        String newStatus = payload.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Task> updatedTask = taskService.updateTaskStatus(id, newStatus);
        return updatedTask.map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    /**
     * De följande endpointen finns kvar för bakåtkompatibilitet, men 
     * använder nu den centrala filtreringsmetoden internt
     */
    
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getTasksByStatus(@PathVariable String status) {
        return taskService.getTasksByStatus(status);
    }

    @GetMapping("/priority/{priority}")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getTasksByPriority(@PathVariable String priority) {
        return taskService.getTasksByPriority(priority);
    }

    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getTasksByTenantId(@PathVariable String tenantId) {
        return taskService.getTasksByTenantId(tenantId);
    }

    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getTasksByApartmentId(@PathVariable String apartmentId) {
        return taskService.getTasksByApartmentId(apartmentId);
    }

    @GetMapping("/assigned/{userId}")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getTasksByAssignedUserId(@PathVariable String userId) {
        return taskService.getTasksByAssignedUserId(userId);
    }

    @GetMapping("/overdue")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getOverdueTasks() {
        return taskService.getOverdueTasks();
    }

    @PostMapping("/recurring")
    @PreAuthorize("isAuthenticated()")
    public Task createRecurringTask(@RequestBody Task task) {
        return taskService.createRecurringTask(task);
    }

    @PatchMapping("/{id}/recurring")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Task> updateRecurringPattern(@PathVariable String id, @RequestBody Map<String, String> payload) {
        if (!payload.containsKey("pattern")) {
            return ResponseEntity.badRequest().build();
        }
        
        String pattern = payload.get("pattern");
        
        Optional<Task> updatedTask = taskService.updateRecurringPattern(id, pattern);
        
        return updatedTask.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/date-range")
    @PreAuthorize("isAuthenticated()")
    public List<Task> getTasksByDateRange(
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.debug("Hämtar uppgifter för datumintervall: {} till {}", startDate, endDate);
        return taskService.getTasksByDateRange(startDate, endDate);
    }

    @GetMapping("/export-sql")
    public ResponseEntity<String> exportToSql() {
        // Hämta alla uppgifter med tomma filtreringsparametrar (motsvarar alla uppgifter)
        List<Task> tasks = taskService.getAllTasks(null, null, null, null);
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- SQL export av uppgifter från DFRM\n");
        sql.append("-- Genererat: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
        
        // Skapa INSERT-satser för varje uppgift
        for (Task task : tasks) {
            sql.append("INSERT INTO tasks (id, title, description, dueDate, completedDate, status, priority, comments, isRecurring, recurringPattern, assignedToUserId, assignedByUserId, apartmentId, tenantId) VALUES (\n");
            sql.append("    '").append(task.getId()).append("',\n");
            sql.append("    '").append(escapeSql(task.getTitle())).append("',\n");
            sql.append("    '").append(escapeSql(task.getDescription())).append("',\n");
            
            // Hantera datum-fält som kan vara null
            if (task.getDueDate() != null) {
                sql.append("    '").append(task.getDueDate()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            if (task.getCompletedDate() != null) {
                sql.append("    '").append(task.getCompletedDate()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            sql.append("    '").append(task.getStatus()).append("',\n");
            sql.append("    '").append(task.getPriority()).append("',\n");
            sql.append("    '").append(escapeSql(task.getComments())).append("',\n");
            sql.append("    ").append(task.isRecurring()).append(",\n");
            sql.append("    '").append(escapeSql(task.getRecurringPattern())).append("',\n");
            
            // Hantera assignedToUserId som kan vara null
            if (task.getAssignedToUserId() != null) {
                sql.append("    '").append(task.getAssignedToUserId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera assignedByUserId som kan vara null
            if (task.getAssignedByUserId() != null) {
                sql.append("    '").append(task.getAssignedByUserId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera apartmentId som kan vara null
            if (task.getApartmentId() != null) {
                sql.append("    '").append(task.getApartmentId()).append("',\n");
            } else {
                sql.append("    NULL,\n");
            }
            
            // Hantera tenantId som kan vara null
            if (task.getTenantId() != null) {
                sql.append("    '").append(task.getTenantId()).append("'\n");
            } else {
                sql.append("    NULL\n");
            }
            
            sql.append(");\n\n");
        }
        
        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=tasks_export.sql")
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