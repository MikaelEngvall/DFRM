package com.dfrm.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.dfrm.model.Apartment;
import com.dfrm.model.Tenant;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.TenantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportService {
    
    private final TenantRepository tenantRepository;
    private final ApartmentRepository apartmentRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    /**
     * Importerar hyresgäster och lägenheter från en Excel-fil baserat på en sökväg.
     */
    public void importTenantsAndApartments(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(new File(filePath));
             Workbook workbook = new XSSFWorkbook(fis)) {
            processWorkbook(workbook);
        }
    }
    
    /**
     * Importerar hyresgäster och lägenheter från en uppladdad Excel-fil.
     */
    public void importTenantsAndApartmentsFromInputStream(InputStream inputStream) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            processWorkbook(workbook);
        }
    }
    
    /**
     * Bearbetar ett workbook och skapar hyresgäster och lägenheter.
     */
    private void processWorkbook(Workbook workbook) {
        Sheet sheet = workbook.getSheetAt(0);
        
        // Hoppa över rubrikraden
        int startRow = 1;
        int lastRow = sheet.getLastRowNum();
        
        log.info("Börjar importera {} rader från Excel-filen", lastRow - startRow + 1);
        
        // Lista för att hålla reda på skapade entiteter
        List<String> createdEntities = new ArrayList<>();
        
        for (int i = startRow; i <= lastRow; i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
            
            try {
                // Hämta cellvärden
                String fullName = getCellValueAsString(row.getCell(0));
                String email = getCellValueAsString(row.getCell(1));
                String phone = getCellValueAsString(row.getCell(2));
                String apartmentInfo = getCellValueAsString(row.getCell(3));
                String streetInfo = getCellValueAsString(row.getCell(4));
                double area = getCellValueAsDouble(row.getCell(5));
                String moveInDateString = getCellValueAsString(row.getCell(7));
                String rent = getCellValueAsString(row.getCell(10));
                
                // Hoppa över rader utan persondata
                if (fullName.isEmpty() || email.isEmpty()) {
                    log.warn("Rad {} hoppas över pga. saknade värden", i);
                    continue;
                }
                
                // Bearbeta data
                String[] nameParts = fullName.split(" ", 2);
                String firstName = nameParts[0];
                String lastName = nameParts.length > 1 ? nameParts[1] : "";
                
                String apartmentNumber = "";
                if (apartmentInfo.contains("Lgh") && apartmentInfo.contains("/")) {
                    apartmentNumber = apartmentInfo.substring(apartmentInfo.indexOf("Lgh") + 4, apartmentInfo.indexOf("/"));
                }
                
                String[] streetParts = streetInfo.split(" ");
                String street = String.join(" ", java.util.Arrays.copyOf(streetParts, streetParts.length - 1));
                String number = streetParts[streetParts.length - 1];
                
                String city = "Karlskrona";
                String postalCode = getPostalCodeForKarlskrona(street);
                
                LocalDate moveInDate = LocalDate.parse(moveInDateString, DATE_FORMATTER);
                
                double rentValue = 0;
                if (rent != null && !rent.isEmpty()) {
                    // Ta bort alla icke-numeriska tecken utom punkt och komma
                    String cleanedRent = rent.replaceAll("[^0-9.,]", "").replace(",", ".");
                    // Om strängen innehåller en punkt, tolka den som ett decimaltal
                    if (cleanedRent.contains(".")) {
                        rentValue = Double.parseDouble(cleanedRent);
                    } else {
                        rentValue = Double.parseDouble(cleanedRent);
                    }
                }
                
                // Skapa eller uppdatera lägenhet
                Apartment apartment = createOrUpdateApartment(street, number, apartmentNumber, city, postalCode, area, rentValue);
                
                // Skapa eller uppdatera hyresgäst
                Tenant tenant = createOrUpdateTenant(firstName, lastName, email, phone, moveInDate, apartment);
                
                // Uppdatera lägenheten med hyresgästen
                updateApartmentWithTenant(apartment, tenant);
                
                createdEntities.add("Skapade hyresgäst: " + firstName + " " + lastName + 
                                    " och lägenhet: " + street + " " + number + ", lgh " + apartmentNumber);
                
            } catch (Exception e) {
                log.error("Fel vid import av rad {}: {}", i, e.getMessage());
            }
        }
        
        // Logga skapade entiteter
        createdEntities.forEach(log::info);
        log.info("Import slutförd. Skapade {} hyresgäster och lägenheter", createdEntities.size());
    }
    
    private String getPostalCodeForKarlskrona(String street) {
        // Förenklad postnummerlogik för Karlskrona
        if (street.toLowerCase().contains("chapmansgatan")) {
            return "37141";
        } else if (street.toLowerCase().contains("landbrogatan")) {
            return "37134";
        } else if (street.toLowerCase().contains("ronnebygatan")) {
            return "37133";
        } else {
            return "37130"; // Default postnummer
        }
    }
    
    private Apartment createOrUpdateApartment(String street, String number, String apartmentNumber, 
                                             String city, String postalCode, double area, double rent) {
        
        List<Apartment> existingApts = apartmentRepository.findByStreetAndNumberAndApartmentNumber(street, number, apartmentNumber);
        
        if (!existingApts.isEmpty()) {
            Apartment apt = existingApts.get(0);
            apt.setStreet(street);
            apt.setNumber(number);
            apt.setApartmentNumber(apartmentNumber);
            apt.setCity(city);
            apt.setPostalCode(postalCode);
            apt.setArea(area);
            apt.setPrice(rent);
            return apartmentRepository.save(apt);
        } else {
            Apartment apt = new Apartment();
            apt.setStreet(street);
            apt.setNumber(number);
            apt.setApartmentNumber(apartmentNumber);
            apt.setCity(city);
            apt.setPostalCode(postalCode);
            apt.setArea(area);
            apt.setPrice(rent);
            apt.setElectricity(true);
            apt.setInternet(true);
            apt.setStorage(true);
            apt.setRooms((int) Math.ceil(area / 20)); // Uppskatta antal rum baserat på yta
            apt.setTenants(new ArrayList<>());
            apt.setKeys(new ArrayList<>());
            return apartmentRepository.save(apt);
        }
    }
    
    private Tenant createOrUpdateTenant(String firstName, String lastName, String email, 
                                       String phone, LocalDate moveInDate, Apartment apartment) {
        
        Optional<Tenant> existingTenant = tenantRepository.findByEmail(email);
        
        if (existingTenant.isPresent()) {
            Tenant tenant = existingTenant.get();
            tenant.setFirstName(firstName);
            tenant.setLastName(lastName);
            tenant.setPhone(phone);
            tenant.setMovedInDate(moveInDate);
            
            if (tenant.getApartment() == null || !tenant.getApartment().getId().equals(apartment.getId())) {
                tenant.setApartment(apartment);
            }
            
            return tenantRepository.save(tenant);
        } else {
            Tenant tenant = new Tenant();
            tenant.setFirstName(firstName);
            tenant.setLastName(lastName);
            tenant.setEmail(email);
            tenant.setPhone(phone);
            tenant.setMovedInDate(moveInDate);
            tenant.setApartment(apartment);
            tenant.setKeys(new ArrayList<>());
            
            return tenantRepository.save(tenant);
        }
    }
    
    private void updateApartmentWithTenant(Apartment apartment, Tenant tenant) {
        if (apartment.getTenants() == null) {
            apartment.setTenants(new ArrayList<>());
        }
        
        boolean tenantExists = apartment.getTenants().stream()
                .anyMatch(t -> t.getId().equals(tenant.getId()));
        
        if (!tenantExists) {
            apartment.getTenants().add(tenant);
            apartmentRepository.save(apartment);
        }
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().format(DATE_FORMATTER);
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    try {
                        return String.valueOf(cell.getNumericCellValue());
                    } catch (Exception ex) {
                        return "";
                    }
                }
            default:
                return "";
        }
    }
    
    private double getCellValueAsDouble(Cell cell) {
        if (cell == null) return 0.0;
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue().replaceAll("[^0-9.,]", "").replace(",", "."));
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            case FORMULA:
                try {
                    return cell.getNumericCellValue();
                } catch (Exception e) {
                    return 0.0;
                }
            default:
                return 0.0;
        }
    }
} 