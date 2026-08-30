package com.smartfleet.smartfleet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelEntryResponse {
    private String id;
    private String missionId;
    private String driverId;
    private Double quantity;
    private Integer cost;
    private String station;
    private String receiptUrl;
    private LocalDateTime createdAt;
}
