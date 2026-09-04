package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.MaintenanceDtos;
import com.smartfleet.smartfleet.entity.Maintenance;
import com.smartfleet.smartfleet.entity.MaintenanceStatus;
import com.smartfleet.smartfleet.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Interventions de maintenance.
 *
 * Réservées aux rôles de gestion : décider qu'un engin part à l'atelier ou en
 * revient engage la disponibilité de la flotte. Le conducteur signale un défaut
 * par un contrôle, il ne planifie pas la réparation.
 */
@RestController
@RequestMapping("/api/maintenances")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MaintenanceDtos.Response> schedule(
        @Valid @RequestBody MaintenanceDtos.ScheduleRequest request
    ) {
        Maintenance saved = maintenanceService.schedule(
            request.getVehicleId(),
            request.getType(),
            request.getDescription(),
            request.getScheduledDate(),
            request.getProvider(),
            null
        );
        return new ResponseEntity<>(MaintenanceDtos.Response.from(saved), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<MaintenanceDtos.Response>> list(
        @RequestParam(required = false) String vehicleId,
        @RequestParam(required = false) MaintenanceStatus status
    ) {
        List<Maintenance> found;
        if (vehicleId != null) {
            found = maintenanceService.findByVehicle(vehicleId);
        } else if (status != null) {
            found = maintenanceService.findByStatus(status);
        } else {
            found = maintenanceService.findAll();
        }
        return ResponseEntity.ok(found.stream().map(MaintenanceDtos.Response::from).toList());
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MaintenanceDtos.Response> start(@PathVariable String id) {
        return ResponseEntity.ok(MaintenanceDtos.Response.from(maintenanceService.start(id)));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MaintenanceDtos.Response> complete(
        @PathVariable String id,
        @RequestBody MaintenanceDtos.CompleteRequest request
    ) {
        Maintenance saved = maintenanceService.complete(
            id,
            request.getCost(),
            request.getProvider(),
            request.getNotes(),
            request.getResultingCondition()
        );
        return ResponseEntity.ok(MaintenanceDtos.Response.from(saved));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MaintenanceDtos.Response> cancel(@PathVariable String id) {
        return ResponseEntity.ok(MaintenanceDtos.Response.from(maintenanceService.cancel(id)));
    }
}
