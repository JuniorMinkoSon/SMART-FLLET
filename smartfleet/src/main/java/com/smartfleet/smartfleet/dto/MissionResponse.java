package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.entity.MissionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Vue API d'une mission : aplatit engin et conducteur pour que le frontend
 * n'ait pas a faire de jointure cote client, et evite d'exposer les entites.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissionResponse {
    private String id;
    private String code;
    private String site;
    private String client;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long budget;
    private MissionStatus status;

    private String vehicleId;
    private String vehicleCode;
    private String vehicleType;
    private String vehiclePlate;

    private String driverId;
    private String driverName;
    private String driverPhone;

    private Integer departureKm;
    private Integer departureEngineHours;
    private Integer departureFuel;
    private Integer arrivalKm;
    private Integer arrivalEngineHours;
    private Integer arrivalFuel;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MissionResponse from(Mission m) {
        MissionResponse r = new MissionResponse();
        r.id = m.getId();
        r.code = m.getCode();
        r.site = m.getSite();
        r.client = m.getClient();
        r.startDate = m.getStartDate();
        r.endDate = m.getEndDate();
        r.budget = m.getBudget();
        r.status = m.getStatus();
        if (m.getVehicle() != null) {
            r.vehicleId = m.getVehicle().getId();
            r.vehicleCode = m.getVehicle().getCode();
            r.vehicleType = m.getVehicle().getType();
            r.vehiclePlate = m.getVehicle().getLicensePlate();
        }
        if (m.getDriver() != null) {
            r.driverId = m.getDriver().getId();
            r.driverName = m.getDriver().getName();
            r.driverPhone = m.getDriver().getPhone();
        }
        r.departureKm = m.getDepartureKm();
        r.departureEngineHours = m.getDepartureEngineHours();
        r.departureFuel = m.getDepartureFuel();
        r.arrivalKm = m.getArrivalKm();
        r.arrivalEngineHours = m.getArrivalEngineHours();
        r.arrivalFuel = m.getArrivalFuel();
        r.createdAt = m.getCreatedAt();
        r.updatedAt = m.getUpdatedAt();
        return r;
    }
}
