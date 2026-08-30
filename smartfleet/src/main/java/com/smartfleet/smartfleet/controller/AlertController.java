package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.entity.AuditEvent;
import com.smartfleet.smartfleet.entity.AuditEventType;
import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.entity.MissionStatus;
import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.entity.VehicleStatus;
import com.smartfleet.smartfleet.repository.AuditEventRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AuditEventRepository auditEventRepository;
    private final MissionRepository missionRepository;
    private final VehicleRepository vehicleRepository;

    @Data
    public static class Alert {
        private String id;
        private String severity; // "urgent", "attention", "info"
        private String title;
        private String detail;
        private String timestamp;
        private boolean read;

        public Alert(String id, String severity, String title, String detail, LocalDateTime timestamp, boolean read) {
            this.id = id;
            this.severity = severity;
            this.title = title;
            this.detail = detail;
            this.timestamp = timestamp.toString();
            this.read = read;
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Alert>> getAlerts() {
        List<Alert> alerts = new ArrayList<>();

        // 🔴 Urgent: Missions en attente de validation (> 2 heures)
        List<Mission> pendingMissions = missionRepository.findByStatus(MissionStatus.CONTROLE);
        for (Mission mission : pendingMissions) {
            if (mission.getUpdatedAt() != null) {
                long hoursDiff = java.time.temporal.ChronoUnit.HOURS
                    .between(mission.getUpdatedAt(), LocalDateTime.now());
                if (hoursDiff > 2) {
                    alerts.add(new Alert(
                        mission.getId(),
                        "urgent",
                        "Validation mission en attente",
                        "Mission " + mission.getCode() + " en attente depuis " + hoursDiff + "h",
                        mission.getUpdatedAt(),
                        false
                    ));
                }
            }
        }

        // 🟠 Attention: Véhicules hors service
        List<Vehicle> brokenVehicles = vehicleRepository.findByStatus(VehicleStatus.HORS_SERVICE);
        for (Vehicle vehicle : brokenVehicles) {
            alerts.add(new Alert(
                vehicle.getId(),
                "attention",
                "Véhicule hors service",
                vehicle.getCode() + " (" + vehicle.getType() + ") non disponible",
                vehicle.getUpdatedAt(),
                false
            ));
        }

        // 🟡 Attention: Faible carburant (< 25%)
        List<Vehicle> lowFuelVehicles = vehicleRepository.findAll().stream()
            .filter(v -> v.getFuelLevel() < 25)
            .toList();
        for (Vehicle vehicle : lowFuelVehicles) {
            alerts.add(new Alert(
                vehicle.getId(),
                "attention",
                "Carburant faible",
                vehicle.getCode() + " a seulement " + vehicle.getFuelLevel() + "% de carburant",
                vehicle.getUpdatedAt(),
                false
            ));
        }

        // 🔵 Info: Missions clôturées aujourd'hui
        List<Mission> closedToday = missionRepository.findByStatus(MissionStatus.CLOTUREE);
        for (Mission mission : closedToday) {
            alerts.add(new Alert(
                mission.getId(),
                "info",
                "Mission clôturée",
                "Mission " + mission.getCode() + " complétée avec succès",
                mission.getUpdatedAt(),
                false
            ));
        }

        // Sort by severity: urgent > attention > info
        return ResponseEntity.ok(alerts.stream()
            .sorted((a, b) -> getSeverityLevel(b.severity) - getSeverityLevel(a.severity))
            .limit(20) // Limiter à 20 alertes
            .toList());
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        // Marquer l'alerte comme lue (implémentation simple)
        return ResponseEntity.ok().build();
    }

    private int getSeverityLevel(String severity) {
        return switch (severity) {
            case "urgent" -> 3;
            case "attention" -> 2;
            case "info" -> 1;
            default -> 0;
        };
    }
}
