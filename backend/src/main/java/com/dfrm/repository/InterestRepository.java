package com.dfrm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dfrm.model.Interest;

@Repository
public interface InterestRepository extends MongoRepository<Interest, String> {
    List<Interest> findByStatus(String status);
    List<Interest> findByReviewedByIsNull();
    List<Interest> findByReviewedByIsNotNullOrderByReviewedAtDesc();
    long countByStatus(String status);
    
    // Nya metoder för sortering
    List<Interest> findByStatusOrderByReceivedDesc(String status);
    List<Interest> findByStatusNotOrderByReviewedAtDesc(String status);
    
    // Metod för att hitta intresseanmälningar baserat på e-postadress
    List<Interest> findByEmail(String email);
    
    // Metod för att hitta intresseanmälningar baserat på hashId (för dubblettdetektering)
    Optional<Interest> findByHashId(String hashId);
    boolean existsByHashId(String hashId);
} 