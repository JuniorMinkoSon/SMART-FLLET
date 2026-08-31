package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.repository.*;
import com.smartfleet.smartfleet.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MissionService {
    private final MissionRepository missionRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final AuditEventRepository auditEventRepository;

    public Mission createMission(String vehicleId, String driverId, LocalDateTime startDate, LocalDateTime endDate, String site, String client, Long budget, String actorId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow(() -> new BusinessException("VEHICLE_NOT_FOUND", "Véhicule non trouvé", 404));
        Driver driver = driverRepository.findById(driverId).orElseThrow(() -> new BusinessException("DRIVER_NOT_FOUND", "Conducteur non trouvé", 404));

        Mission mission = Mission.builder()
            .code("MISS-" + System.currentTimeMillis())
            .vehicle(vehicle)
            .driver(driver)
            .startDate(startDate)
            .endDate(endDate)
            .site(site)
            .client(client)
            .budget(budget)
            .status(MissionStatus.AFFECTEE)
            .build();

        return missionRepository.save(mission);
    }

    public Optional<Mission> getMissionById(String id) {
        return missionRepository.findById(id);
    }

    private Mission getMissionByIdOrThrow(String id) {
        return missionRepository.findById(id).orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));
    }

    public List<Mission> getAllMissions() {
        return missionRepository.findAll();
    }

    public List<Mission> getDriverMissions(String userEmail) {
        return missionRepository.findAll().stream()
            .filter(m -> m.getDriver() != null && m.getDriver().getUser() != null && m.getDriver().getUser().getEmail().equals(userEmail))
            .toList();
    }

    public Mission assignDriver(String missionId, String driverId) {
        Mission mission = getMissionByIdOrThrow(missionId);
        Driver driver = driverRepository.findById(driverId).orElseThrow(() -> new BusinessException("DRIVER_NOT_FOUND", "Conducteur non trouvé", 404));
        mission.setDriver(driver);
        mission.setStatus(MissionStatus.AFFECTEE);
        return missionRepository.save(mission);
    }

    public Mission startMission(String id) {
        Mission mission = getMissionByIdOrThrow(id);
        mission.setStatus(MissionStatus.EN_COURS);
        mission.getVehicle().setStatus(VehicleStatus.EN_MISSION);
        return missionRepository.save(mission);
    }

    public Mission endMission(String id) {
        Mission mission = getMissionByIdOrThrow(id);
        mission.setStatus(MissionStatus.CONTROLE);
        mission.getVehicle().setStatus(VehicleStatus.RESERVE);
        return missionRepository.save(mission);
    }

    public Mission validateReturn(String id, String actorId) {
        Mission mission = getMissionByIdOrThrow(id);
        mission.setStatus(MissionStatus.CLOTUREE);
        mission.getVehicle().setStatus(VehicleStatus.DISPONIBLE);
        return missionRepository.save(mission);
    }
}
