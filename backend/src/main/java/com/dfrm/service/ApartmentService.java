package com.dfrm.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.repository.ApartmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    
    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }
    
    public Optional<Apartment> getApartmentById(String id) {
        return apartmentRepository.findById(id);
    }
    
    public Apartment saveApartment(Apartment apartment) {
        return apartmentRepository.save(apartment);
    }
    
    public void deleteApartment(String id) {
        apartmentRepository.deleteById(id);
    }
    
    public List<Apartment> findByCity(String city) {
        return apartmentRepository.findByCity(city);
    }
    
    public List<Apartment> findByRoomsGreaterThanEqual(Integer rooms) {
        return apartmentRepository.findByRoomsGreaterThanEqual(rooms);
    }
    
    public List<Apartment> findByPriceLessThanEqual(Double price) {
        return apartmentRepository.findByPriceLessThanEqual(price);
    }
    
    public List<Apartment> findByAddress(String street, String number, String apartmentNumber) {
        return apartmentRepository.findByAddress(street, number, apartmentNumber);
    }
} 