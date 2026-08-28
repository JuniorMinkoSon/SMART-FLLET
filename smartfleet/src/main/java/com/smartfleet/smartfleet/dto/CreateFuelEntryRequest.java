package com.smartfleet.smartfleet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFuelEntryRequest {
    @NotNull
    private Double quantity;

    @NotNull
    private Integer cost;

    @NotBlank
    private String station;

    private String receiptUrl;
}
