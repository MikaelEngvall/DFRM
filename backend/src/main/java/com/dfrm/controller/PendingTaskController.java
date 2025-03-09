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

import com.dfrm.model.PendingTask;
import com.dfrm.model.Task;
import com.dfrm.model.User;
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
} 