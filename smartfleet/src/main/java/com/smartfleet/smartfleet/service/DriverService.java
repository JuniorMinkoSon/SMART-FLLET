package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {
    private final DriverRepository driverRepository;

    public Driver createDriver(String name, String email, String phone, Set<String> skills) {
        if (driverRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("DRIVER_EMAIL_EXISTS", "Email déjà utilisé", 409);
        }

        Driver driver = Driver.builder()
            .name(name)
            .email(email)
            .phone(phone)
            .status(DriverStatus.DISPONIBLE)
            .skills(skills != null ? skills : Set.of())
            .build();

        return driverRepository.save(driver);
    }

    public Driver getDriverById(String id) {
        return driverRepository.findById(id)
            .orElseThrow(() -> new BusinessException("DRIVER_NOT_FOUND", "Conducteur non trouvé", 404));
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByStatus(DriverStatus.DISPONIBLE);
    }
}
