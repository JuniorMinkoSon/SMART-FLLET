package com.smartfleet.smartfleet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMissionRequest {

    @NotBlank(message = "L'engin est obligatoire")
    private String vehicleId;

    @NotBlank(message = "Le conducteur est obligatoire")
    private String driverId;

    @NotNull(message = "La date de debut est obligatoire")
    private LocalDate startDate;

    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate endDate;

    @NotBlank(message = "Le chantier est obligatoire")
    private String site;

    private String client;

    @NotNull(message = "Le budget est obligatoire")
    @PositiveOrZero(message = "Le budget doit etre positif")
    private Long budget;

    /** Debut de journee : la mission couvre la journee de debut en entier. */
    public LocalDateTime startAt() {
        return startDate.atStartOfDay();
    }

    /** Fin de journee : la mission couvre la journee de fin en entier. */
    public LocalDateTime endAt() {
        return endDate.atTime(23, 59, 59);
    }
}
