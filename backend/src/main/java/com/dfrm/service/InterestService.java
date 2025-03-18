package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Interest;
import com.dfrm.model.User;
import com.dfrm.repository.InterestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterestService {
    
    private final InterestRepository interestRepository;
    
    public List<Interest> getAllInterests() {
        return interestRepository.findAll();
    }
    
    public Optional<Interest> getInterestById(String id) {
        return interestRepository.findById(id);
    }
    
    public List<Interest> findInterestsForReview() {
        return interestRepository.findByReviewedByIsNull();
    }
    
    public List<Interest> findReviewedInterests() {
        return interestRepository.findByReviewedByIsNotNullOrderByReviewedAtDesc();
    }
    
    public Interest reviewInterest(String id, User reviewedBy, String reviewComments) {
        Optional<Interest> interestOpt = interestRepository.findById(id);
        if (interestOpt.isEmpty()) {
            throw new IllegalArgumentException("Intresse med ID " + id + " hittades inte");
        }
        
        Interest interest = interestOpt.get();
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setReviewComments(reviewComments);
        interest.setStatus("REVIEWED");
        
        return interestRepository.save(interest);
    }
    
    public Interest rejectInterest(String id, User reviewedBy, String reviewComments) {
        Optional<Interest> interestOpt = interestRepository.findById(id);
        if (interestOpt.isEmpty()) {
            throw new IllegalArgumentException("Intresse med ID " + id + " hittades inte");
        }
        
        Interest interest = interestOpt.get();
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setReviewComments(reviewComments);
        interest.setStatus("REJECTED");
        
        return interestRepository.save(interest);
    }
    
    public void deleteInterest(String id) {
        interestRepository.deleteById(id);
    }
    
    public long countByStatus(String status) {
        return interestRepository.countByStatus(status);
    }
    
    public List<Interest> findInterestsByStatus(String status) {
        return interestRepository.findByStatus(status);
    }
} 