package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.dto.FleetAlertResponse;
import com.smartfleet.smartfleet.dto.FleetReportResponse;
import com.smartfleet.smartfleet.dto.FleetReportResponse.*;
import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.FuelEntryRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Synthèse de flotte construite à partir des données réelles.
 *
 * Rien n'est stocké : un rapport figé décrirait l'état du parc au moment de sa
 * génération et vieillirait dès la mission suivante. La lecture est toujours
 * celle de l'instant, et l'horodatage le dit explicitement.
 *
 * Les agrégats se font en mémoire plutôt qu'en SQL : à l'échelle d'une flotte —
 * quelques centaines d'engins — la différence est négligeable, et un calcul
 * lisible se vérifie et se corrige, ce qu'une requête d'agrégation multiple ne
 * permet pas aussi facilement.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final VehicleRepository vehicleRepository;
    private final MissionRepository missionRepository;
    private final DriverRepository driverRepository;
    private final FuelEntryRepository fuelEntryRepository;
    private final AlertService alertService;

    @Transactional(readOnly = true)
    public FleetReportResponse buildReport() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Mission> missions = missionRepository.findAll();
        List<Driver> drivers = driverRepository.findAll();
        List<FuelEntry> fuelEntries = fuelEntryRepository.findAll();

        return FleetReportResponse.builder()
            .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
            .fleet(summarizeFleet(vehicles))
            .missions(summarizeMissions(missions))
            .drivers(summarizeDrivers(drivers))
            .fuel(summarizeFuel(vehicles, fuelEntries))
            .alerts(countAlertsBySeverity())
            .build();
    }

    // ------------------------------------------------------------------

    private FleetSummary summarizeFleet(List<Vehicle> vehicles) {
        Map<String, Integer> byStatus = new LinkedHashMap<>();
        Map<String, Integer> byCondition = new LinkedHashMap<>();
        Map<String, Integer> bySite = new LinkedHashMap<>();

        int available = 0;
        int immobilized = 0;
        int withoutDriver = 0;
        long totalKm = 0;
        long totalEngineHours = 0;

        for (Vehicle v : vehicles) {
            VehicleStatus status = v.getStatus();
            increment(byStatus, status == null ? "INCONNU" : status.name());

            VehicleCondition condition = v.getCondition();
            increment(byCondition, condition == null ? "BON" : condition.name());

            // Les véhicules sans site sont regroupés plutôt qu'ignorés : leur
            // nombre signale un défaut de saisie qu'il faut pouvoir voir.
            String site = v.getSite();
            increment(bySite, site == null || site.isBlank() ? "Non affecté" : site);

            if (status == VehicleStatus.DISPONIBLE) {
                available++;
            }
            if (status == VehicleStatus.MAINTENANCE || status == VehicleStatus.HORS_SERVICE) {
                immobilized++;
            }
            if (v.getAssignedDriver() == null) {
                withoutDriver++;
            }
            totalKm += v.getCurrentKm() == null ? 0 : v.getCurrentKm();
            totalEngineHours += v.getEngineHours() == null ? 0 : v.getEngineHours();
        }

        return FleetSummary.builder()
            .total(vehicles.size())
            .byStatus(byStatus)
            .byCondition(byCondition)
            .bySite(bySite)
            .available(available)
            .immobilized(immobilized)
            .availabilityRate(percentage(available, vehicles.size()))
            .totalKm(totalKm)
            .totalEngineHours(totalEngineHours)
            .withoutDriver(withoutDriver)
            .build();
    }

    private MissionSummary summarizeMissions(List<Mission> missions) {
        Map<String, Integer> byStatus = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();

        int overdue = 0;
        int active = 0;
        int completed = 0;
        long totalBudget = 0;

        for (Mission m : missions) {
            MissionStatus status = m.getStatus();
            increment(byStatus, status == null ? "INCONNU" : status.name());

            if (status == MissionStatus.CLOTUREE) {
                completed++;
            } else {
                active++;
                // Même tolérance que les alertes : quelques heures de
                // dépassement restent courantes et ne comptent pas comme retard.
                if (m.getEndDate() != null
                    && now.isAfter(m.getEndDate().plus(AlertService.MISSION_OVERDUE_GRACE))) {
                    overdue++;
                }
            }
            totalBudget += m.getBudget() == null ? 0 : m.getBudget();
        }

        return MissionSummary.builder()
            .total(missions.size())
            .byStatus(byStatus)
            .overdue(overdue)
            .active(active)
            .completed(completed)
            .totalBudget(totalBudget)
            .build();
    }

    private DriverSummary summarizeDrivers(List<Driver> drivers) {
        Map<String, Integer> byStatus = new LinkedHashMap<>();
        int available = 0;
        int missingMatricule = 0;

        for (Driver d : drivers) {
            DriverStatus status = d.getStatus();
            increment(byStatus, status == null ? "INCONNU" : status.name());

            if (status == DriverStatus.DISPONIBLE) {
                available++;
            }
            if (d.getMatricule() == null || d.getMatricule().isBlank()) {
                missingMatricule++;
            }
        }

        return DriverSummary.builder()
            .total(drivers.size())
            .byStatus(byStatus)
            .available(available)
            .missingMatricule(missingMatricule)
            .build();
    }

    private FuelSummary summarizeFuel(List<Vehicle> vehicles, List<FuelEntry> entries) {
        double totalQuantity = 0;
        long totalCost = 0;
        Map<String, Integer> stations = new LinkedHashMap<>();

        for (FuelEntry e : entries) {
            totalQuantity += e.getQuantity() == null ? 0 : e.getQuantity();
            totalCost += e.getCost() == null ? 0 : e.getCost();

            String station = e.getStation();
            if (station != null && !station.isBlank()) {
                increment(stations, station);
            }
        }

        int levelSum = 0;
        int levelCount = 0;
        int lowFuel = 0;
        for (Vehicle v : vehicles) {
            Integer level = v.getFuelLevel();
            if (level == null) {
                continue;
            }
            levelSum += level;
            levelCount++;
            if (level <= AlertService.FUEL_LOW) {
                lowFuel++;
            }
        }

        List<StationCount> topStations = stations.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(5)
            .map(e -> StationCount.builder().station(e.getKey()).count(e.getValue()).build())
            .toList();

        return FuelSummary.builder()
            .entries(entries.size())
            .totalQuantity(Math.round(totalQuantity * 100) / 100.0)
            .totalCost(totalCost)
            .averageLevel(levelCount == 0 ? 0 : Math.round((float) levelSum / levelCount))
            .lowFuelVehicles(lowFuel)
            .topStations(topStations)
            .build();
    }

    /**
     * Les alertes sont recalculées par leur service plutôt que recomptées ici :
     * dupliquer les règles ferait diverger le rapport de l'écran d'alertes.
     */
    private Map<String, Integer> countAlertsBySeverity() {
        Map<String, Integer> counts = new LinkedHashMap<>();
        counts.put(FleetAlertResponse.URGENT, 0);
        counts.put(FleetAlertResponse.ATTENTION, 0);
        counts.put(FleetAlertResponse.INFO, 0);

        for (FleetAlertResponse alert : alertService.currentAlerts()) {
            counts.merge(alert.getSeverity(), 1, Integer::sum);
        }
        return counts;
    }

    // ------------------------------------------------------------------

    private void increment(Map<String, Integer> counts, String key) {
        counts.merge(key, 1, Integer::sum);
    }

    /** Aucun véhicule ne donne 0 % plutôt qu'une division par zéro. */
    private int percentage(int part, int total) {
        return total == 0 ? 0 : Math.round((float) part * 100 / total);
    }
}
