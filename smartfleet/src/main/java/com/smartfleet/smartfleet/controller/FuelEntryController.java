package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.CreateFuelEntryRequest;
import com.smartfleet.smartfleet.dto.FuelEntryResponse;
import com.smartfleet.smartfleet.entity.FuelEntry;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.FuelEntryRepository;
import com.smartfleet.smartfleet.service.FuelEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Pleins de carburant.
 *
 * Un plein est toujours rattaché à une mission : c'est elle qui porte le
 * véhicule, le conducteur et la période, donc le seul contexte dans lequel une
 * consommation est imputable. Un plein flottant ne pourrait être rapporté ni à
 * un engin ni à un chantier, et fausserait le coût au kilomètre.
 *
 * Le conducteur saisit ses propres pleins depuis le terrain ; le gestionnaire
 * saisit et consulte ceux de la flotte.
 */
@RestController
@RequestMapping("/api/fuel-entries")
@RequiredArgsConstructor
public class FuelEntryController {

    private final FuelEntryService fuelEntryService;
    private final FuelEntryRepository fuelEntryRepository;

    /**
     * Enregistre un plein sur une mission.
     *
     * La quantité et le coût doivent être strictement positifs : un plein de
     * zéro litre n'est pas un plein, et le laisser passer polluerait la
     * consommation moyenne sans jamais être remarqué.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE', 'CONDUCTEUR')")
    public ResponseEntity<FuelEntryResponse> record(
        @RequestParam String missionId,
        @Valid @RequestBody CreateFuelEntryRequest request
    ) {
        if (request.getQuantity() <= 0) {
            throw new BusinessException("INVALID_QUANTITY",
                "La quantité doit être supérieure à zéro.", 400);
        }
        if (request.getCost() < 0) {
            throw new BusinessException("INVALID_COST",
                "Le montant ne peut pas être négatif.", 400);
        }

        FuelEntry entry = fuelEntryService.recordFuel(
            missionId,
            null,
            request.getQuantity(),
            request.getCost(),
            request.getStation(),
            request.getReceiptUrl(),
            null
        );

        return new ResponseEntity<>(toResponse(entry), HttpStatus.CREATED);
    }

    /** Pleins de la flotte, du plus récent au plus ancien. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<FuelEntryResponse>> list(
        @RequestParam(required = false) String missionId
    ) {
        List<FuelEntry> entries = missionId != null
            ? fuelEntryService.getFuelEntriesByMission(missionId)
            : fuelEntryRepository.findAll();

        return ResponseEntity.ok(entries.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(FuelEntryController::toResponse)
            .toList());
    }

    /**
     * Le véhicule et le conducteur ne sont pas portés par le plein mais par sa
     * mission : les exposer ici évite à l'appelant de recharger la mission pour
     * savoir quel engin a été ravitaillé.
     */
    private static FuelEntryResponse toResponse(FuelEntry e) {
        var mission = e.getMission();

        FuelEntryResponse r = new FuelEntryResponse();
        r.setId(e.getId());
        r.setMissionId(mission != null ? mission.getId() : null);
        r.setDriverId(mission != null && mission.getDriver() != null
            ? mission.getDriver().getId() : null);
        r.setQuantity(e.getQuantity());
        r.setCost(e.getCost());
        r.setStation(e.getStation());
        r.setReceiptUrl(e.getReceiptUrl());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }
}
