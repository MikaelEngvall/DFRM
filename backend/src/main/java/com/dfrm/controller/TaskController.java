package com.dfrm.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
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

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Task> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String apartmentId) {
        return taskService.getAllTasks(status, priority, tenantId, apartmentId);
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
        System.out.println("PATCH-anrop mottaget för task ID: " + id);
        System.out.println("Data mottagen: " + patchTask);
        
        Optional<Task> existingTaskOpt = taskService.getTaskById(id);
        
        if (existingTaskOpt.isEmpty()) {
            System.out.println("Uppgift med ID " + id + " hittades inte");
            return ResponseEntity.notFound().build();
        }
        
        Task existingTask = existingTaskOpt.get();
        System.out.println("Befintlig uppgift: " + existingTask);
        
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
        System.out.println("Uppgift uppdaterad och sparad: " + savedTask);
        
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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PathVariable(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Map<String, LocalDate> pathVars) {
        
        System.out.println("DEBUG: getTasksByDateRange anropad med startDate=" + startDate + ", endDate=" + endDate);
        
        // Om startDate och endDate är null, använd variabler från path
        if (startDate == null && pathVars != null && pathVars.containsKey("startDate")) {
            startDate = pathVars.get("startDate");
            System.out.println("DEBUG: Använder startDate från pathVars: " + startDate);
        }
        
        if (endDate == null && pathVars != null && pathVars.containsKey("endDate")) {
            endDate = pathVars.get("endDate");
            System.out.println("DEBUG: Använder endDate från pathVars: " + endDate);
        }
        
        // Validera att båda datumen finns
        if (startDate == null || endDate == null) {
            System.out.println("DEBUG: Saknas datumvärden: startDate=" + startDate + ", endDate=" + endDate);
            throw new IllegalArgumentException("Both startDate and endDate are required");
        }
        
        // Logga de faktiska datumen som kommer att användas
        System.out.println("DEBUG: Hämtar uppgifter mellan " + startDate + " och " + endDate);
        
        // Spara datumen i final-variabler för användning i lambda-uttryck
        final LocalDate finalStartDate = startDate;
        final LocalDate finalEndDate = endDate;
        
        // Hämta uppgifter från service
        List<Task> tasks = taskService.getTasksByDateRange(finalStartDate, finalEndDate);
        
        // Logga antalet uppgifter som hittades
        System.out.println("DEBUG: Hittade " + tasks.size() + " uppgifter för intervallet");
        
        // Om inga uppgifter hittades, försök hämta alla och filtrera manuellt
        if (tasks.isEmpty()) {
            System.out.println("DEBUG: Inga uppgifter hittades, försöker med alternativ metod");
            List<Task> allTasks = taskService.getAllTasks(null, null, null, null);
            
            System.out.println("DEBUG: Totalt antal uppgifter i databasen: " + allTasks.size());
            
            // Filtrera uppgifter manuellt med final-variabler
            List<Task> filteredTasks = allTasks.stream()
                .filter(task -> {
                    if (task.getDueDate() == null) {
                        return false;
                    }
                    
                    // Kontrollera om uppgiften ligger inom intervallet
                    return !task.getDueDate().isBefore(finalStartDate) && !task.getDueDate().isAfter(finalEndDate);
                })
                .toList();
            
            System.out.println("DEBUG: Manuellt filtrerat fram " + filteredTasks.size() + " uppgifter");
            
            if (!filteredTasks.isEmpty()) {
                System.out.println("DEBUG: Returnerar manuellt filtrerade uppgifter istället");
                return filteredTasks;
            }
        }
        
        return tasks;
    }
} 