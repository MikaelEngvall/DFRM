package com.dfrm.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Task;
import com.dfrm.model.TaskStatus;
import com.dfrm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    
    public Optional<Task> getTaskById(String id) {
        return taskRepository.findById(id);
    }
    
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }
    
    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }
    
    public List<Task> findByAssignedUserId(String userId) {
        return taskRepository.findByAssignedUserId(userId);
    }
    
    public List<Task> findByApartmentId(String apartmentId) {
        return taskRepository.findByApartmentId(apartmentId);
    }
    
    public List<Task> findByTenantId(String tenantId) {
        return taskRepository.findByTenantId(tenantId);
    }
    
    public List<Task> findByDueDateBetween(LocalDate startDate, LocalDate endDate) {
        return taskRepository.findByDueDateBetween(startDate, endDate);
    }
    
    public List<Task> findByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }
    
    public List<Task> findOverdueTasks() {
        return taskRepository.findByDueDateBeforeAndStatusNot(LocalDate.now(), TaskStatus.COMPLETED);
    }
    
    public Task updateTaskStatus(String id, TaskStatus status) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setStatus(status);
            
            if (status == TaskStatus.COMPLETED) {
                task.setCompletedDate(LocalDate.now());
            }
            
            return taskRepository.save(task);
        }
        return null;
    }
} 