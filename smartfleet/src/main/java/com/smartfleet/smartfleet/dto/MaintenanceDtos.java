package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.Maintenance;
import com.smartfleet.smartfleet.entity.MaintenanceType;
import com.smartfleet.smartfleet.entity.VehicleCondition;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Contrats de l'intervention de maintenance. */
public final class MaintenanceDtos {

    private MaintenanceDtos() {
    }

    @Data
    @NoArgsConstructor
    public static class ScheduleRequest {
        @NotBlank
        private String vehicleId;

        private MaintenanceType type;

        @NotBlank
        private String description;

        private LocalDate scheduledDate;
        private String provider;
    }

    /** Clôture : le coût n'est connu qu'à ce moment, il est donc exigé ici. */
    @Data
    @NoArgsConstructor
    public static class CompleteRequest {
        private Integer cost;
        private String provider;
        private String notes;

        /** État constaté par l'atelier au terme des travaux. */
        private VehicleCondition resultingCondition;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private String id;
        private String vehicleId;
        private String vehicleCode;
        private String inspectionId;
        private String type;
        private String status;
        private String description;
        private LocalDate scheduledDate;
        private LocalDate completedDate;
        private Integer cost;
        private String provider;
        private Integer kmReading;
        private String notes;
        private LocalDateTime createdAt;

        public static Response from(Maintenance m) {
            var vehicle = m.getVehicle();

            return Response.builder()
                .id(m.getId())
                .vehicleId(vehicle != null ? vehicle.getId() : null)
                .vehicleCode(vehicle != null ? vehicle.getCode() : null)
                .inspectionId(m.getInspection() != null ? m.getInspection().getId() : null)
                .type(m.getType() != null ? m.getType().name() : null)
                .status(m.getStatus() != null ? m.getStatus().name() : null)
                .description(m.getDescription())
                .scheduledDate(m.getScheduledDate())
                .completedDate(m.getCompletedDate())
                .cost(m.getCost())
                .provider(m.getProvider())
                .kmReading(m.getKmReading())
                .notes(m.getNotes())
                .createdAt(m.getCreatedAt())
                .build();
        }
    }
}
