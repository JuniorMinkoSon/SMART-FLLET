package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Vue d'un conducteur exposée par l'API.
 *
 * Les compétences sont stockées en base sous forme de chaîne JSON ; elles sont
 * désérialisées ici plutôt que laissées à la charge de l'appelant, qui aurait à
 * refaire ce travail dans chaque écran.
 *
 * Le champ {@code license} reprend le type de permis porté par l'entité, sous le
 * nom employé par l'interface.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponse {

    private String id;
    private String name;

    /** Matricule du conducteur dans l'entreprise. */
    private String matricule;

    private String email;
    private String phone;

    /** Type de permis détenu. */
    private String license;

    /** Échéance de validité du permis, si renseignée. */
    private LocalDate licenseExpiryDate;

    private DriverStatus status;

    /** Compétences, désérialisées depuis leur stockage JSON. */
    private Set<String> skills;

    /** Catégories de véhicules que le conducteur est habilité à conduire. */
    private Set<String> vehicleCategories;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DriverResponse from(Driver d) {
        return DriverResponse.builder()
            .id(d.getId())
            .name(d.getName())
            .matricule(d.getMatricule())
            .email(d.getEmail())
            .phone(d.getPhone())
            .license(d.getLicenseType())
            .licenseExpiryDate(d.getLicenseExpiryDate())
            .status(d.getStatus())
            .skills(parseList(d.getSkills()))
            .vehicleCategories(parseList(d.getVehicleCategories()))
            .createdAt(d.getCreatedAt())
            .updatedAt(d.getUpdatedAt())
            .build();
    }

    /**
     * Lit une liste stockée en texte.
     *
     * Le champ contient tantôt un tableau JSON, tantôt une simple énumération
     * séparée par des virgules selon la façon dont l'enregistrement a été créé.
     * Les deux formes sont acceptées : refuser l'une reviendrait à faire
     * disparaître les compétences d'une partie des conducteurs.
     *
     * L'ordre d'insertion est conservé — il porte souvent une intention, la
     * compétence principale étant citée en premier.
     */
    static Set<String> parseList(String raw) {
        Set<String> values = new LinkedHashSet<>();
        if (raw == null || raw.isBlank()) {
            return values;
        }

        String cleaned = raw.trim();

        // Certaines fiches stockent la liste doublement encodée : une chaîne
        // JSON qui contient elle-même un tableau JSON échappé. Sans ce
        // déballage, les compétences ressortent avec leurs barres obliques et
        // s'affichent telles quelles à l'écran.
        while (cleaned.length() >= 2 && cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1).trim();
            cleaned = cleaned.replace("\\\"", "\"").replace("\\\\", "\\");
        }

        if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
            cleaned = cleaned.substring(1, cleaned.length() - 1);
        }

        for (String part : cleaned.split(",")) {
            String value = part.trim()
                .replaceAll("^[\\\\\"']+|[\\\\\"']+$", "")
                .trim();
            if (!value.isEmpty()) {
                values.add(value);
            }
        }
        return values;
    }
}
