package com.smartfleet.smartfleet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @Email(message = "Adresse email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
    private String password;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    /**
     * Role demande. Volontairement NON pris en compte tel quel : toute
     * auto-inscription cree un CONDUCTEUR. Attribuer ADMIN/GESTIONNAIRE/DG
     * reste une action reservee a un ADMIN via POST /api/users.
     */
    private String role;

    /** Numéro de téléphone, utile au gestionnaire pour joindre le conducteur. */
    private String phone;

    /** Type de permis détenu. */
    private String licenseType;

    /**
     * Engins que la personne est habilitée à conduire.
     *
     * Sans habilitation, elle ne sera proposée sur aucune affectation : le
     * formulaire les demande à l'inscription plutôt que de laisser un compte
     * inutilisable.
     */
    private java.util.List<String> vehicleCategories;
}
