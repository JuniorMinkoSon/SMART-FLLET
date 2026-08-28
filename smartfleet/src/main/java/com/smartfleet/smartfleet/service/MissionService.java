package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MissionService {
    private final MissionRepository missionRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final AuditEventRepository auditEventRepository;
    private final AuditService auditService;

    // CREATE MISSION
    public Mission createMission(String vehicleId, String driverId, LocalDate startDate,
                                 LocalDate endDate, String site, String client, Integer budget, String actorId) {
        // Verify vehicle exists and is available
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
            .orElseThrow(() -> new BusinessException("VEHICLE_NOT_FOUND", "Engin non trouvé", 404));

        if (vehicle.getStatus() != VehicleStatus.DISPONIBLE && vehicle.getStatus() != VehicleStatus.RESERVE) {
            throw new BusinessException("VEHICLE_NOT_AVAILABLE",
                "Engin " + vehicle.getCode() + " non disponible (" + vehicle.getStatus() + ")", 409);
        }

        // Verify driver exists and is available
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new BusinessException("DRIVER_NOT_FOUND", "Conducteur non trouvé", 404));

        if (driver.getStatus() != DriverStatus.DISPONIBLE && driver.getStatus() != DriverStatus.RESERVE) {
            throw new BusinessException("DRIVER_NOT_AVAILABLE", "Conducteur non disponible (" + driver.getStatus() + ")", 409);
        }

        // Verify habilitation
        if (!driver.getSkills().contains(vehicle.getType())) {
            throw new BusinessException("DRIVER_NOT_QUALIFIED",
                "Conducteur non habilité pour engins type " + vehicle.getType(), 400);
        }

        // Check vehicle conflicts
        List<Mission> vehicleConflicts = missionRepository.findOverlappingVehicleMissions(vehicleId, startDate, endDate);
        if (!vehicleConflicts.isEmpty()) {
            throw new BusinessException("VEHICLE_CONFLICT", "Engin déjà réservé sur cette période", 409);
        }

        // Check driver conflicts
        List<Mission> driverConflicts = missionRepository.findOverlappingDriverMissions(driverId, startDate, endDate);
        if (!driverConflicts.isEmpty()) {
            throw new BusinessException("DRIVER_CONFLICT", "Conducteur déjà affecté sur cette période", 409);
        }

        // Create mission
        Mission mission = Mission.builder()
            .code(generateMissionCode())
            .vehicle(vehicle)
            .driver(driver)
            .startDate(startDate)
            .endDate(endDate)
            .site(site)
            .client(client)
            .budget(budget)
            .status(MissionStatus.AFFECTEE)
            .build();

        mission = missionRepository.save(mission);

        // Update vehicle and driver status
        vehicle.setStatus(VehicleStatus.RESERVE);
        vehicleRepository.save(vehicle);

        driver.setStatus(DriverStatus.RESERVE);
        driverRepository.save(driver);

        // Log audit
        auditService.logEvent(AuditEventType.MISSION_CREATED, actorId, mission);

        return mission;
    }

    // START MISSION
    public Mission startMission(String missionId, Integer km, Integer engineHours, Integer fuel, String actorId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));

        if (mission.getStatus() != MissionStatus.AFFECTEE) {
            throw new BusinessException("MISSION_NOT_AFFECTEE", "Mission non affectée", 409);
        }

        mission.setStatus(MissionStatus.EN_COURS);
        mission.setDepartureKm(km);
        mission.setDepartureEngineHours(engineHours);
        mission.setDepartureFuel(fuel);
        mission = missionRepository.save(mission);

        // Update vehicle and driver
        Vehicle vehicle = mission.getVehicle();
        vehicle.setStatus(VehicleStatus.EN_MISSION);
        vehicleRepository.save(vehicle);

        Driver driver = mission.getDriver();
        driver.setStatus(DriverStatus.EN_MISSION);
        driverRepository.save(driver);

        // Log audit
        auditService.logEvent(AuditEventType.MISSION_STARTED, actorId, mission);

        return mission;
    }

    // RETURN MISSION
    public Mission returnMission(String missionId, Integer km, Integer engineHours, Integer fuel, String actorId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));

        if (mission.getStatus() != MissionStatus.EN_COURS) {
            throw new BusinessException("MISSION_NOT_EN_COURS", "Mission non en cours", 409);
        }

        mission.setStatus(MissionStatus.CONTROLE);
        mission.setReturnKm(km);
        mission.setReturnEngineHours(engineHours);
        mission.setReturnFuel(fuel);
        mission = missionRepository.save(mission);

        // Update vehicle
        Vehicle vehicle = mission.getVehicle();
        vehicle.setStatus(VehicleStatus.CONTROLE);
        vehicleRepository.save(vehicle);

        // Log audit
        auditService.logEvent(AuditEventType.MISSION_RETURNED, actorId, mission);

        return mission;
    }

    // VALIDATE RETURN (conform)
    public Mission validateReturn(String missionId, String actorId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));

        if (mission.getStatus() != MissionStatus.CONTROLE) {
            throw new BusinessException("MISSION_NOT_CONTROLE", "Mission non en contrôle", 409);
        }

        mission.setStatus(MissionStatus.CLOTUREE);
        mission = missionRepository.save(mission);

        // Update vehicle and driver
        Vehicle vehicle = mission.getVehicle();
        vehicle.setStatus(VehicleStatus.DISPONIBLE);
        vehicleRepository.save(vehicle);

        Driver driver = mission.getDriver();
        driver.setStatus(DriverStatus.DISPONIBLE);
        driverRepository.save(driver);

        // Log audit
        auditService.logEvent(AuditEventType.MISSION_VALIDATED, actorId, mission);

        return mission;
    }

    // SEND TO MAINTENANCE
    public Mission sendToMaintenance(String missionId, String actorId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));

        if (mission.getStatus() != MissionStatus.CONTROLE) {
            throw new BusinessException("MISSION_NOT_CONTROLE", "Mission non en contrôle", 409);
        }

        mission.setStatus(MissionStatus.CLOTUREE);
        mission = missionRepository.save(mission);

        // Update vehicle and driver
        Vehicle vehicle = mission.getVehicle();
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        vehicleRepository.save(vehicle);

        Driver driver = mission.getDriver();
        driver.setStatus(DriverStatus.DISPONIBLE);
        driverRepository.save(driver);

        // Log audit
        auditService.logEvent(AuditEventType.MISSION_SENT_TO_MAINTENANCE, actorId, mission);

        return mission;
    }

    private String generateMissionCode() {
        long count = missionRepository.count();
        return "MS-" + String.format("%04d", count + 1);
    }
}
