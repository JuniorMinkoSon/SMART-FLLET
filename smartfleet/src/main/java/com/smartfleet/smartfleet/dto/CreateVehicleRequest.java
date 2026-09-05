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

    /** Désignation d'usage : « Pelle Komatsu 210 » plutôt que « VH-0042 ». */
    private String name;

    /** Site d'affectation. */
    private String site;

    /** INTERNE par défaut : le cas majoritaire. */
    private com.smartfleet.smartfleet.entity.VehicleOwnership ownership;

    /** Prestataire propriétaire, requis pour un engin externe. */
    private String ownerCompany;

    /** Fin de mise à disposition d'un engin externe. */
    private java.time.LocalDate contractEndDate;
}
