package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.Mission;
import com.smartfleet.smartfleet.entity.MissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, String> {

    List<Mission> findByDriver_Id(String driverId);

    List<Mission> findByStatus(MissionStatus status);

    /**
     * ANTI-OVERBOOKING — missions d'un engin qui chevauchent la période [start, end].
     * Deux périodes se chevauchent si  start <= autreFin  ET  end >= autreDébut.
     * Les missions clôturées et la mission éventuellement en cours de modification
     * ({@code excludedId}) sont ignorées.
     */
    @Query("""
        SELECT m FROM Mission m
        WHERE m.vehicle.id = :vehicleId
          AND m.status <> com.smartfleet.smartfleet.entity.MissionStatus.CLOTUREE
          AND (:excludedId IS NULL OR m.id <> :excludedId)
          AND m.startDate <= :end
          AND m.endDate >= :start
        """)
    List<Mission> findVehicleOverlaps(@Param("vehicleId") String vehicleId,
                                      @Param("start") LocalDateTime start,
                                      @Param("end") LocalDateTime end,
                                      @Param("excludedId") String excludedId);

    /** ANTI-OVERBOOKING — même règle pour le conducteur. */
    @Query("""
        SELECT m FROM Mission m
        WHERE m.driver.id = :driverId
          AND m.status <> com.smartfleet.smartfleet.entity.MissionStatus.CLOTUREE
          AND (:excludedId IS NULL OR m.id <> :excludedId)
          AND m.startDate <= :end
          AND m.endDate >= :start
        """)
    List<Mission> findDriverOverlaps(@Param("driverId") String driverId,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end,
                                     @Param("excludedId") String excludedId);

    /** Ids des engins occupés sur la période — sert aux suggestions d'alternatives. */
    @Query("""
        SELECT DISTINCT m.vehicle.id FROM Mission m
        WHERE m.status <> com.smartfleet.smartfleet.entity.MissionStatus.CLOTUREE
          AND m.startDate <= :end
          AND m.endDate >= :start
        """)
    List<String> findBusyVehicleIds(@Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);
}
