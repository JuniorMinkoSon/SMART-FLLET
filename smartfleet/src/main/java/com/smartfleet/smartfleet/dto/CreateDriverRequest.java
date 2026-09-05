package com.smartfleet.smartfleet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateDriverRequest {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String licenseType;

    private List<String> vehicleCategories;

    private List<String> skills;

    /** Matricule dans l'entreprise. Unique s'il est renseigné. */
    private String matricule;

    /** Échéance de validité du permis. */
    private java.time.LocalDate licenseExpiryDate;

    /**
     * Mot de passe initial du compte créé avec la fiche.
     *
     * Facultatif : sans lui, un mot de passe est engendré. Il doit alors être
     * réinitialisé, faute de quoi le conducteur ne pourra pas se connecter.
     */
    private String password;
}
