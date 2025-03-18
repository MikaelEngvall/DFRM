package com.dfrm.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dfrm.model.Interest;

@Repository
public interface InterestRepository extends MongoRepository<Interest, String> {
    List<Interest> findByReviewedByIsNull();
    List<Interest> findByStatus(String status);
    List<Interest> findByReviewedByIsNotNullOrderByReviewedAtDesc();
    long countByStatus(String status);
} 