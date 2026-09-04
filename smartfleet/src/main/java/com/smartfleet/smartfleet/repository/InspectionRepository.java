package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.Inspection;
import com.smartfleet.smartfleet.entity.InspectionResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionRepository extends JpaRepository<Inspection, String> {

    List<Inspection> findByVehicle_IdOrderByCreatedAtDesc(String vehicleId);

    List<Inspection> findByMission_IdOrderByCreatedAtDesc(String missionId);

    /** Contrôles bloquants, pour le tableau de bord et les alertes. */
    List<Inspection> findByResultOrderByCreatedAtDesc(InspectionResult result);
}
