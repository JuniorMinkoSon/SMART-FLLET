package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.entity.AuditEvent;
import com.smartfleet.smartfleet.entity.AuditEventType;
import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.entity.MissionStatus;
import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.entity.VehicleStatus;
import com.smartfleet.smartfleet.repository.AuditEventRepository;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.UserRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import com.smartfleet.smartfleet.security.SecurityUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AuditEventRepository auditEventRepository;
    private final MissionRepository missionRepository;
    private final VehicleRepository vehicleRepository;
    private final SecurityUtil securityUtil;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

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
        return ResponseEntity.ok(buildAllAlerts());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<List<Alert>> getMyAlerts() {
        String userId = securityUtil.getCurrentUserId();

        // Récupérer le conducteur actuellement connecté
        Optional<com.smartfleet.smartfleet.entity.User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        com.smartfleet.smartfleet.entity.User currentUser = user.get();
        Optional<com.smartfleet.smartfleet.entity.Driver> driver = driverRepository.findAll().stream()
            .filter(d -> d.getEmail().equals(currentUser.getEmail()))
            .findFirst();

        if (driver.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        String driverId = driver.get().getId();
        List<Alert> alerts = new ArrayList<>();

        // 🔴 Urgent: Ses missions en attente validation > 2 heures
        List<Mission> myPendingMissions = missionRepository.findByStatus(MissionStatus.CONTROLE).stream()
            .filter(m -> m.getDriverId().equals(driverId))
            .toList();
        for (Mission mission : myPendingMissions) {
            if (mission.getUpdatedAt() != null) {
                long hoursDiff = java.time.temporal.ChronoUnit.HOURS
                    .between(mission.getUpdatedAt(), LocalDateTime.now());
                if (hoursDiff > 2) {
                    alerts.add(new Alert(
                        mission.getId(),
                        "urgent",
                        "Votre mission en attente de validation",
                        "Mission " + mission.getCode() + " en attente depuis " + hoursDiff + "h",
                        mission.getUpdatedAt(),
                        false
                    ));
                }
            }
        }

        // 🟠 Attention: Son véhicule assigné a un problème
        List<Mission> myActiveMissions = missionRepository.findByStatus(MissionStatus.EN_COURS).stream()
            .filter(m -> m.getDriverId().equals(driverId))
            .toList();
        for (Mission mission : myActiveMissions) {
            Optional<Vehicle> assignedVehicle = vehicleRepository.findById(mission.getVehicleId());
            if (assignedVehicle.isPresent()) {
                Vehicle vehicle = assignedVehicle.get();
                if (vehicle.getFuelLevel() < 25) {
                    alerts.add(new Alert(
                        vehicle.getId(),
                        "attention",
                        "Carburant faible sur votre engin",
                        vehicle.getCode() + " a seulement " + vehicle.getFuelLevel() + "% de carburant",
                        vehicle.getUpdatedAt(),
                        false
                    ));
                }
            }
        }

        // 🔵 Info: Ses missions clôturées
        List<Mission> myClosedMissions = missionRepository.findByStatus(MissionStatus.CLOTUREE).stream()
            .filter(m -> m.getDriverId().equals(driverId))
            .toList();
        for (Mission mission : myClosedMissions) {
            alerts.add(new Alert(
                mission.getId(),
                "info",
                "Votre mission est complétée",
                "Mission " + mission.getCode() + " terminée avec succès",
                mission.getUpdatedAt(),
                false
            ));
        }

        // Sort by severity
        return ResponseEntity.ok(alerts.stream()
            .sorted((a, b) -> getSeverityLevel(b.severity) - getSeverityLevel(a.severity))
            .limit(10)
            .toList());
    }

    private List<Alert> buildAllAlerts() {
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
        return alerts.stream()
            .sorted((a, b) -> getSeverityLevel(b.severity) - getSeverityLevel(a.severity))
            .limit(20) // Limiter à 20 alertes
            .toList();
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
