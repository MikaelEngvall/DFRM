package com.dfrm.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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
    public List<Task> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String apartmentId) {
        return taskService.getAllTasks(status, priority, tenantId, apartmentId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.saveTask(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task task) {
        if (!taskService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        task.setId(id);
        return ResponseEntity.ok(taskService.saveTask(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (!taskService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
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
    public List<Task> getTasksByStatus(@PathVariable String status) {
        return taskService.getTasksByStatus(status);
    }

    @GetMapping("/priority/{priority}")
    public List<Task> getTasksByPriority(@PathVariable String priority) {
        return taskService.getTasksByPriority(priority);
    }

    @GetMapping("/tenant/{tenantId}")
    public List<Task> getTasksByTenantId(@PathVariable String tenantId) {
        return taskService.getTasksByTenantId(tenantId);
    }

    @GetMapping("/apartment/{apartmentId}")
    public List<Task> getTasksByApartmentId(@PathVariable String apartmentId) {
        return taskService.getTasksByApartmentId(apartmentId);
    }

    @GetMapping("/assigned/{userId}")
    public List<Task> getTasksByAssignedUserId(@PathVariable String userId) {
        return taskService.getTasksByAssignedUserId(userId);
    }

    @GetMapping("/overdue")
    public List<Task> getOverdueTasks() {
        return taskService.getOverdueTasks();
    }

    @PostMapping("/recurring")
    public Task createRecurringTask(@RequestBody Task task) {
        return taskService.createRecurringTask(task);
    }

    @PatchMapping("/{id}/recurring")
    public ResponseEntity<Task> updateRecurringPattern(@PathVariable String id, @RequestBody Map<String, String> payload) {
        if (!taskService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        String pattern = payload.get("recurringPattern");
        if (pattern == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Task> updatedTask = taskService.updateRecurringPattern(id, pattern);
        return updatedTask.map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @GetMapping("/date-range")
    public List<Task> getTasksByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return taskService.getTasksByDateRange(startDate, endDate);
    }
} 