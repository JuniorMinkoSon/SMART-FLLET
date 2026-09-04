package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.Maintenance;
import com.smartfleet.smartfleet.entity.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, String> {

    List<Maintenance> findByVehicle_IdOrderByCreatedAtDesc(String vehicleId);

    List<Maintenance> findByStatusOrderByScheduledDateAsc(MaintenanceStatus status);

    /**
     * Interventions qui immobilisent encore le véhicule.
     *
     * Sert à savoir si un engin peut être remis en service : le clore une fois
     * ne suffit pas s'il en reste une autre ouverte.
     */
    List<Maintenance> findByVehicle_IdAndStatusIn(String vehicleId, List<MaintenanceStatus> statuses);
}
