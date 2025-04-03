package com.dfrm.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.model.Task;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.TaskRepository;
import com.dfrm.repository.TenantRepository;
import com.dfrm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final TenantRepository tenantRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final TaskMessageService taskMessageService;
    private final GoogleTranslateClient translateClient;
    private final TaskFilterService taskFilterService;
    private final EntityReferenceService entityReferenceService;
    
    /**
     * Hämtar alla uppgifter med valfria filtreringsparametrar
     * 
     * @param status Uppgiftsstatus att filtrera på (valfritt)
     * @param priority Prioritet att filtrera på (valfritt)
     * @param tenantId Hyresgäst-ID att filtrera på (valfritt)
     * @param apartmentId Lägenhets-ID att filtrera på (valfritt)
     * @return Lista med filtrerade uppgifter
     */
    public List<Task> getAllTasks(String status, String priority, String tenantId, String apartmentId) {
        // Hämta alla uppgifter från databasen
        List<Task> allTasks = taskRepository.findAll();
        
        // Använd filterservice för att filtrera uppgifterna
        return taskFilterService.filterTasks(
            allTasks, 
            status, 
            priority, 
            tenantId, 
            apartmentId,
            null, // assignedToUserId
            null, // assignedByUserId
            null, // startDate
            null, // endDate
            null  // isOverdue
        );
    }
    
    /**
     * En utökad version av getAllTasks som stödjer alla filtreringsparametrar
     */
    public List<Task> getFilteredTasks(
            String status, 
            String priority, 
            String tenantId, 
            String apartmentId,
            String assignedToUserId,
            String assignedByUserId,
            LocalDate startDate,
            LocalDate endDate,
            Boolean isOverdue) {
        
        // Använd repository-metoder för att optimera databashämtning om möjligt
        List<Task> initialTasks;
        
        if (status != null && !status.isEmpty()) {
            initialTasks = taskRepository.findByStatus(status);
        } else if (priority != null && !priority.isEmpty()) {
            initialTasks = taskRepository.findByPriority(priority);
        } else if (tenantId != null && !tenantId.isEmpty()) {
            initialTasks = taskRepository.findByTenantId(tenantId);
        } else if (apartmentId != null && !apartmentId.isEmpty()) {
            initialTasks = taskRepository.findByApartmentId(apartmentId);
        } else if (startDate != null && endDate != null) {
            initialTasks = taskRepository.findByDueDateBetween(startDate, endDate);
        } else {
            initialTasks = taskRepository.findAll();
        }
        
        // Använd filterservice för att utföra resterande filtrering
        return taskFilterService.filterTasks(
            initialTasks, 
            status, 
            priority, 
            tenantId, 
            apartmentId,
            assignedToUserId,
            assignedByUserId,
            startDate,
            endDate,
            isOverdue
        );
    }
    
    public Optional<Task> getTaskById(String id) {
        return taskRepository.findById(id);
    }
    
    public Task saveTask(Task task) {
        log.info("Sparar uppgift: {}", task);
    
        // Använd EntityReferenceService för att synkronisera alla referenser
        task = entityReferenceService.syncTaskReferences(task);
        
        // Översätt uppgiftsbeskrivningen om det finns en och den inte redan har översättningar
        if (task.getDescription() != null && !task.getDescription().isEmpty() && 
            (task.getTranslations() == null || task.getTranslations().isEmpty())) {
            try {
                String sourceLanguage = translateClient.detectLanguage(task.getDescription());
                log.info("Detected language for task description: {}", sourceLanguage);
                
                // Översätt till alla stödda språk
                List<String> targetLanguages = List.of("sv", "en", "pl", "uk");
                Map<String, String> translations = translateClient.translateToMultipleLanguages(
                    task.getDescription(), 
                    sourceLanguage, 
                    targetLanguages
                );
                
                task.setTranslations(translations);
                log.info("Task description translated to {} languages", translations.size());
            } catch (Exception e) {
                log.error("Error translating task description: {}", e.getMessage(), e);
            }
        }
        
        Task savedTask = taskRepository.save(task);
        log.info("Uppgift sparad med ID: {}", savedTask.getId());
        return savedTask;
    }
    
    /**
     * Tar bort en uppgift och alla dess meddelanden
     * 
     * @param id ID för uppgiften
     */
    @Transactional
    public void deleteTask(String id) {
        // Ta bort alla meddelanden för uppgiften först
        taskMessageService.deleteAllMessagesForTask(id);
        
        // Ta sedan bort själva uppgiften
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
        return taskRepository.findByStatus(status);
    }
    
    public List<Task> getTasksByPriority(String priority) {
        return taskRepository.findByPriority(priority);
    }
    
    public List<Task> getTasksByTenantId(String tenantId) {
        return taskRepository.findByTenantId(tenantId);
    }
    
    public List<Task> getTasksByApartmentId(String apartmentId) {
        return taskRepository.findByApartmentId(apartmentId);
    }
    
    public List<Task> getTasksByAssignedUserId(String userId) {
        return getFilteredTasks(null, null, null, null, userId, null, null, null, null);
    }
    
    // Ny metod för att hämta uppgifter baserat på vem som tilldelade dem
    public List<Task> getTasksByAssignedByUserId(String userId) {
        return getFilteredTasks(null, null, null, null, null, userId, null, null, null);
    }
    
    public List<Task> getOverdueTasks() {
        return getFilteredTasks(null, null, null, null, null, null, null, null, true);
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
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Both startDate and endDate are required");
        }
        
        return getFilteredTasks(null, null, null, null, null, null, startDate, endDate, null);
    }
} 