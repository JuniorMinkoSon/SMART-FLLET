package com.smartfleet.smartfleet.entity;

/**
 * Provenance d'un engin.
 *
 * Détermine qui porte le coût et la responsabilité de l'entretien, et sépare ce
 * qui appartient à l'entreprise de ce qui est mis à disposition par un tiers.
 * Sans cette distinction, le coût de possession d'un engin loué se confond avec
 * celui du parc propre, et le bilan de flotte devient faux.
 */
public enum VehicleOwnership {

    /** Propriété de l'entreprise. */
    INTERNE,

    /** Loué ou mis à disposition par un prestataire, pour une durée déterminée. */
    EXTERNE
}
