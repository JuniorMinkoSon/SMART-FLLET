package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.entity.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Vue d'un véhicule exposée par l'API.
 *
 * Les noms suivent le contrat déjà en place côté interface : {@code plate} et
 * {@code km} plutôt que {@code licensePlate} et {@code currentKm}. Renommer ici
 * plutôt que dans les écrans évite de disperser la traduction dans chaque appel,
 * et le vocabulaire retenu est celui des utilisateurs.
 *
 * Le conducteur affecté n'est exposé que par son identifiant et son nom : la
 * liste de flotte n'a pas besoin de sa fiche complète, et la sérialiser
 * entraînerait ses missions et ses compétences à chaque ligne.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {

    private String id;
    private String code;
    private String type;

    /** Désignation d'usage, distincte du code d'inventaire. */
    private String name;

    private String plate;
    private VehicleStatus status;

    private Integer initialKm;

    /** Kilométrage courant. */
    private Integer km;

    private Integer engineHours;
    private Integer fuelLevel;

    /** État général : « Bon », « Moyen » ou « Mauvais ». */
    private String condition;

    /** Site d'affectation. */
    private String site;

    /** Conducteur affecté, s'il y en a un. */
    private String driverId;

    /** Nom du conducteur affecté, pour éviter un second appel par ligne. */
    private String driverName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Projette une entité vers sa vue exposée.
     *
     * Le conducteur affecté est chargé paresseusement : y accéder ici suppose
     * que l'appelant se trouve dans une transaction ouverte, ce qui est le cas
     * des services qui produisent cette vue.
     */
    public static VehicleResponse from(Vehicle v) {
        var driver = v.getAssignedDriver();

        return VehicleResponse.builder()
            .id(v.getId())
            .code(v.getCode())
            .type(v.getType())
            .name(v.getName())
            .plate(v.getLicensePlate())
            .status(v.getStatus())
            .initialKm(v.getInitialKm())
            .km(v.getCurrentKm())
            .engineHours(v.getEngineHours())
            .fuelLevel(v.getFuelLevel())
            // Un état absent est présenté comme bon plutôt que vide : le client
            // affiche cette valeur telle quelle et n'a pas de cas « inconnu ».
            .condition(v.getCondition() == null ? "Bon" : v.getCondition().label())
            .site(v.getSite())
            .driverId(driver == null ? null : driver.getId())
            .driverName(driver == null ? null : driver.getName())
            .createdAt(v.getCreatedAt())
            .updatedAt(v.getUpdatedAt())
            .build();
    }
}
