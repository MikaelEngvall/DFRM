package com.dfrm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dfrm.model.Key;

@Repository
public interface KeyRepository extends MongoRepository<Key, String> {
    Optional<Key> findBySerieAndNumber(String serie, String number);
    List<Key> findByType(String type);
    List<Key> findByApartmentId(String apartmentId);
    List<Key> findByTenantId(String tenantId);
} 