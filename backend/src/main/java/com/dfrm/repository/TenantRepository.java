package com.dfrm.repository;

import com.dfrm.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TenantRepository extends MongoRepository<Tenant, String> {
    Optional<Tenant> findByPersonnummer(String personnummer);
    List<Tenant> findByLastName(String lastName);
    List<Tenant> findByMovedInDateBetween(LocalDate startDate, LocalDate endDate);
    List<Tenant> findByResiliationDateIsNotNull();
} 