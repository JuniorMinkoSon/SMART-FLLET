package com.smartfleet.smartfleet.entity;

/**
 * État général d'un véhicule.
 *
 * À distinguer de {@link VehicleStatus}, qui décrit la disponibilité à l'instant
 * présent : un engin peut être DISPONIBLE tout en étant en mauvais état, et
 * inversement être EN_MISSION alors qu'il est en bon état. Le premier conditionne
 * l'affectation, le second déclenche l'entretien.
 */
public enum VehicleCondition {

    /** Aucune anomalie connue. */
    BON,

    /** Usure ou défaut mineur : utilisable, à surveiller. */
    MOYEN,

    /** Défaut nécessitant une intervention avant nouvelle affectation. */
    MAUVAIS;

    /**
     * Libellé attendu par le client, qui affiche « Bon », « Moyen », « Mauvais ».
     * La conversion est faite ici plutôt que dans chaque écran.
     */
    public String label() {
        return switch (this) {
            case BON -> "Bon";
            case MOYEN -> "Moyen";
            case MAUVAIS -> "Mauvais";
        };
    }

    /**
     * Lecture tolérante d'un libellé.
     *
     * Accepte aussi bien la constante que le libellé affiché : les données
     * peuvent arriver sous l'une ou l'autre forme selon leur origine, et un état
     * inconnu vaut mieux traité comme MOYEN que rejeté — un véhicule mal
     * qualifié doit rester visible, pas disparaître de la flotte.
     */
    public static VehicleCondition from(String value) {
        if (value == null || value.isBlank()) {
            return BON;
        }
        return switch (value.trim().toUpperCase()) {
            case "BON" -> BON;
            case "MAUVAIS" -> MAUVAIS;
            default -> MOYEN;
        };
    }
}
