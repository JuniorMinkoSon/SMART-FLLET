package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.MissionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissionResponse {
    private String id;
    private String code;
    private String site;
    private String client;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer budget;
    private String vehicleId;
    private String vehicleCode;
    private String driverId;
    private String driverName;
    private MissionStatus status;
    private Integer departureKm;
    private Integer departureEngineHours;
    private Integer departureFuel;
    private Integer returnKm;
    private Integer returnEngineHours;
    private Integer returnFuel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
