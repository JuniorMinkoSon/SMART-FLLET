package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.FleetReportResponse;
import com.smartfleet.smartfleet.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;

/**
 * Rapports de flotte.
 *
 * La synthèse est calculée à chaque appel à partir des données réelles : il n'y
 * a pas de rapport à créer ni à archiver, d'où l'absence de verbes d'écriture.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /** Synthèse consolidée : flotte, missions, conducteurs, carburant, alertes. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<FleetReportResponse> getReports() {
        return ResponseEntity.ok(reportService.buildReport());
    }

    /**
     * Export de la synthèse au format CSV.
     *
     * Séparateur point-virgule et marque d'ordre des octets en tête : c'est ce
     * qu'attend Excel en configuration française, faute de quoi le fichier
     * s'ouvre sur une seule colonne et les accents sont illisibles.
     */
    @GetMapping(value = "/export/csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<byte[]> exportCsv() {
        FleetReportResponse report = reportService.buildReport();
        StringBuilder csv = new StringBuilder("﻿");

        csv.append("Indicateur;Valeur\n");
        csv.append(row("Généré le", report.getGeneratedAt()));

        var fleet = report.getFleet();
        csv.append(row("Véhicules", fleet.getTotal()));
        csv.append(row("Disponibles", fleet.getAvailable()));
        csv.append(row("Immobilisés", fleet.getImmobilized()));
        csv.append(row("Taux de disponibilité (%)", fleet.getAvailabilityRate()));
        csv.append(row("Sans conducteur affecté", fleet.getWithoutDriver()));
        csv.append(row("Kilométrage cumulé", fleet.getTotalKm()));
        csv.append(row("Heures moteur cumulées", fleet.getTotalEngineHours()));

        var missions = report.getMissions();
        csv.append(row("Missions", missions.getTotal()));
        csv.append(row("Missions en cours", missions.getActive()));
        csv.append(row("Missions clôturées", missions.getCompleted()));
        csv.append(row("Missions en retard", missions.getOverdue()));
        csv.append(row("Budget cumulé", missions.getTotalBudget()));

        var drivers = report.getDrivers();
        csv.append(row("Conducteurs", drivers.getTotal()));
        csv.append(row("Conducteurs disponibles", drivers.getAvailable()));
        csv.append(row("Matricules manquants", drivers.getMissingMatricule()));

        var fuel = report.getFuel();
        csv.append(row("Pleins enregistrés", fuel.getEntries()));
        csv.append(row("Quantité totale", fuel.getTotalQuantity()));
        csv.append(row("Coût total", fuel.getTotalCost()));
        csv.append(row("Niveau moyen (%)", fuel.getAverageLevel()));
        csv.append(row("Véhicules à ravitailler", fuel.getLowFuelVehicles()));

        for (Map.Entry<String, Integer> entry : report.getAlerts().entrySet()) {
            csv.append(row("Alertes " + entry.getKey(), entry.getValue()));
        }

        byte[] body = csv.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "rapport-flotte-" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(body);
    }

    /**
     * Échappement CSV : une valeur contenant un séparateur, un guillemet ou un
     * saut de ligne casserait la colonne si elle n'était pas encadrée.
     */
    private String row(String label, Object value) {
        return escape(label) + ";" + escape(String.valueOf(value)) + "\n";
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(";") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
