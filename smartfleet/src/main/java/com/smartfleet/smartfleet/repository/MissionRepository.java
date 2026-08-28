package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.entity.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MissionRepository extends JpaRepository<Mission, String> {
    Optional<Mission> findByCode(String code);

    List<Mission> findByDriverId(String driverId);

    List<Mission> findByStatus(MissionStatus status);

    @Query("SELECT m FROM Mission m WHERE m.status != 'CLOTUREE' AND m.vehicle.id = :vehicleId " +
           "AND NOT (m.endDate < :startDate OR m.startDate > :endDate)")
    List<Mission> findOverlappingVehicleMissions(
        @Param("vehicleId") String vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT m FROM Mission m WHERE m.status != 'CLOTUREE' AND m.driver.id = :driverId " +
           "AND NOT (m.endDate < :startDate OR m.startDate > :endDate)")
    List<Mission> findOverlappingDriverMissions(
        @Param("driverId") String driverId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
