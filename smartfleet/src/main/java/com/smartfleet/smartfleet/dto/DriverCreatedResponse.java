package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.Driver;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Réponse à la création d'un conducteur.
 *
 * Porte le mot de passe initial du compte, et c'est la seule occasion de le
 * voir : il est haché en base, donc impossible à relire ensuite. Celui qui crée
 * la fiche doit le transmettre au conducteur maintenant, ou le réinitialiser
 * plus tard.
 *
 * Type distinct de DriverResponse à dessein : la liste des conducteurs ne doit
 * jamais transporter de mot de passe, même vide. Un champ facultatif sur la vue
 * commune finirait par être exposé partout où elle est renvoyée.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverCreatedResponse {

    private DriverResponse driver;

    /** Mot de passe en clair, affiché une seule fois. */
    private String initialPassword;

    /**
     * Vrai si le mot de passe a été engendré faute d'en avoir reçu un.
     *
     * L'interface s'en sert pour insister sur la copie : un mot de passe choisi
     * par le créateur, lui, est déjà connu.
     */
    private boolean generated;

    public static DriverCreatedResponse of(Driver driver, String password, boolean generated) {
        return DriverCreatedResponse.builder()
            .driver(DriverResponse.from(driver))
            .initialPassword(password)
            .generated(generated)
            .build();
    }
}
