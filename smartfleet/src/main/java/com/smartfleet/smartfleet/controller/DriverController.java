package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.*;
import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;
    private final ObjectMapper objectMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Driver> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        try {
            Driver driver = Driver.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .licenseType(request.getLicenseType())
                .skills(request.getSkills() != null ? objectMapper.writeValueAsString(request.getSkills()) : "[]")
                .vehicleCategories(request.getVehicleCategories() != null ? objectMapper.writeValueAsString(request.getVehicleCategories()) : "[]")
                .build();
            Driver saved = driverService.save(driver);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Driver> getDriver(@PathVariable String id) {
        return driverService.getDriverById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }
}
