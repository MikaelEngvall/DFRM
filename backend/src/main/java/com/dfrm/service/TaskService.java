package com.dfrm.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Task;
import com.dfrm.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    
    public List<Task> getAllTasks(String status, String priority, String tenantId, String apartmentId) {
        // Här skulle man normalt implementera logik för att filtrera baserat på parametrarna
        // Men för att få grundläggande funktionalitet att fungera returnerar vi alla uppgifter för tillfället
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
    
    public boolean existsById(String id) {
        return taskRepository.existsById(id);
    }
    
    public Optional<Task> updateTaskStatus(String id, String status) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            // Här skulle vi normalt validera och konvertera status till en enum
            task.setStatus(status);
            return Optional.of(taskRepository.save(task));
        }
        return Optional.empty();
    }
    
    public List<Task> getTasksByStatus(String status) {
        // Detta skulle normalt implementeras med en repository-metod
        return taskRepository.findAll().stream()
                .filter(task -> status.equals(task.getStatus()))
                .toList();
    }
    
    public List<Task> getTasksByPriority(String priority) {
        // Detta skulle normalt implementeras med en repository-metod
        return taskRepository.findAll().stream()
                .filter(task -> priority.equals(task.getPriority()))
                .toList();
    }
    
    public List<Task> getTasksByTenantId(String tenantId) {
        // Använd både det direkta tenant-ID-fältet och referensen
        return taskRepository.findAll().stream()
                .filter(task -> (tenantId.equals(task.getTenantId())) || 
                                (task.getTenant() != null && tenantId.equals(task.getTenant().getId())))
                .toList();
    }
    
    public List<Task> getTasksByApartmentId(String apartmentId) {
        // Använd både det direkta apartment-ID-fältet och referensen
        return taskRepository.findAll().stream()
                .filter(task -> (apartmentId.equals(task.getApartmentId())) ||
                                (task.getApartment() != null && apartmentId.equals(task.getApartment().getId())))
                .toList();
    }
    
    public List<Task> getTasksByAssignedUserId(String userId) {
        // Använd både assignedToUserId och den gamla assignedUser-referensen
        return taskRepository.findAll().stream()
                .filter(task -> (userId.equals(task.getAssignedToUserId())) ||
                                (task.getAssignedUser() != null && userId.equals(task.getAssignedUser().getId())))
                .toList();
    }
    
    // Ny metod för att hämta uppgifter baserat på vem som tilldelade dem
    public List<Task> getTasksByAssignedByUserId(String userId) {
        return taskRepository.findAll().stream()
                .filter(task -> userId.equals(task.getAssignedByUserId()))
                .toList();
    }
    
    public List<Task> getOverdueTasks() {
        LocalDate today = LocalDate.now();
        // Detta skulle normalt implementeras med en repository-metod
        return taskRepository.findAll().stream()
                .filter(task -> task.getDueDate() != null && 
                               task.getDueDate().isBefore(today) && 
                               !"COMPLETED".equals(task.getStatus()) &&
                               !"APPROVED".equals(task.getStatus()))
                .toList();
    }
    
    public Task createRecurringTask(Task task) {
        // Här skulle vi hantera logik för återkommande uppgifter
        task.setRecurring(true);
        return taskRepository.save(task);
    }
    
    public Optional<Task> updateRecurringPattern(String id, String pattern) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setRecurringPattern(pattern);
            task.setRecurring(true);
            return Optional.of(taskRepository.save(task));
        }
        return Optional.empty();
    }
    
    public List<Task> getTasksByDateRange(LocalDate startDate, LocalDate endDate) {
        return taskRepository.findByDueDateBetween(startDate, endDate);
    }
} 