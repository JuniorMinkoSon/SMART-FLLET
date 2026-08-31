package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.*;
import com.smartfleet.smartfleet.repository.*;
import com.smartfleet.smartfleet.exception.BusinessException;
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

    public FuelEntry recordFuel(String missionId, String driverId, Double quantity, Integer cost, String station, String receiptUrl, String actorId) {
        Mission mission = missionRepository.findById(missionId).orElseThrow(() -> new BusinessException("MISSION_NOT_FOUND", "Mission non trouvée", 404));

        FuelEntry entry = FuelEntry.builder()
            .mission(mission)
            .quantity(quantity)
            .cost(cost)
            .station(station)
            .receiptUrl(receiptUrl)
            .build();

        return fuelEntryRepository.save(entry);
    }

    public List<FuelEntry> getFuelEntriesByMission(String missionId) {
        return fuelEntryRepository.findByMission_Id(missionId);
    }
}
