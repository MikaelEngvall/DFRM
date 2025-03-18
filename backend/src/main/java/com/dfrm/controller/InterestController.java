package com.dfrm.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Interest;
import com.dfrm.model.User;
import com.dfrm.service.InterestService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;
    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(InterestController.class);

    @GetMapping
    public List<Interest> getAllInterests() {
        return interestService.getAllInterests();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interest> getInterestById(@PathVariable String id) {
        return interestService.getInterestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/for-review")
    public List<Interest> getInterestsForReview() {
        return interestService.findInterestsForReview();
    }

    @GetMapping("/reviewed")
    public ResponseEntity<List<Interest>> getReviewedInterests() {
        return ResponseEntity.ok(interestService.findReviewedInterests());
    }
    
    @PostMapping("/{id}/review")
    public ResponseEntity<Interest> reviewInterest(
            @PathVariable String id,
            @RequestBody Map<String, String> reviewData) {
        
        String reviewedById = reviewData.get("reviewedById");
        String comment = reviewData.get("comment");
        
        if (reviewedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Ogiltig användar-ID"));
            
            Interest interest = interestService.reviewInterest(id, reviewedBy, comment);
            return ResponseEntity.ok(interest);
        } catch (IllegalArgumentException e) {
            log.error("Fel vid granskning av intresse: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<Interest> rejectInterest(
            @PathVariable String id,
            @RequestBody Map<String, String> rejectData) {
        
        String reviewedById = rejectData.get("reviewedById");
        String comment = rejectData.get("comment");
        
        if (reviewedById == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            User reviewedBy = userService.getUserById(reviewedById)
                .orElseThrow(() -> new IllegalArgumentException("Ogiltig användar-ID"));
            
            Interest interest = interestService.rejectInterest(id, reviewedBy, comment);
            return ResponseEntity.ok(interest);
        } catch (IllegalArgumentException e) {
            log.error("Fel vid avvisning av intresse: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterest(@PathVariable String id) {
        return interestService.getInterestById(id)
                .map(interest -> {
                    interestService.deleteInterest(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/unreview-count")
    public ResponseEntity<Long> getUnreviewedCount() {
        long newCount = interestService.countByStatus("NEW");
        return ResponseEntity.ok(newCount);
    }
} 