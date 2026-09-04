package com.smartfleet.smartfleet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Synthèse de flotte.
 *
 * Construite à la demande à partir des données réelles — véhicules, missions,
 * conducteurs, carburant — plutôt que stockée. Un rapport figé décrirait l'état
 * du parc au moment de sa génération et vieillirait dès la mission suivante ;
 * ici la lecture est toujours celle de l'instant.
 *
 * Les répartitions sont fournies telles quelles plutôt qu'en pourcentages :
 * l'interface décide de sa présentation, et un effectif brut reste
 * interprétable quand un pourcentage sur trois véhicules ne l'est pas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetReportResponse {

    /** Horodatage de la synthèse : elle reflète l'état à cet instant. */
    private String generatedAt;

    private FleetSummary fleet;
    private MissionSummary missions;
    private DriverSummary drivers;
    private FuelSummary fuel;

    /** Nombre d'alertes courantes, par niveau de gravité. */
    private Map<String, Integer> alerts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FleetSummary {
        private int total;

        /** Effectifs par statut de disponibilité. */
        private Map<String, Integer> byStatus;

        /** Effectifs par état général. */
        private Map<String, Integer> byCondition;

        /** Effectifs par site d'affectation. */
        private Map<String, Integer> bySite;

        /** Véhicules immédiatement affectables. */
        private int available;

        /** Véhicules immobilisés : maintenance ou hors service. */
        private int immobilized;

        /**
         * Part du parc affectable, en pourcentage entier.
         *
         * Fournie car c'est l'indicateur suivi par les gestionnaires ; le détail
         * reste disponible dans les effectifs pour qui veut recalculer.
         */
        private int availabilityRate;

        private long totalKm;
        private long totalEngineHours;

        /** Véhicules sans conducteur affecté. */
        private int withoutDriver;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MissionSummary {
        private int total;
        private Map<String, Integer> byStatus;

        /** Missions dont l'échéance est dépassée sans clôture. */
        private int overdue;

        private int active;
        private int completed;

        /** Budget cumulé des missions, dans l'unité de saisie. */
        private long totalBudget;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DriverSummary {
        private int total;
        private Map<String, Integer> byStatus;
        private int available;

        /**
         * Conducteurs sans matricule renseigné.
         *
         * Exposé parce que c'est une donnée métier attendue sur les documents de
         * mission : son absence est un défaut de saisie à corriger, pas un
         * détail technique.
         */
        private int missingMatricule;
    }

    /**
     * Fréquentation d'une station.
     *
     * Un type nommé plutôt qu'une entrée de dictionnaire : sérialisée, celle-ci
     * produit un objet dont la clé est le nom de la station, si bien que la
     * forme de la réponse change avec les données et devient illisible pour
     * l'appelant.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationCount {
        private String station;
        private int count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FuelSummary {
        private int entries;
        private double totalQuantity;
        private long totalCost;

        /** Niveau de carburant moyen du parc, en pourcentage. */
        private int averageLevel;

        /** Véhicules dont le niveau impose un ravitaillement. */
        private int lowFuelVehicles;

        /** Stations les plus utilisées, par nombre de pleins. */
        private List<StationCount> topStations;
    }
}
