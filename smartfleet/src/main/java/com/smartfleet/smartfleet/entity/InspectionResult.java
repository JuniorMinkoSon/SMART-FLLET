package com.smartfleet.smartfleet.entity;

/**
 * Verdict d'un contrôle.
 *
 * Trois niveaux et non deux : une anomalie mineure doit pouvoir être consignée
 * sans immobiliser l'engin, sinon elle ne sera pas déclarée du tout.
 */
public enum InspectionResult {

    /** Aucun défaut : le véhicule reste utilisable. */
    OK,

    /** Défaut à surveiller ou à traiter, sans urgence. */
    ATTENTION,

    /**
     * Défaut interdisant l'exploitation.
     *
     * Immobilise le véhicule et ouvre une intervention de maintenance : un
     * contrôle critique qui laisserait l'engin affectable n'aurait aucun effet.
     */
    CRITIQUE
}
