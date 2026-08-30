package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.FuelEntry;
import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.FuelEntryRepository;
import com.smartfleet.smartfleet.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FuelEntryService {
    private final FuelEntryRepository fuelEntryRepository;
    private final MissionRepository missionRepository;
    private final AuditService auditService;

    public FuelEntry recordFuel(String missionId, String driverId, Double quantity, Integer cost, String station, String receiptUrl, String actorId) {
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));

        if (!mission.getDriver().getId().equals(driverId)) {
            throw new BusinessException("FUEL_DRIVER_MISMATCH", "Le conducteur n'est pas assigné à cette mission", 403);
        }

        FuelEntry fuelEntry = FuelEntry.builder()
            .mission(mission)
            .driver(mission.getDriver())
            .quantity(quantity)
            .cost(cost)
            .station(station)
            .receiptUrl(receiptUrl)
            .build();

        fuelEntry = fuelEntryRepository.save(fuelEntry);
        auditService.logFuelEvent(actorId, fuelEntry);

        return fuelEntry;
    }

    public List<FuelEntry> getFuelEntriesByMission(String missionId) {
        return fuelEntryRepository.findByMissionId(missionId);
    }

    public List<FuelEntry> getFuelEntriesByDriver(String driverId) {
        return fuelEntryRepository.findByDriverId(driverId);
    }
}
