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
    
    public List<Task> getAllTasks(String status, String priority, String tenantId, String apartmentId) {
        // Använd specifika repository-metoder baserat på parametrarna
        if (status != null && !status.isEmpty()) {
            return taskRepository.findByStatus(status);
        } else if (priority != null && !priority.isEmpty()) {
            return taskRepository.findByPriority(priority);
        } else if (tenantId != null && !tenantId.isEmpty()) {
            return taskRepository.findByTenantId(tenantId);
        } else if (apartmentId != null && !apartmentId.isEmpty()) {
            return taskRepository.findByApartmentId(apartmentId);
        }
        
        return taskRepository.findAll();
    }
    
    public Optional<Task> getTaskById(String id) {
        return taskRepository.findById(id);
    }
    
    public Task saveTask(Task task) {
        log.info("Sparar uppgift: {}", task);
    
        // Om bara tenantId är angivet men inte tenant-referensen, försök att hitta
        // och sätta tenant-referensen för bakåtkompatibilitet
        if (task.getTenantId() != null && task.getTenant() == null) {
            tenantRepository.findById(task.getTenantId()).ifPresent(tenant -> {
                task.setTenant(tenant);
                log.info("Satte tenant-referens baserat på tenantId: {}", tenant.getId());
            });
        }
        
        // Om bara apartmentId är angivet men inte apartment-referensen, försök att hitta
        // och sätta apartment-referensen för bakåtkompatibilitet
        if (task.getApartmentId() != null && task.getApartment() == null) {
            apartmentRepository.findById(task.getApartmentId()).ifPresent(apartment -> {
                task.setApartment(apartment);
                log.info("Satte apartment-referens baserat på apartmentId: {}", apartment.getId());
            });
        }
        
        // Om bara assignedToUserId är angivet men inte assignedUser-referensen, försök att hitta
        // och sätta assignedUser-referensen för bakåtkompatibilitet
        if (task.getAssignedToUserId() != null && task.getAssignedUser() == null) {
            userRepository.findById(task.getAssignedToUserId()).ifPresent(user -> {
                task.setAssignedUser(user);
                log.info("Satte assignedUser-referens baserat på assignedToUserId: {}", user.getId());
            });
        }
        
        // Om datumet har en tidsdel, ta bort den
        if (task.getDueDate() != null) {
            // Garantera att vi bara har LocalDate utan tidsdel
            LocalDate dueDate = task.getDueDate();
            task.setDueDate(dueDate); // Detta säkerställer att endast datumdelen används
            log.info("Normaliserade dueDate: {}", dueDate);
        }
        
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
        return taskRepository.findByAssignedUserId(userId);
    }
    
    // Ny metod för att hämta uppgifter baserat på vem som tilldelade dem
    public List<Task> getTasksByAssignedByUserId(String userId) {
        return taskRepository.findAll().stream()
                .filter(task -> userId.equals(task.getAssignedByUserId()))
                .toList();
    }
    
    public List<Task> getOverdueTasks() {
        LocalDate today = LocalDate.now();
        List<String> completedStatuses = List.of("COMPLETED", "APPROVED");
        return taskRepository.findByDueDateBeforeAndStatusNotIn(today, completedStatuses);
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