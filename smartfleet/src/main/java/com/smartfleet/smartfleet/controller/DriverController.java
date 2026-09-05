package com.smartfleet.smartfleet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfleet.smartfleet.dto.*;
import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Conducteurs.
 *
 * Les réponses passent par {@link DriverResponse} et non par l'entité. Renvoyer
 * l'entité exposait sa relation vers le compte utilisateur — donc la structure
 * interne de l'authentification — et laissait les compétences sous leur forme de
 * stockage, une chaîne JSON que chaque écran devait décoder lui-même.
 */
@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final ObjectMapper objectMapper;

    /**
     * Crée un conducteur et son compte d'accès.
     *
     * Ouvert au gestionnaire : constituer l'équipe fait partie de la conduite
     * de la flotte. L'écran lui proposait déjà le bouton, que le serveur
     * refusait — l'action existait sans être permise.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<DriverCreatedResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        // La construction passe par le service : c'est lui qui crée le compte
        // d'accès en même temps que la fiche. Assemblée ici, l'entité était
        // enregistrée sans compte, et le conducteur ne pouvait jamais se
        // connecter pour voir ses missions.
        DriverService.CreatedDriver created = driverService.createDriver(
            request.getName(),
            request.getEmail(),
            request.getPhone(),
            request.getMatricule(),
            request.getLicenseType(),
            request.getLicenseExpiryDate(),
            request.getSkills(),
            request.getVehicleCategories(),
            request.getPassword()
        );

        // La réponse porte le mot de passe : c'est la seule occasion de
        // l'afficher, il est haché en base et ne pourra plus être relu.
        return new ResponseEntity<>(
            DriverCreatedResponse.of(created.driver(), created.password(), created.generated()),
            HttpStatus.CREATED);
    }

    /**
     * Réinitialise le mot de passe d'un conducteur.
     *
     * Retourne le nouveau mot de passe en clair, une seule fois : l'ancien est
     * haché, donc irrécupérable. C'est le seul moyen de rendre l'accès à
     * quelqu'un qui l'a perdu.
     */
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<PasswordResetResponse> resetPassword(
        @PathVariable String id,
        @RequestBody(required = false) PasswordResetRequest request
    ) {
        String applied = driverService.resetPassword(
            id, request == null ? null : request.getPassword());
        return ResponseEntity.ok(new PasswordResetResponse(applied));
    }

    /** Mot de passe choisi. Absent, un mot de passe est engendré. */
    @lombok.Data
    public static class PasswordResetRequest {
        private String password;
    }

    /** Nouveau mot de passe, à transmettre au conducteur. */
    public record PasswordResetResponse(String password) {
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers().stream()
            .map(DriverResponse::from)
            .toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<DriverResponse> getDriver(@PathVariable String id) {
        return driverService.getDriverById(id)
            .map(DriverResponse::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<DriverResponse>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers().stream()
            .map(DriverResponse::from)
            .toList());
    }
}
