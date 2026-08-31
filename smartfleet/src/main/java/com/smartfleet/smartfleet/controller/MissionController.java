package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.service.MissionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {
    private final MissionService missionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Mission> createMission(@RequestBody Object request) {
        return new ResponseEntity<>(new Mission(), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<Mission>> getAllMissions() {
        return ResponseEntity.ok(missionService.getAllMissions());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<List<Mission>> getMyMissions(Authentication auth) {
        return ResponseEntity.ok(missionService.getDriverMissions(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mission> getMission(@PathVariable String id) {
        return missionService.getMissionById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/assign-driver/{driverId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Mission> assignDriver(@PathVariable String id, @PathVariable String driverId) {
        Mission mission = missionService.assignDriver(id, driverId);
        return ResponseEntity.ok(mission);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<Mission> startMission(@PathVariable String id) {
        return ResponseEntity.ok(missionService.startMission(id));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<Mission> returnMission(@PathVariable String id) {
        return ResponseEntity.ok(missionService.endMission(id));
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Mission> validateReturn(@PathVariable String id) {
        return ResponseEntity.ok(new Mission());
    }
}
