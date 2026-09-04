package com.smartfleet.smartfleet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Alerte de flotte.
 *
 * Calculée à la demande à partir de l'état réel du parc, jamais stockée. Une
 * alerte n'est pas un fait à saisir mais la lecture d'une situation : un
 * véhicule dont le carburant remonte cesse d'alerter de lui-même, sans qu'on ait
 * à penser à clore une ligne. Persister ces alertes reviendrait à maintenir une
 * copie qui se désynchronise dès la première mise à jour manquée.
 *
 * L'identifiant est donc dérivé de la règle et de la ressource concernée, et
 * reste stable d'un appel à l'autre tant que la situation dure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetAlertResponse {

    /** Stable tant que la cause persiste : « fuel-low:VH-0042 ». */
    private String id;

    /** urgent, attention ou info — vocabulaire attendu par l'interface. */
    private String severity;

    private String title;

    /** Ce qui a déclenché l'alerte, avec la valeur observée. */
    private String detail;

    /** Horodatage de l'observation, au format ISO. */
    private String time;

    /**
     * Toujours faux.
     *
     * Une alerte dérivée n'a pas d'état de lecture : rien n'est stocké qu'on
     * pourrait marquer. Le champ est conservé pour rester conforme au contrat de
     * l'interface, qui l'attend.
     */
    private boolean read;

    /** Type de ressource concernée : VEHICLE, MISSION ou DRIVER. */
    private String resourceType;

    /** Identifiant de la ressource, pour permettre la navigation depuis l'alerte. */
    private String resourceId;

    /** Règle ayant produit l'alerte, utile au diagnostic et au filtrage. */
    private String rule;

    public static final String URGENT = "urgent";
    public static final String ATTENTION = "attention";
    public static final String INFO = "info";
}
