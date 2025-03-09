package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Admin;
import com.dfrm.model.PendingTask;
import com.dfrm.model.Task;
import com.dfrm.model.TaskStatus;
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
    
    public PendingTask createPendingTask(Task task, Admin requestedBy, String comments) {
        task.setStatus(TaskStatus.PENDING);
        Task savedTask = taskRepository.save(task);
        
        PendingTask pendingTask = new PendingTask();
        pendingTask.setTask(savedTask);
        pendingTask.setRequestedBy(requestedBy);
        pendingTask.setRequestedAt(LocalDateTime.now());
        pendingTask.setRequestComments(comments);
        
        return pendingTaskRepository.save(pendingTask);
    }
    
    public PendingTask approvePendingTask(String id, Admin reviewedBy, String reviewComments) {
        Optional<PendingTask> pendingTaskOpt = pendingTaskRepository.findById(id);
        if (pendingTaskOpt.isPresent()) {
            PendingTask pendingTask = pendingTaskOpt.get();
            pendingTask.setReviewedBy(reviewedBy);
            pendingTask.setReviewedAt(LocalDateTime.now());
            pendingTask.setReviewComments(reviewComments);
            
            Task task = pendingTask.getTask();
            task.setStatus(TaskStatus.APPROVED);
            taskRepository.save(task);
            
            return pendingTaskRepository.save(pendingTask);
        }
        return null;
    }
    
    public PendingTask rejectPendingTask(String id, Admin reviewedBy, String reviewComments) {
        Optional<PendingTask> pendingTaskOpt = pendingTaskRepository.findById(id);
        if (pendingTaskOpt.isPresent()) {
            PendingTask pendingTask = pendingTaskOpt.get();
            pendingTask.setReviewedBy(reviewedBy);
            pendingTask.setReviewedAt(LocalDateTime.now());
            pendingTask.setReviewComments(reviewComments);
            
            Task task = pendingTask.getTask();
            task.setStatus(TaskStatus.REJECTED);
            taskRepository.save(task);
            
            return pendingTaskRepository.save(pendingTask);
        }
        return null;
    }
    
    public void deletePendingTask(String id) {
        pendingTaskRepository.deleteById(id);
    }
} 