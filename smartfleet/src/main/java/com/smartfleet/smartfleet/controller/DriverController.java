package com.smartfleet.smartfleet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

/**
 * Conducteurs.
 *
 * Les réponses passent par {@link DriverResponse} et non par l'entité. Renvoyer
 * l'entité exposait sa relation vers le compte utilisateur — donc la structure
 * interne de l'authentification — et laissait les compétences sous leur forme de
 * stockage, une chaîne JSON que chaque écran devait décoder lui-même.
 */
@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final ObjectMapper objectMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        try {
            Driver driver = Driver.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .licenseType(request.getLicenseType())
                .skills(request.getSkills() != null
                    ? objectMapper.writeValueAsString(request.getSkills()) : "[]")
                .vehicleCategories(request.getVehicleCategories() != null
                    ? objectMapper.writeValueAsString(request.getVehicleCategories()) : "[]")
                .build();

            Driver saved = driverService.save(driver);
            return new ResponseEntity<>(DriverResponse.from(saved), HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers().stream()
            .map(DriverResponse::from)
            .toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<DriverResponse> getDriver(@PathVariable String id) {
        return driverService.getDriverById(id)
            .map(DriverResponse::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<DriverResponse>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers().stream()
            .map(DriverResponse::from)
            .toList());
    }
}
