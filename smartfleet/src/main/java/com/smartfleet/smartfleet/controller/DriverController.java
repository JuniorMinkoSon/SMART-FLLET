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
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        // La construction passe par le service : c'est lui qui crée le compte
        // d'accès en même temps que la fiche. Assemblée ici, l'entité était
        // enregistrée sans compte, et le conducteur ne pouvait jamais se
        // connecter pour voir ses missions.
        Driver saved = driverService.createDriver(
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
        return new ResponseEntity<>(DriverResponse.from(saved), HttpStatus.CREATED);
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
