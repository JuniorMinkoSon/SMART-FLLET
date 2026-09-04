package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.InspectionRepository;
import com.smartfleet.smartfleet.repository.MaintenanceRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Contrôles de véhicules.
 *
 * Un contrôle n'est pas qu'un constat archivé : c'est ce qui fait passer un
 * engin de l'exploitation à l'atelier. Un contrôle critique immobilise donc le
 * véhicule et ouvre l'intervention correspondante dans la même opération —
 * laisser ces deux actes séparés reviendrait à compter sur la vigilance de
 * l'opérateur pour qu'un engin dangereux ne reparte pas.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class InspectionService {

    private static final Logger LOG = Logger.getLogger(InspectionService.class);

    private final InspectionRepository inspectionRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final MissionRepository missionRepository;

    /**
     * Enregistre un contrôle et en tire les conséquences.
     *
     * @param declaredResult verdict de l'opérateur. Laissé libre : un défaut
     *        anodin pris isolément peut être jugé bloquant sur un engin donné,
     *        et le jugement du contrôleur prime sur le décompte des cases.
     */
    public Inspection record(
        String vehicleId,
        String missionId,
        InspectionType type,
        boolean tyresOk,
        boolean brakesOk,
        boolean lightsOk,
        boolean bodyworkOk,
        InspectionResult declaredResult,
        String anomaly,
        Integer kmReading,
        User inspector
    ) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
            .orElseThrow(() -> new BusinessException("VEHICLE_NOT_FOUND", "Véhicule non trouvé", 404));

        Mission mission = null;
        if (missionId != null && !missionId.isBlank()) {
            mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));
        }

        Inspection inspection = Inspection.builder()
            .vehicle(vehicle)
            .mission(mission)
            .type(type == null ? InspectionType.PERIODIQUE : type)
            .tyresOk(tyresOk)
            .brakesOk(brakesOk)
            .lightsOk(lightsOk)
            .bodyworkOk(bodyworkOk)
            .result(resolveResult(declaredResult, tyresOk, brakesOk, lightsOk, bodyworkOk))
            .anomaly(anomaly)
            .kmReading(kmReading)
            .inspector(inspector)
            .build();

        Inspection saved = inspectionRepository.save(inspection);

        if (saved.getResult() == InspectionResult.CRITIQUE) {
            immobilize(vehicle, saved);
        }

        return saved;
    }

    /**
     * Verdict retenu.
     *
     * Le résultat déclaré fait foi. En son absence, il est déduit des points
     * vérifiés : un défaut de freins est bloquant, les autres appellent une
     * surveillance. Les freins sont traités à part parce qu'un engin qui ne
     * s'arrête pas n'est pas un engin qu'on surveille.
     */
    private InspectionResult resolveResult(
        InspectionResult declared,
        boolean tyresOk, boolean brakesOk, boolean lightsOk, boolean bodyworkOk
    ) {
        if (declared != null) {
            return declared;
        }
        if (!brakesOk) {
            return InspectionResult.CRITIQUE;
        }
        if (tyresOk && lightsOk && bodyworkOk) {
            return InspectionResult.OK;
        }
        return InspectionResult.ATTENTION;
    }

    /**
     * Retire le véhicule de l'exploitation et ouvre son intervention.
     *
     * L'intervention est créée automatiquement plutôt que laissée à saisir :
     * sans elle, l'engin resterait immobilisé sans que personne ne sache
     * pourquoi ni ne suive sa remise en état.
     */
    private void immobilize(Vehicle vehicle, Inspection inspection) {
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        vehicle.setCondition(VehicleCondition.MAUVAIS);
        vehicleRepository.save(vehicle);

        Maintenance maintenance = Maintenance.builder()
            .vehicle(vehicle)
            .inspection(inspection)
            .type(MaintenanceType.CORRECTIVE)
            .status(MaintenanceStatus.PLANIFIEE)
            .description(buildDescription(inspection))
            .kmReading(inspection.getKmReading())
            .build();

        maintenanceRepository.save(maintenance);

        LOG.infof("Contrôle critique sur %s : véhicule immobilisé, intervention ouverte",
            vehicle.getCode());
    }

    /** Reprend les points en défaut : l'atelier doit savoir quoi regarder. */
    private String buildDescription(Inspection i) {
        StringBuilder sb = new StringBuilder("Contrôle critique. Points en défaut : ");
        List<String> faults = new java.util.ArrayList<>();

        if (!Boolean.TRUE.equals(i.getTyresOk())) faults.add("pneus");
        if (!Boolean.TRUE.equals(i.getBrakesOk())) faults.add("freins");
        if (!Boolean.TRUE.equals(i.getLightsOk())) faults.add("éclairage");
        if (!Boolean.TRUE.equals(i.getBodyworkOk())) faults.add("carrosserie");

        sb.append(faults.isEmpty() ? "aucun point coché en défaut" : String.join(", ", faults));

        if (i.getAnomaly() != null && !i.getAnomaly().isBlank()) {
            sb.append(". Observation : ").append(i.getAnomaly());
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public List<Inspection> findAll() {
        return inspectionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Inspection> findByVehicle(String vehicleId) {
        return inspectionRepository.findByVehicle_IdOrderByCreatedAtDesc(vehicleId);
    }

    @Transactional(readOnly = true)
    public List<Inspection> findByMission(String missionId) {
        return inspectionRepository.findByMission_IdOrderByCreatedAtDesc(missionId);
    }
}
