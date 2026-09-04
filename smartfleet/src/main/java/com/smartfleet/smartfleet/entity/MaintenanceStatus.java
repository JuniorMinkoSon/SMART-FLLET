package com.smartfleet.smartfleet.entity;

/**
 * Cycle de vie d'une intervention.
 *
 * ANNULEE existe pour ne pas avoir à supprimer une intervention devenue sans
 * objet : la trace de ce qui avait été planifié reste utile, et l'effacer
 * ferait disparaître une décision de l'historique du véhicule.
 */
public enum MaintenanceStatus {

    /** Prévue, l'engin n'est pas encore à l'atelier. */
    PLANIFIEE,

    /** En atelier. */
    EN_COURS,

    /** Réalisée : le véhicule peut repartir. */
    TERMINEE,

    /** Abandonnée avant réalisation. */
    ANNULEE
}
