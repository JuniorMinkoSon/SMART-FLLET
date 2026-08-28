package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    Optional<Vehicle> findByCode(String code);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    List<Vehicle> findByStatus(VehicleStatus status);
}
