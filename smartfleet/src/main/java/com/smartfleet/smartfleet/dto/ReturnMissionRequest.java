package com.smartfleet.smartfleet.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnMissionRequest {
    @NotNull
    private Integer km;

    @NotNull
    private Integer engineHours;

    @NotNull
    private Integer fuel;
}
