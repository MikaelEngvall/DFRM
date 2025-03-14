package com.dfrm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.dfrm.model.Apartment;

@Repository
public interface ApartmentRepository extends MongoRepository<Apartment, String> {
    List<Apartment> findByCity(String city);
    List<Apartment> findByRoomsGreaterThanEqual(Integer rooms);
    List<Apartment> findByPriceLessThanEqual(Double price);
    
    @Query("{'street': ?0, 'number': ?1, 'apartmentNumber': ?2}")
    List<Apartment> findByAddress(String street, String number, String apartmentNumber);

    List<Apartment> findByStreetAndNumberAndApartmentNumber(String street, String number, String apartmentNumber);
    
    // Sök lägenhet utifrån adress (som innehåller gatunummer) och lägenhetsnummer
    @Query("{'street': {$regex: ?0, $options: 'i'}, 'apartmentNumber': ?1}")
    Optional<Apartment> findByStreetAddressAndApartmentNumber(String streetAddress, String apartmentNumber);

    Optional<Apartment> findByApartmentNumber(String apartmentNumber);

    Optional<Apartment> findByStreetAndNumber(String street, String number);
} 