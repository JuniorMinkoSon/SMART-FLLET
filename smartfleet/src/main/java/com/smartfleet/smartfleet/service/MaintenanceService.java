package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.MaintenanceRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Interventions de maintenance.
 *
 * Le service tient la cohérence entre l'intervention et l'état du véhicule :
 * ouvrir une intervention immobilise l'engin, la clore le remet en service — à
 * condition qu'aucune autre ne soit encore ouverte. Sans cette dernière
 * vérification, clore une intervention parmi plusieurs rendrait disponible un
 * véhicule encore à l'atelier.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceService {

    private static final Logger LOG = Logger.getLogger(MaintenanceService.class);

    private static final List<MaintenanceStatus> BLOCKING =
        List.of(MaintenanceStatus.PLANIFIEE, MaintenanceStatus.EN_COURS);

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    /** Ouvre une intervention et retire le véhicule de l'exploitation. */
    public Maintenance schedule(
        String vehicleId,
        MaintenanceType type,
        String description,
        LocalDate scheduledDate,
        String provider,
        User createdBy
    ) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
            .orElseThrow(() -> new BusinessException("VEHICLE_NOT_FOUND", "Véhicule non trouvé", 404));

        if (description == null || description.isBlank()) {
            throw new BusinessException("DESCRIPTION_REQUIRED",
                "Décrivez l'intervention à réaliser.", 400);
        }

        Maintenance maintenance = Maintenance.builder()
            .vehicle(vehicle)
            .type(type == null ? MaintenanceType.PREVENTIVE : type)
            .status(MaintenanceStatus.PLANIFIEE)
            .description(description.trim())
            .scheduledDate(scheduledDate)
            .provider(provider)
            .kmReading(vehicle.getCurrentKm())
            .createdBy(createdBy)
            .build();

        Maintenance saved = maintenanceRepository.save(maintenance);

        // Une intervention planifiée sur un engin en mission ne l'interrompt
        // pas : il passera à l'atelier à son retour.
        if (vehicle.getStatus() == VehicleStatus.DISPONIBLE
            || vehicle.getStatus() == VehicleStatus.CONTROLE) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
            vehicleRepository.save(vehicle);
        }

        return saved;
    }

    /** Passe l'intervention en atelier. */
    public Maintenance start(String maintenanceId) {
        Maintenance m = find(maintenanceId);

        if (m.getStatus() != MaintenanceStatus.PLANIFIEE) {
            throw new BusinessException("INVALID_STATUS",
                "Seule une intervention planifiée peut être démarrée.", 409);
        }

        m.setStatus(MaintenanceStatus.EN_COURS);

        Vehicle vehicle = m.getVehicle();
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        vehicleRepository.save(vehicle);

        return maintenanceRepository.save(m);
    }

    /**
     * Clôt l'intervention et remet le véhicule en service si plus rien ne
     * l'immobilise.
     *
     * Le coût est exigé ici : c'est le seul moment où il est connu, et une
     * intervention close sans coût disparaît des indicateurs de flotte sans
     * qu'on s'en aperçoive.
     */
    public Maintenance complete(
        String maintenanceId,
        Integer cost,
        String provider,
        String notes,
        VehicleCondition resultingCondition
    ) {
        Maintenance m = find(maintenanceId);

        if (m.getStatus() == MaintenanceStatus.TERMINEE) {
            throw new BusinessException("ALREADY_COMPLETED",
                "Cette intervention est déjà terminée.", 409);
        }
        if (m.getStatus() == MaintenanceStatus.ANNULEE) {
            throw new BusinessException("INVALID_STATUS",
                "Une intervention annulée ne peut pas être clôturée.", 409);
        }
        if (cost == null || cost < 0) {
            throw new BusinessException("COST_REQUIRED",
                "Renseignez le coût réel de l'intervention.", 400);
        }

        m.setStatus(MaintenanceStatus.TERMINEE);
        m.setCompletedDate(LocalDate.now());
        m.setCost(cost);
        if (provider != null && !provider.isBlank()) {
            m.setProvider(provider);
        }
        m.setNotes(notes);

        Maintenance saved = maintenanceRepository.save(m);
        releaseIfFree(m.getVehicle(), resultingCondition);
        return saved;
    }

    /** Abandonne une intervention sans la supprimer : la décision reste tracée. */
    public Maintenance cancel(String maintenanceId) {
        Maintenance m = find(maintenanceId);

        if (m.getStatus() == MaintenanceStatus.TERMINEE) {
            throw new BusinessException("INVALID_STATUS",
                "Une intervention terminée ne peut pas être annulée.", 409);
        }

        m.setStatus(MaintenanceStatus.ANNULEE);
        Maintenance saved = maintenanceRepository.save(m);

        releaseIfFree(m.getVehicle(), null);
        return saved;
    }

    /**
     * Remet le véhicule à disposition, sauf si une autre intervention reste
     * ouverte : un engin peut cumuler plusieurs travaux, et le libérer après le
     * premier le rendrait affectable alors qu'il est encore à l'atelier.
     */
    private void releaseIfFree(Vehicle vehicle, VehicleCondition condition) {
        boolean stillBlocked = maintenanceRepository
            .findByVehicle_IdAndStatusIn(vehicle.getId(), BLOCKING)
            .stream()
            .anyMatch(Maintenance::isOngoing);

        if (stillBlocked) {
            LOG.infof("Véhicule %s maintenu à l'atelier : d'autres interventions restent ouvertes",
                vehicle.getCode());
            return;
        }

        vehicle.setStatus(VehicleStatus.DISPONIBLE);
        // L'atelier constate l'état au terme des travaux ; à défaut, l'engin est
        // rendu en bon état puisqu'il vient d'être réparé.
        vehicle.setCondition(condition == null ? VehicleCondition.BON : condition);
        vehicleRepository.save(vehicle);
    }

    private Maintenance find(String id) {
        return maintenanceRepository.findById(id)
            .orElseThrow(() -> new BusinessException("MAINTENANCE_NOT_FOUND",
                "Intervention non trouvée", 404));
    }

    @Transactional(readOnly = true)
    public List<Maintenance> findAll() {
        return maintenanceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Maintenance> findByVehicle(String vehicleId) {
        return maintenanceRepository.findByVehicle_IdOrderByCreatedAtDesc(vehicleId);
    }

    @Transactional(readOnly = true)
    public List<Maintenance> findByStatus(MaintenanceStatus status) {
        return maintenanceRepository.findByStatusOrderByScheduledDateAsc(status);
    }
}
