package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.MissionResponse;
import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.service.MissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final MissionService missionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<MissionResponse>> getReports() {
        List<Mission> missions = missionService.getAllMissions();
        return ResponseEntity.ok(missions.stream()
            .map(this::mapToResponse)
            .toList());
    }

    @PostMapping("/export/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<String> exportCsv() {
        List<Mission> missions = missionService.getAllMissions();

        StringBuilder csv = new StringBuilder();
        csv.append("Code,Vehicule,Conducteur,Site,Client,Status,DateDebut,DateFin,Budget,KmParcourus\n");

        for (Mission mission : missions) {
            int kmParcourus = mission.getArrival() != null && mission.getDeparture() != null
                ? mission.getArrival().getKm() - mission.getDeparture().getKm()
                : 0;

            csv.append(String.format(
                "%s,%s,%s,%s,%s,%s,%s,%s,%s,%d\n",
                mission.getCode(),
                mission.getVehicleId(),
                mission.getDriverId(),
                mission.getSite(),
                mission.getClient() != null ? mission.getClient() : "",
                mission.getStatus(),
                mission.getStartDate(),
                mission.getEndDate(),
                mission.getBudget(),
                kmParcourus
            ));
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=smartfleet-missions-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv")
            .header(HttpHeaders.CONTENT_TYPE, "text/csv")
            .body(csv.toString());
    }

    @PostMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<byte[]> exportPdf() {
        List<Mission> missions = missionService.getAllMissions();

        StringBuilder pdfContent = new StringBuilder();
        pdfContent.append("SMARTFLEET - RAPPORT DE MISSIONS\n");
        pdfContent.append("Date: ").append(LocalDateTime.now()).append("\n");
        pdfContent.append("=".repeat(80)).append("\n\n");

        for (Mission mission : missions) {
            int kmParcourus = mission.getArrival() != null && mission.getDeparture() != null
                ? mission.getArrival().getKm() - mission.getDeparture().getKm()
                : 0;

            pdfContent.append("Mission: ").append(mission.getCode()).append("\n");
            pdfContent.append("  Vehicule: ").append(mission.getVehicleId()).append("\n");
            pdfContent.append("  Conducteur: ").append(mission.getDriverId()).append("\n");
            pdfContent.append("  Site: ").append(mission.getSite()).append("\n");
            pdfContent.append("  Client: ").append(mission.getClient() != null ? mission.getClient() : "N/A").append("\n");
            pdfContent.append("  Status: ").append(mission.getStatus()).append("\n");
            pdfContent.append("  Budget: ").append(mission.getBudget()).append(" EUR\n");
            pdfContent.append("  KM Parcourus: ").append(kmParcourus).append(" km\n");
            pdfContent.append("-".repeat(80)).append("\n\n");
        }

        byte[] content = pdfContent.toString().getBytes();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=smartfleet-missions-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf")
            .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
            .body(content);
    }

    private MissionResponse mapToResponse(Mission mission) {
        return new MissionResponse(
            mission.getId(),
            mission.getCode(),
            mission.getVehicleId(),
            mission.getDriverId(),
            mission.getSite(),
            mission.getClient(),
            mission.getStatus(),
            mission.getBudget(),
            mission.getStartDate(),
            mission.getEndDate(),
            mission.getDeparture(),
            mission.getArrival(),
            mission.getTimeline(),
            mission.getCreatedAt(),
            mission.getUpdatedAt()
        );
    }
}
