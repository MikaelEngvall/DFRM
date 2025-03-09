package com.dfrm.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dfrm.model.Task;
import com.dfrm.model.TaskStatus;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignedUserId(String userId);
    List<Task> findByApartmentId(String apartmentId);
    List<Task> findByTenantId(String tenantId);
    List<Task> findByDueDateBetween(LocalDate startDate, LocalDate endDate);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);
} 