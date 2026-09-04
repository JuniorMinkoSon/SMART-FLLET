package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.FleetAlertResponse;
import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Alertes de flotte.
 *
 * Les alertes sont calculées à chaque appel à partir de l'état réel du parc :
 * il n'y a rien à créer, modifier ou marquer comme lu, d'où l'absence de verbes
 * d'écriture sur cette ressource.
 */
@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final DriverRepository driverRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<FleetAlertResponse>> getAllAlerts() {
        return ResponseEntity.ok(alertService.currentAlerts());
    }

    /**
     * Alertes du conducteur connecté.
     *
     * Le conducteur est retrouvé par son compte utilisateur : un conducteur ne
     * doit voir que ce qui le concerne, et transmettre son identifiant en
     * paramètre laisserait la porte ouverte à la consultation d'autrui.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<List<FleetAlertResponse>> getMyAlerts(Authentication authentication) {
        Optional<Driver> driver = driverRepository.findAll().stream()
            .filter(d -> d.getUser() != null
                && d.getUser().getEmail().equalsIgnoreCase(authentication.getName()))
            .findFirst();

        // Un compte conducteur sans fiche associée n'est pas une erreur : il n'a
        // simplement aucune alerte le concernant.
        return ResponseEntity.ok(driver
            .map(d -> alertService.alertsForDriver(d.getId()))
            .orElseGet(List::of));
    }
}
