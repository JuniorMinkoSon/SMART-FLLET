package com.smartfleet.smartfleet.entity;

/** Nature d'une intervention de maintenance. */
public enum MaintenanceType {

    /** Entretien planifié : vidange, révision, échéance kilométrique. */
    PREVENTIVE,

    /** Réparation d'un défaut constaté. */
    CORRECTIVE,

    /** Contrôle réglementaire : visite technique, conformité. */
    REGLEMENTAIRE
}
