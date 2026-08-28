package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.*;
import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.entity.FuelEntry;
import com.smartfleet.smartfleet.service.MissionService;
import com.smartfleet.smartfleet.service.FuelEntryService;
import com.smartfleet.smartfleet.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {
    private final MissionService missionService;
    private final FuelEntryService fuelEntryService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MissionResponse> createMission(@Valid @RequestBody CreateMissionRequest request) {
        String actorId = securityUtil.getCurrentUserId();
        Mission mission = missionService.createMission(
            request.getVehicleId(),
            request.getDriverId(),
            request.getStartDate(),
            request.getEndDate(),
            request.getSite(),
            request.getClient(),
            request.getBudget(),
            actorId
        );
        return new ResponseEntity<>(mapToResponse(mission), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<MissionResponse>> getAllMissions() {
        List<Mission> missions = missionService.getAllMissions();
        return ResponseEntity.ok(missions.stream().map(this::mapToResponse).toList());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<List<MissionResponse>> getMyMissions() {
        String driverId = securityUtil.getCurrentUserId();
        List<Mission> missions = missionService.getMissionsByDriver(driverId);
        return ResponseEntity.ok(missions.stream().map(this::mapToResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissionResponse> getMission(@PathVariable String id) {
        Mission mission = missionService.getMissionById(id);
        return ResponseEntity.ok(mapToResponse(mission));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<MissionResponse> startMission(
        @PathVariable String id,
        @Valid @RequestBody StartMissionRequest request) {
        String actorId = securityUtil.getCurrentUserId();
        Mission mission = missionService.startMission(
            id,
            request.getKm(),
            request.getEngineHours(),
            request.getFuel(),
            actorId
        );
        return ResponseEntity.ok(mapToResponse(mission));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<MissionResponse> returnMission(
        @PathVariable String id,
        @Valid @RequestBody ReturnMissionRequest request) {
        String actorId = securityUtil.getCurrentUserId();
        Mission mission = missionService.returnMission(
            id,
            request.getKm(),
            request.getEngineHours(),
            request.getFuel(),
            actorId
        );
        return ResponseEntity.ok(mapToResponse(mission));
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MissionResponse> validateReturn(@PathVariable String id) {
        String actorId = securityUtil.getCurrentUserId();
        Mission mission = missionService.validateReturn(id, actorId);
        return ResponseEntity.ok(mapToResponse(mission));
    }

    @PostMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MissionResponse> sendToMaintenance(@PathVariable String id) {
        String actorId = securityUtil.getCurrentUserId();
        Mission mission = missionService.sendToMaintenance(id, actorId);
        return ResponseEntity.ok(mapToResponse(mission));
    }

    @PostMapping("/{id}/fuel")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<FuelEntryResponse> recordFuel(
        @PathVariable String id,
        @Valid @RequestBody CreateFuelEntryRequest request) {
        String driverId = securityUtil.getCurrentUserId();
        String actorId = securityUtil.getCurrentUserId();
        var fuelEntry = fuelEntryService.recordFuel(
            id,
            driverId,
            request.getQuantity(),
            request.getCost(),
            request.getStation(),
            request.getReceiptUrl(),
            actorId
        );
        return new ResponseEntity<>(mapFuelToResponse(fuelEntry), HttpStatus.CREATED);
    }

    private MissionResponse mapToResponse(Mission mission) {
        return new MissionResponse(
            mission.getId(),
            mission.getCode(),
            mission.getSite(),
            mission.getClient(),
            mission.getStartDate(),
            mission.getEndDate(),
            mission.getBudget(),
            mission.getVehicle().getId(),
            mission.getVehicle().getCode(),
            mission.getDriver().getId(),
            mission.getDriver().getName(),
            mission.getStatus(),
            mission.getDepartureKm(),
            mission.getDepartureEngineHours(),
            mission.getDepartureFuel(),
            mission.getReturnKm(),
            mission.getReturnEngineHours(),
            mission.getReturnFuel(),
            mission.getCreatedAt(),
            mission.getUpdatedAt()
        );
    }

    private FuelEntryResponse mapFuelToResponse(FuelEntry fuelEntry) {
        return new FuelEntryResponse(
            fuelEntry.getId(),
            fuelEntry.getMission().getId(),
            fuelEntry.getDriver().getId(),
            fuelEntry.getQuantity(),
            fuelEntry.getCost(),
            fuelEntry.getStation(),
            fuelEntry.getReceiptUrl(),
            fuelEntry.getCreatedAt()
        );
    }
}
