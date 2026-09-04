package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.Inspection;
import com.smartfleet.smartfleet.entity.InspectionResult;
import com.smartfleet.smartfleet.entity.InspectionType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Contrats du contrôle de véhicule. */
public final class InspectionDtos {

    private InspectionDtos() {
    }

    /**
     * Saisie d'un contrôle.
     *
     * Le résultat est facultatif : laissé vide, il est déduit des points
     * vérifiés. Le renseigner permet au contrôleur de juger bloquant un défaut
     * que le décompte des cases ne signalerait pas.
     */
    @Data
    @NoArgsConstructor
    public static class CreateRequest {
        @NotBlank
        private String vehicleId;

        /** Absent pour un contrôle hors mission. */
        private String missionId;

        private InspectionType type;

        private boolean tyresOk;
        private boolean brakesOk;
        private boolean lightsOk;
        private boolean bodyworkOk;

        private InspectionResult result;
        private String anomaly;
        private Integer kmReading;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private String id;
        private String vehicleId;
        private String vehicleCode;
        private String missionId;
        private String missionCode;
        private String type;

        private boolean tyresOk;
        private boolean brakesOk;
        private boolean lightsOk;
        private boolean bodyworkOk;

        private String result;
        private String anomaly;
        private Integer kmReading;
        private String inspectorName;
        private LocalDateTime createdAt;

        public static Response from(Inspection i) {
            var vehicle = i.getVehicle();
            var mission = i.getMission();

            return Response.builder()
                .id(i.getId())
                .vehicleId(vehicle != null ? vehicle.getId() : null)
                .vehicleCode(vehicle != null ? vehicle.getCode() : null)
                .missionId(mission != null ? mission.getId() : null)
                .missionCode(mission != null ? mission.getCode() : null)
                .type(i.getType() != null ? i.getType().name() : null)
                .tyresOk(Boolean.TRUE.equals(i.getTyresOk()))
                .brakesOk(Boolean.TRUE.equals(i.getBrakesOk()))
                .lightsOk(Boolean.TRUE.equals(i.getLightsOk()))
                .bodyworkOk(Boolean.TRUE.equals(i.getBodyworkOk()))
                .result(i.getResult() != null ? i.getResult().name() : null)
                .anomaly(i.getAnomaly())
                .kmReading(i.getKmReading())
                .inspectorName(i.getInspector() != null ? i.getInspector().getName() : null)
                .createdAt(i.getCreatedAt())
                .build();
        }
    }
}
