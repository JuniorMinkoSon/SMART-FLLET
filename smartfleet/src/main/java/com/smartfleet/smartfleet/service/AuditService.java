package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.repository.AuditEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper;

    public void logEvent(AuditEventType eventType, String actorId, Mission mission) {
        Map<String, Object> details = new HashMap<>();
        details.put("missionCode", mission.getCode());
        details.put("vehicleId", mission.getVehicle().getId());
        details.put("vehicleCode", mission.getVehicle().getCode());
        details.put("driverId", mission.getDriver().getId());
        details.put("driverName", mission.getDriver().getName());
        details.put("site", mission.getSite());

        if (mission.getDepartureKm() != null) {
            details.put("departureKm", mission.getDepartureKm());
        }
        if (mission.getReturnKm() != null) {
            details.put("returnKm", mission.getReturnKm());
        }
        if (mission.getDepartureFuel() != null) {
            details.put("departureFuel", mission.getDepartureFuel());
        }
        if (mission.getReturnFuel() != null) {
            details.put("returnFuel", mission.getReturnFuel());
        }

        try {
            String detailsJson = objectMapper.writeValueAsString(details);

            AuditEvent event = AuditEvent.builder()
                .actorId(actorId)
                .eventType(eventType)
                .entityType("MISSION")
                .entityId(mission.getId())
                .missionId(mission.getId())
                .details(detailsJson)
                .build();

            auditEventRepository.save(event);
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to log audit event: " + e.getMessage());
        }
    }

    public void logFuelEvent(String actorId, FuelEntry fuelEntry) {
        Map<String, Object> details = new HashMap<>();
        details.put("quantity", fuelEntry.getQuantity());
        details.put("cost", fuelEntry.getCost());
        details.put("station", fuelEntry.getStation());

        try {
            String detailsJson = objectMapper.writeValueAsString(details);

            AuditEvent event = AuditEvent.builder()
                .actorId(actorId)
                .eventType(AuditEventType.FUEL_RECORDED)
                .entityType("FUEL_ENTRY")
                .entityId(fuelEntry.getId())
                .missionId(fuelEntry.getMission().getId())
                .details(detailsJson)
                .build();

            auditEventRepository.save(event);
        } catch (Exception e) {
            System.err.println("Failed to log fuel audit event: " + e.getMessage());
        }
    }
}
