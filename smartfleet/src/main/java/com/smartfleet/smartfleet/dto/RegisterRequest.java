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
}
