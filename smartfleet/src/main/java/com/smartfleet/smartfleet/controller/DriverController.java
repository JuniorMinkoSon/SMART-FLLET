package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.CreateDriverRequest;
import com.smartfleet.smartfleet.dto.DriverResponse;
import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        Driver driver = driverService.createDriver(
            request.getName(),
            request.getEmail(),
            request.getPhone(),
            request.getSkills()
        );
        return new ResponseEntity<>(mapToResponse(driver), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        List<Driver> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers.stream().map(this::mapToResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriver(@PathVariable String id) {
        Driver driver = driverService.getDriverById(id);
        return ResponseEntity.ok(mapToResponse(driver));
    }

    @GetMapping("/available")
    public ResponseEntity<List<DriverResponse>> getAvailableDrivers() {
        List<Driver> drivers = driverService.getAvailableDrivers();
        return ResponseEntity.ok(drivers.stream().map(this::mapToResponse).toList());
    }

    private DriverResponse mapToResponse(Driver driver) {
        return new DriverResponse(
            driver.getId(),
            driver.getName(),
            driver.getEmail(),
            driver.getPhone(),
            driver.getStatus(),
            driver.getSkills(),
            driver.getCreatedAt(),
            driver.getUpdatedAt()
        );
    }
}
