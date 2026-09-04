package com.smartfleet.smartfleet.entity;

/** Moment auquel un contrôle est réalisé. */
public enum InspectionType {

    /** Avant la prise en charge d'une mission. */
    AVANT_DEPART,

    /** Au retour de mission, avant remise à disposition. */
    APRES_MISSION,

    /** Vérification quotidienne au dépôt, hors mission. */
    QUOTIDIEN,

    /** Vérification planifiée, indépendante de l'exploitation. */
    PERIODIQUE
}
