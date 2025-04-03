package com.dfrm.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.dfrm.model.Task;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Hjälpklass för att hantera olika typer av filtrering för uppgifter.
 * Denna klass avser att centralisera och standardisera filtreringslogiken.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TaskFilterService {

    /**
     * Filtrerar en lista med uppgifter baserat på filtreringsparametrar
     * 
     * @param tasks Lista med uppgifter att filtrera
     * @param status Uppgiftsstatus att filtrera på (valfritt)
     * @param priority Prioritet att filtrera på (valfritt)
     * @param tenantId Hyresgäst-ID att filtrera på (valfritt)
     * @param apartmentId Lägenhets-ID att filtrera på (valfritt)
     * @param assignedToUserId Användar-ID för tilldelad person (valfritt)
     * @param assignedByUserId Användar-ID för den som tilldelade uppgiften (valfritt)
     * @param startDate Startdatum för datumintervall (valfritt)
     * @param endDate Slutdatum för datumintervall (valfritt)
     * @param isOverdue Om true, inkludera endast förfallna uppgifter (valfritt)
     * @return Filtrerad lista med uppgifter
     */
    public List<Task> filterTasks(List<Task> tasks, 
                                 String status, 
                                 String priority, 
                                 String tenantId, 
                                 String apartmentId,
                                 String assignedToUserId,
                                 String assignedByUserId,
                                 LocalDate startDate,
                                 LocalDate endDate,
                                 Boolean isOverdue) {
        
        log.debug("Filtrerar {} uppgifter med parametrar: status={}, priority={}, tenantId={}, apartmentId={}, " +
                 "assignedToUserId={}, assignedByUserId={}, startDate={}, endDate={}, isOverdue={}",
                 tasks.size(), status, priority, tenantId, apartmentId, assignedToUserId, 
                 assignedByUserId, startDate, endDate, isOverdue);
        
        // Om inga filtreringsparametrar angivits, returnera den ursprungliga listan
        if (areAllFiltersEmpty(status, priority, tenantId, apartmentId, assignedToUserId, 
                              assignedByUserId, startDate, endDate, isOverdue)) {
            return tasks;
        }
        
        // Bygg upp en lista med predikat baserat på de angivna filtreringsparametrarna
        List<Predicate<Task>> predicates = buildPredicates(status, priority, tenantId, apartmentId, 
                                                     assignedToUserId, assignedByUserId, 
                                                     startDate, endDate, isOverdue);
        
        // Applicera alla predikat på listan av uppgifter
        List<Task> filteredTasks = tasks.stream()
                .filter(predicates.stream().reduce(x -> true, Predicate::and))
                .collect(Collectors.toList());
        
        log.debug("Filtrering resulterade i {} uppgifter", filteredTasks.size());
        
        return filteredTasks;
    }
    
    /**
     * Kontrollerar om alla filtreringsparametrar är null eller tomma
     */
    private boolean areAllFiltersEmpty(String status, String priority, String tenantId, String apartmentId,
                                    String assignedToUserId, String assignedByUserId, 
                                    LocalDate startDate, LocalDate endDate, Boolean isOverdue) {
        return (status == null || status.isEmpty()) &&
               (priority == null || priority.isEmpty()) &&
               (tenantId == null || tenantId.isEmpty()) &&
               (apartmentId == null || apartmentId.isEmpty()) &&
               (assignedToUserId == null || assignedToUserId.isEmpty()) &&
               (assignedByUserId == null || assignedByUserId.isEmpty()) &&
               startDate == null && endDate == null && isOverdue == null;
    }
    
    /**
     * Bygger upp en lista med predikat baserat på de angivna filtreringsparametrarna
     */
    private List<Predicate<Task>> buildPredicates(String status, String priority, String tenantId, String apartmentId,
                                             String assignedToUserId, String assignedByUserId, 
                                             LocalDate startDate, LocalDate endDate, Boolean isOverdue) {
        
        List<Predicate<Task>> predicates = new ArrayList<>();
        
        // Lägg till predikat för status
        if (status != null && !status.isEmpty()) {
            predicates.add(task -> status.equals(task.getStatus()));
        }
        
        // Lägg till predikat för priority
        if (priority != null && !priority.isEmpty()) {
            predicates.add(task -> priority.equals(task.getPriority()));
        }
        
        // Lägg till predikat för tenantId
        if (tenantId != null && !tenantId.isEmpty()) {
            predicates.add(task -> tenantId.equals(task.getTenantId()));
        }
        
        // Lägg till predikat för apartmentId
        if (apartmentId != null && !apartmentId.isEmpty()) {
            predicates.add(task -> apartmentId.equals(task.getApartmentId()));
        }
        
        // Lägg till predikat för assignedToUserId
        if (assignedToUserId != null && !assignedToUserId.isEmpty()) {
            predicates.add(task -> assignedToUserId.equals(task.getAssignedToUserId()));
        }
        
        // Lägg till predikat för assignedByUserId
        if (assignedByUserId != null && !assignedByUserId.isEmpty()) {
            predicates.add(task -> assignedByUserId.equals(task.getAssignedByUserId()));
        }
        
        // Lägg till predikat för datumintervall
        if (startDate != null && endDate != null) {
            predicates.add(task -> {
                if (task.getDueDate() == null) {
                    return false;
                }
                return !task.getDueDate().isBefore(startDate) && !task.getDueDate().isAfter(endDate);
            });
        } else if (startDate != null) {
            predicates.add(task -> {
                if (task.getDueDate() == null) {
                    return false;
                }
                return !task.getDueDate().isBefore(startDate);
            });
        } else if (endDate != null) {
            predicates.add(task -> {
                if (task.getDueDate() == null) {
                    return false;
                }
                return !task.getDueDate().isAfter(endDate);
            });
        }
        
        // Lägg till predikat för förfallna uppgifter
        if (isOverdue != null && isOverdue) {
            LocalDate today = LocalDate.now();
            List<String> completedStatuses = List.of("COMPLETED", "APPROVED");
            predicates.add(task -> 
                task.getDueDate() != null && 
                task.getDueDate().isBefore(today) && 
                !completedStatuses.contains(task.getStatus())
            );
        }
        
        return predicates;
    }
} 