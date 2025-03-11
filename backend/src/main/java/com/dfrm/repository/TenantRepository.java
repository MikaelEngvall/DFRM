package com.dfrm.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.dfrm.model.Tenant;

public interface TenantRepository extends MongoRepository<Tenant, String> {
    Optional<Tenant> findByPersonnummer(String personnummer);
    List<Tenant> findByLastName(String lastName);
    List<Tenant> findByMovedInDateBetween(LocalDate startDate, LocalDate endDate);
    List<Tenant> findByResiliationDateIsNotNull();
    Optional<Tenant> findByEmail(String email);
} 