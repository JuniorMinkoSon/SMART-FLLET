package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.FuelEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FuelEntryRepository extends JpaRepository<FuelEntry, String> {
    List<FuelEntry> findByMission_Id(String missionId);
}
