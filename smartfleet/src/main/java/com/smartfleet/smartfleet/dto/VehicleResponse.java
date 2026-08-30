package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private String id;
    private String code;
    private String type;
    private String licensePlate;
    private VehicleStatus status;
    private Integer initialKm;
    private Integer currentKm;
    private Integer engineHours;
    private Integer fuelLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
