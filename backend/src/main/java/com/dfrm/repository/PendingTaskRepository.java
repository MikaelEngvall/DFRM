package com.dfrm.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dfrm.model.PendingTask;

@Repository
public interface PendingTaskRepository extends MongoRepository<PendingTask, String> {
    List<PendingTask> findByRequestedById(String userId);
    List<PendingTask> findByReviewedById(String userId);
    List<PendingTask> findByReviewedByIsNull();
    List<PendingTask> findByRequestedAtAfter(LocalDateTime date);
    Optional<PendingTask> findByTaskId(String taskId);
    List<PendingTask> findByReviewedByIsNotNullAndTask_StatusOrderByReviewedAtDesc(String status);
} 