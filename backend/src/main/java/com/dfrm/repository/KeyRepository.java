package com.dfrm.repository;

import com.dfrm.model.Key;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface KeyRepository extends MongoRepository<Key, String> {
    Optional<Key> findBySerieAndNumber(String serie, String number);
    List<Key> findByType(String type);
    List<Key> findByApartmentId(String apartmentId);
    List<Key> findByTenantId(String tenantId);
} 