package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.dto.FleetAlertResponse;
import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Alertes de flotte, dérivées de l'état réel du parc.
 *
 * Aucune alerte n'est stockée. Une alerte décrit une situation, pas un
 * événement : un véhicule dont le carburant remonte cesse d'alerter de lui-même,
 * sans qu'un opérateur ait à clore une ligne. Une table d'alertes obligerait à
 * maintenir une copie de l'état, qui se désynchronise dès la première mise à
 * jour manquée — et une alerte fantôme fait perdre confiance dans toutes les
 * autres.
 *
 * Chaque règle est isolée dans sa méthode, ce qui permet d'en ajouter ou d'en
 * ajuster une sans toucher aux autres.
 *
 * L'expiration des permis est couverte depuis que l'entité Driver porte
 * l'échéance : un conducteur sans date renseignée n'alerte pas, l'absence de
 * donnée n'étant pas une anomalie mais un défaut de saisie signalé ailleurs.
 */
@Service
@RequiredArgsConstructor
public class AlertService {

    /**
     * Sous ce niveau, l'engin ne peut plus partir en mission sans ravitaillement.
     */
    static final int FUEL_CRITICAL = 15;

    /** Niveau à partir duquel il faut planifier un plein. */
    static final int FUEL_LOW = 30;

    /**
     * Au-delà de ce retard, une mission non clôturée relève de l'oubli de saisie
     * ou d'un incident : quelques heures de dépassement restent courantes sur le
     * terrain et ne justifient pas d'alerter.
     */
    static final Duration MISSION_OVERDUE_GRACE = Duration.ofHours(12);

    /** Fenêtre de préavis : le temps qu'il faut pour organiser un renouvellement. */
    static final int LICENSE_WARNING_DAYS = 30;

    private final VehicleRepository vehicleRepository;
    private final MissionRepository missionRepository;
    private final DriverRepository driverRepository;

    /**
     * Alertes courantes de la flotte, les plus graves en tête.
     *
     * En lecture seule : la méthode observe l'état, elle ne le modifie pas.
     */
    @Transactional(readOnly = true)
    public List<FleetAlertResponse> currentAlerts() {
        List<FleetAlertResponse> alerts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Vehicle vehicle : vehicleRepository.findAll()) {
            addFuelAlert(alerts, vehicle, now);
            addAvailabilityAlert(alerts, vehicle, now);
            addConditionAlert(alerts, vehicle, now);
        }

        for (Mission mission : missionRepository.findAll()) {
            addOverdueMissionAlert(alerts, mission, now);
        }

        for (Driver driver : driverRepository.findAll()) {
            addDriverAvailabilityAlert(alerts, driver, now);
            addLicenseAlert(alerts, driver, now);
        }

        // Les urgences d'abord : c'est l'ordre dans lequel l'écran les présente,
        // et il ne doit pas dépendre de l'ordre de parcours des tables.
        alerts.sort(Comparator.comparingInt(a -> severityRank(a.getSeverity())));
        return alerts;
    }

    /** Alertes concernant un conducteur donné, pour son espace personnel. */
    @Transactional(readOnly = true)
    public List<FleetAlertResponse> alertsForDriver(String driverId) {
        List<FleetAlertResponse> alerts = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Mission mission : missionRepository.findAll()) {
            if (mission.getDriver() != null && driverId.equals(mission.getDriver().getId())) {
                addOverdueMissionAlert(alerts, mission, now);
            }
        }

        // Le véhicule affecté concerne directement son conducteur : un plein à
        // prévoir est son affaire avant d'être celle du gestionnaire.
        for (Vehicle vehicle : vehicleRepository.findAll()) {
            Driver assigned = vehicle.getAssignedDriver();
            if (assigned != null && driverId.equals(assigned.getId())) {
                addFuelAlert(alerts, vehicle, now);
                addConditionAlert(alerts, vehicle, now);
            }
        }

        alerts.sort(Comparator.comparingInt(a -> severityRank(a.getSeverity())));
        return alerts;
    }

    // ------------------------------------------------------------------
    // Règles
    // ------------------------------------------------------------------

    private void addFuelAlert(List<FleetAlertResponse> alerts, Vehicle v, LocalDateTime now) {
        Integer fuel = v.getFuelLevel();
        if (fuel == null || fuel > FUEL_LOW) {
            return;
        }

        boolean critical = fuel <= FUEL_CRITICAL;
        alerts.add(FleetAlertResponse.builder()
            .id("fuel-low:" + v.getId())
            .severity(critical ? FleetAlertResponse.URGENT : FleetAlertResponse.ATTENTION)
            .title(critical ? "Carburant critique" : "Carburant faible")
            .detail(label(v) + " : niveau à " + fuel + " %"
                + (critical ? ", ravitaillement requis avant toute mission." : ", plein à planifier."))
            .time(iso(now))
            .read(false)
            .resourceType("VEHICLE")
            .resourceId(v.getId())
            .rule("FUEL_LOW")
            .build());
    }

    private void addAvailabilityAlert(List<FleetAlertResponse> alerts, Vehicle v, LocalDateTime now) {
        if (v.getStatus() == VehicleStatus.HORS_SERVICE) {
            alerts.add(FleetAlertResponse.builder()
                .id("out-of-service:" + v.getId())
                .severity(FleetAlertResponse.URGENT)
                .title("Véhicule hors service")
                .detail(label(v) + " est immobilisé et retiré des affectations possibles.")
                .time(iso(now))
                .read(false)
                .resourceType("VEHICLE")
                .resourceId(v.getId())
                .rule("VEHICLE_OUT_OF_SERVICE")
                .build());
        } else if (v.getStatus() == VehicleStatus.MAINTENANCE) {
            alerts.add(FleetAlertResponse.builder()
                .id("maintenance:" + v.getId())
                .severity(FleetAlertResponse.ATTENTION)
                .title("Véhicule en maintenance")
                .detail(label(v) + " est en atelier et indisponible pour la période.")
                .time(iso(now))
                .read(false)
                .resourceType("VEHICLE")
                .resourceId(v.getId())
                .rule("VEHICLE_MAINTENANCE")
                .build());
        }
    }

    private void addConditionAlert(List<FleetAlertResponse> alerts, Vehicle v, LocalDateTime now) {
        if (v.getCondition() != VehicleCondition.MAUVAIS) {
            return;
        }
        // Un engin en mauvais état mais encore marqué disponible est le cas qui
        // mérite l'alerte : il peut être affecté alors qu'il ne devrait pas.
        boolean stillBookable = v.getStatus() == VehicleStatus.DISPONIBLE
            || v.getStatus() == VehicleStatus.RESERVE;

        alerts.add(FleetAlertResponse.builder()
            .id("condition:" + v.getId())
            .severity(stillBookable ? FleetAlertResponse.URGENT : FleetAlertResponse.ATTENTION)
            .title("État dégradé")
            .detail(label(v) + " est en mauvais état"
                + (stillBookable
                    ? " alors qu'il reste affectable : intervention à programmer."
                    : ", intervention à programmer."))
            .time(iso(now))
            .read(false)
            .resourceType("VEHICLE")
            .resourceId(v.getId())
            .rule("VEHICLE_CONDITION_BAD")
            .build());
    }

    private void addOverdueMissionAlert(List<FleetAlertResponse> alerts, Mission m, LocalDateTime now) {
        if (m.getEndDate() == null || m.getStatus() == MissionStatus.CLOTUREE) {
            return;
        }
        LocalDateTime deadline = m.getEndDate().plus(MISSION_OVERDUE_GRACE);
        if (!now.isAfter(deadline)) {
            return;
        }

        long daysLate = Duration.between(m.getEndDate(), now).toDays();
        alerts.add(FleetAlertResponse.builder()
            .id("mission-overdue:" + m.getId())
            .severity(daysLate >= 3 ? FleetAlertResponse.URGENT : FleetAlertResponse.ATTENTION)
            .title("Mission en retard")
            .detail("Mission " + m.getCode() + " non clôturée, échéance dépassée de "
                + (daysLate <= 0 ? "moins d'un jour" : daysLate + " jour(s)") + ".")
            .time(iso(now))
            .read(false)
            .resourceType("MISSION")
            .resourceId(m.getId())
            .rule("MISSION_OVERDUE")
            .build());
    }

    private void addDriverAvailabilityAlert(List<FleetAlertResponse> alerts, Driver d, LocalDateTime now) {
        if (d.getStatus() != DriverStatus.INDISPONIBLE) {
            return;
        }
        alerts.add(FleetAlertResponse.builder()
            .id("driver-unavailable:" + d.getId())
            .severity(FleetAlertResponse.INFO)
            .title("Conducteur indisponible")
            .detail(d.getName() + " est déclaré indisponible et ne peut pas être affecté.")
            .time(iso(now))
            .read(false)
            .resourceType("DRIVER")
            .resourceId(d.getId())
            .rule("DRIVER_UNAVAILABLE")
            .build());
    }

    /**
     * Permis expiré ou proche de l'être.
     *
     * Un permis expiré est urgent : le conducteur ne peut plus prendre de
     * mission, et l'affecter engage la responsabilité de l'entreprise. En amont,
     * la fenêtre de préavis laisse le temps d'organiser le renouvellement.
     */
    private void addLicenseAlert(List<FleetAlertResponse> alerts, Driver d, LocalDateTime now) {
        LocalDate expiry = d.getLicenseExpiryDate();
        if (expiry == null) {
            // Échéance non renseignée : le manque est remonté dans la synthèse
            // de flotte, pas transformé en alerte qui serait du bruit.
            return;
        }

        LocalDate today = now.toLocalDate();
        long daysLeft = ChronoUnit.DAYS.between(today, expiry);

        if (daysLeft < 0) {
            alerts.add(FleetAlertResponse.builder()
                .id("license-expired:" + d.getId())
                .severity(FleetAlertResponse.URGENT)
                .title("Permis expiré")
                .detail(d.getName() + " : permis expiré depuis " + Math.abs(daysLeft)
                    + " jour(s). Toute affectation est à suspendre.")
                .time(iso(now))
                .read(false)
                .resourceType("DRIVER")
                .resourceId(d.getId())
                .rule("LICENSE_EXPIRED")
                .build());
        } else if (daysLeft <= LICENSE_WARNING_DAYS) {
            alerts.add(FleetAlertResponse.builder()
                .id("license-expiring:" + d.getId())
                .severity(FleetAlertResponse.ATTENTION)
                .title("Permis bientôt expiré")
                .detail(d.getName() + " : permis valable encore " + daysLeft
                    + " jour(s), renouvellement à engager.")
                .time(iso(now))
                .read(false)
                .resourceType("DRIVER")
                .resourceId(d.getId())
                .rule("LICENSE_EXPIRING")
                .build());
        }
    }

    // ------------------------------------------------------------------
    // Utilitaires
    // ------------------------------------------------------------------

    /** Désignation d'usage si elle existe, code d'inventaire sinon. */
    private String label(Vehicle v) {
        if (v.getName() != null && !v.getName().isBlank()) {
            return v.getName() + " (" + v.getCode() + ")";
        }
        return v.getCode();
    }

    private String iso(LocalDateTime at) {
        return at.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    private int severityRank(String severity) {
        return switch (severity) {
            case FleetAlertResponse.URGENT -> 0;
            case FleetAlertResponse.ATTENTION -> 1;
            default -> 2;
        };
    }
}
