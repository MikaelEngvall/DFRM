package com.dfrm.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dfrm.model.SecurityToken;
import com.dfrm.model.User;

@Repository
public interface SecurityTokenRepository extends MongoRepository<SecurityToken, String> {
    Optional<SecurityToken> findByToken(String token);
    Optional<SecurityToken> findByUserAndTokenTypeAndUsed(User user, SecurityToken.TokenType tokenType, boolean used);
} 