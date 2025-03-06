package com.dfrm.repository;

import com.dfrm.model.Apartment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ApartmentRepository extends MongoRepository<Apartment, String> {
    List<Apartment> findByCity(String city);
    List<Apartment> findByRoomsGreaterThanEqual(Integer rooms);
    List<Apartment> findByPriceLessThanEqual(Double price);
    
    @Query("{'street': ?0, 'number': ?1, 'apartmentNumber': ?2}")
    List<Apartment> findByAddress(String street, String number, String apartmentNumber);
} 