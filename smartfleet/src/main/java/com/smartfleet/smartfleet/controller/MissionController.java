package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.CreateMissionRequest;
import com.smartfleet.smartfleet.dto.MissionResponse;
import com.smartfleet.smartfleet.dto.ReturnMissionRequest;
import com.smartfleet.smartfleet.dto.StartMissionRequest;
import com.smartfleet.smartfleet.dto.ValidateMissionRequest;
import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.security.SecurityUtil;
import com.smartfleet.smartfleet.service.MissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;
    private final SecurityUtil securityUtil;

    /**
     * Creation reelle d'une mission. Le controle anti-overbooking est fait dans
     * le service : un appel HTTP direct ne peut pas le contourner.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MissionResponse> createMission(@Valid @RequestBody CreateMissionRequest request) {
        Mission mission = missionService.createMission(
            request.getVehicleId(),
            request.getDriverId(),
            request.startAt(),
            request.endAt(),
            request.getSite(),
            request.getClient(),
            request.getBudget(),
            securityUtil.getCurrentUserId());
        return new ResponseEntity<>(MissionResponse.from(mission), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<MissionResponse>> getAllMissions() {
        return ResponseEntity.ok(missionService.getAllMissions().stream()
            .map(MissionResponse::from).toList());
    }

    /** Missions du conducteur connecte (ecran mobile operateur). */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<List<MissionResponse>> getMyMissions(Authentication auth) {
        return ResponseEntity.ok(missionService.getDriverMissions(auth.getName()).stream()
            .map(MissionResponse::from).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MissionResponse> getMission(@PathVariable String id) {
        return missionService.getMissionById(id)
            .map(MissionResponse::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/assign-driver/{driverId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MissionResponse> assignDriver(@PathVariable String id,
                                                        @PathVariable String driverId) {
        Mission mission = missionService.assignDriver(id, driverId, securityUtil.getCurrentUserId());
        return ResponseEntity.ok(MissionResponse.from(mission));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<MissionResponse> startMission(@PathVariable String id,
                                                        @Valid @RequestBody StartMissionRequest body) {
        Mission mission = missionService.startMission(id, body.getKm(), body.getEngineHours(),
            body.getFuel(), securityUtil.getCurrentUserId());
        return ResponseEntity.ok(MissionResponse.from(mission));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<MissionResponse> returnMission(@PathVariable String id,
                                                         @Valid @RequestBody ReturnMissionRequest body) {
        Mission mission = missionService.endMission(id, body.getKm(), body.getEngineHours(),
            body.getFuel(), securityUtil.getCurrentUserId());
        return ResponseEntity.ok(MissionResponse.from(mission));
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<MissionResponse> validateReturn(@PathVariable String id,
                                                          @RequestBody(required = false) ValidateMissionRequest body) {
        boolean conform = body == null || body.getIsConform() == null || body.getIsConform();
        Mission mission = missionService.validateReturn(id, conform, securityUtil.getCurrentUserId());
        return ResponseEntity.ok(MissionResponse.from(mission));
    }
}
