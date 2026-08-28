package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.CreateVehicleRequest;
import com.smartfleet.smartfleet.dto.VehicleResponse;
import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody CreateVehicleRequest request) {
        Vehicle vehicle = vehicleService.createVehicle(
            request.getCode(),
            request.getType(),
            request.getLicensePlate(),
            request.getInitialKm(),
            request.getFuelLevel()
        );
        return new ResponseEntity<>(mapToResponse(vehicle), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(vehicles.stream().map(this::mapToResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable String id) {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(mapToResponse(vehicle));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<VehicleResponse>> getAvailableVehicles() {
        List<Vehicle> vehicles = vehicleService.getAvailableVehicles();
        return ResponseEntity.ok(vehicles.stream().map(this::mapToResponse).toList());
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return new VehicleResponse(
            vehicle.getId(),
            vehicle.getCode(),
            vehicle.getType(),
            vehicle.getLicensePlate(),
            vehicle.getStatus(),
            vehicle.getInitialKm(),
            vehicle.getCurrentKm(),
            vehicle.getEngineHours(),
            vehicle.getFuelLevel(),
            vehicle.getCreatedAt(),
            vehicle.getUpdatedAt()
        );
    }
}
