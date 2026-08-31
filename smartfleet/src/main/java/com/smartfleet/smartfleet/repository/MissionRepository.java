package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, String> {
    List<Mission> findByDriver_Id(String driverId);
}
