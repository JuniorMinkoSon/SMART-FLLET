package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {
    private final DriverRepository driverRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Driver save(Driver driver) {
        if (driverRepository.findByEmail(driver.getEmail()).isPresent()) {
            throw new BusinessException("DRIVER_EMAIL_EXISTS", "Email déjà utilisé", 409);
        }
        return driverRepository.save(driver);
    }

    public Driver createDriver(String name, String email, String phone, List<String> skills) {
        if (driverRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("DRIVER_EMAIL_EXISTS", "Email déjà utilisé", 409);
        }

        try {
            String skillsJson = skills != null && !skills.isEmpty() ?
                objectMapper.writeValueAsString(skills) : "[]";

            Driver driver = Driver.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .status(DriverStatus.DISPONIBLE)
                .skills(skillsJson)
                .build();

            return driverRepository.save(driver);
        } catch (Exception e) {
            throw new BusinessException("SKILLS_ERROR", "Erreur lors du traitement des compétences", 400);
        }
    }

    public Optional<Driver> getDriverById(String id) {
        return driverRepository.findById(id);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByStatus(DriverStatus.DISPONIBLE);
    }
}
