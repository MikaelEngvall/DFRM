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
    private final InterestEmailListener interestEmailListener;
    
    public List<Interest> getAllInterests() {
        return interestRepository.findAll();
    }
    
    public Optional<Interest> getInterestById(String id) {
        return interestRepository.findById(id);
    }
    
    public List<Interest> findInterestsForReview() {
        return interestRepository.findByStatusOrderByReceivedDesc("NEW");
    }
    
    public List<Interest> findReviewedInterests() {
        return interestRepository.findByStatusNotOrderByReviewedAtDesc("NEW");
    }
    
    public Interest reviewInterest(String id, User reviewedBy, String comment) {
        Interest interest = interestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found"));
        
        if (!"NEW".equals(interest.getStatus())) {
            throw new IllegalArgumentException("Interest is already reviewed");
        }
        
        interest.setStatus("REVIEWED");
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setReviewComments(comment);
        
        return interestRepository.save(interest);
    }
    
    public Interest rejectInterest(String id, User reviewedBy, String comment) {
        Interest interest = interestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Interest not found"));
        
        if (!"NEW".equals(interest.getStatus())) {
            throw new IllegalArgumentException("Interest is already reviewed");
        }
        
        interest.setStatus("REJECTED");
        interest.setReviewedBy(reviewedBy);
        interest.setReviewedAt(LocalDateTime.now());
        interest.setReviewComments(comment);
        
        return interestRepository.save(interest);
    }
    
    public void deleteInterest(String id) {
        interestRepository.deleteById(id);
    }
    
    public long countByStatus(String status) {
        return interestRepository.countByStatus(status);
    }
    
    public void checkEmails() {
        log.info("Manuell läsning av intresse-e-post initierad");
        interestEmailListener.checkEmails();
        log.info("Manuell läsning av intresse-e-post slutförd");
    }
} 