package com.smartfleet.smartfleet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMissionRequest {
    @NotBlank
    private String vehicleId;

    @NotBlank
    private String driverId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotBlank
    private String site;

    @NotBlank
    private String client;

    @NotNull
    private Integer budget;
}
