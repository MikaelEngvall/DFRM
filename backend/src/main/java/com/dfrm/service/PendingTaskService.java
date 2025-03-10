package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.PendingTask;
import com.dfrm.model.Task;
import com.dfrm.model.TaskStatus;
import com.dfrm.model.User;
import com.dfrm.repository.PendingTaskRepository;
import com.dfrm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PendingTaskService {
    
    private final PendingTaskRepository pendingTaskRepository;
    private final TaskRepository taskRepository;
    
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
} 