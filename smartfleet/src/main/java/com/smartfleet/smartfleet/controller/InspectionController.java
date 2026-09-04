package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.InspectionDtos;
import com.smartfleet.smartfleet.entity.Inspection;
import com.smartfleet.smartfleet.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

/**
 * Contrôles de véhicules.
 *
 * Le conducteur contrôle l'engin qu'il prend et rend ; le gestionnaire contrôle
 * et consulte l'ensemble du parc. Un contrôle ne se modifie ni ne s'efface :
 * c'est un constat daté, le corriger reviendrait à réécrire ce qui a été
 * observé — d'où l'absence de mise à jour et de suppression.
 */
@RestController
@RequestMapping("/api/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE', 'CONDUCTEUR')")
    public ResponseEntity<InspectionDtos.Response> create(
        @Valid @RequestBody InspectionDtos.CreateRequest request
    ) {
        Inspection saved = inspectionService.record(
            request.getVehicleId(),
            request.getMissionId(),
            request.getType(),
            request.isTyresOk(),
            request.isBrakesOk(),
            request.isLightsOk(),
            request.isBodyworkOk(),
            request.getResult(),
            request.getAnomaly(),
            request.getKmReading(),
            null
        );
        return new ResponseEntity<>(InspectionDtos.Response.from(saved), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<InspectionDtos.Response>> list(
        @RequestParam(required = false) String vehicleId,
        @RequestParam(required = false) String missionId
    ) {
        List<Inspection> found;
        if (vehicleId != null) {
            found = inspectionService.findByVehicle(vehicleId);
        } else if (missionId != null) {
            found = inspectionService.findByMission(missionId);
        } else {
            found = inspectionService.findAll();
        }

        return ResponseEntity.ok(found.stream()
            .sorted(Comparator.comparing(Inspection::getCreatedAt).reversed())
            .map(InspectionDtos.Response::from)
            .toList());
    }
}
