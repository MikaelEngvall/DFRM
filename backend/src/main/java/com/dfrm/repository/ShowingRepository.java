package com.dfrm.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.dfrm.model.Showing;

@Repository
public interface ShowingRepository extends MongoRepository<Showing, String> {
    List<Showing> findByStatus(String status);
    List<Showing> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Showing> findByAssignedToId(String userId);
    List<Showing> findByRelatedInterestId(String interestId);
    long countByStatus(String status);
    List<Showing> findByAssignedToIdAndStatus(String userId, String status);
    
    @Query("{'assignedTo': null}")
    List<Showing> findUnassignedShowings();
    
    @Query("{'assignedTo': { $exists: true, $ne: null }}")
    List<Showing> findAssignedShowings();
} 