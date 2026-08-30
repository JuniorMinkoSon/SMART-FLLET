package com.smartfleet.smartfleet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVehicleRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String type;

    @NotBlank
    private String licensePlate;

    @NotNull
    private Integer initialKm;

    @NotNull
    private Integer fuelLevel;
}
