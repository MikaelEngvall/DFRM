package com.dfrm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dfrm.model.TaskMessage;

@Repository
public interface TaskMessageRepository extends MongoRepository<TaskMessage, String> {
    // Hämta alla meddelanden för en specifik uppgift
    List<TaskMessage> findByTaskIdOrderByTimestampAsc(String taskId);
    
    // Radera alla meddelanden för en specifik uppgift
    void deleteByTaskId(String taskId);
} 