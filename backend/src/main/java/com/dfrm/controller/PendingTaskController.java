package com.dfrm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Admin;
import com.dfrm.model.PendingTask;
import com.dfrm.model.Task;
import com.dfrm.service.AdminService;
import com.dfrm.service.PendingTaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pending-tasks")
@RequiredArgsConstructor
public class PendingTaskController {

    private final PendingTaskService pendingTaskService;
    private final AdminService adminService;

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

    @PostMapping
    public ResponseEntity<PendingTask> createPendingTask(
            @RequestBody Map<String, Object> request) {
        
        try {
            // Extrahera task från request
            Map<String, Object> taskMap = (Map<String, Object>) request.get("task");
            Task task = new Task();
            // Sätt task-fält från taskMap här...
            
            // Hämta requestedBy admin
            String requestedById = (String) request.get("requestedById");
            Admin requestedBy = adminService.getAdminById(requestedById)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid admin ID"));
            
            String comments = (String) request.get("comments");
            
            PendingTask pendingTask = pendingTaskService.createPendingTask(task, requestedBy, comments);
            return ResponseEntity.ok(pendingTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PendingTask> approvePendingTask(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        
        try {
            String reviewedById = request.get("reviewedById");
            Admin reviewedBy = adminService.getAdminById(reviewedById)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid admin ID"));
            
            String comments = request.get("comments");
            
            PendingTask pendingTask = pendingTaskService.approvePendingTask(id, reviewedBy, comments);
            if (pendingTask != null) {
                return ResponseEntity.ok(pendingTask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PendingTask> rejectPendingTask(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        
        try {
            String reviewedById = request.get("reviewedById");
            Admin reviewedBy = adminService.getAdminById(reviewedById)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid admin ID"));
            
            String comments = request.get("comments");
            
            PendingTask pendingTask = pendingTaskService.rejectPendingTask(id, reviewedBy, comments);
            if (pendingTask != null) {
                return ResponseEntity.ok(pendingTask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
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
} 