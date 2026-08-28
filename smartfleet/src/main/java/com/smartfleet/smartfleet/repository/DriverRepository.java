package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, String> {
    Optional<Driver> findByEmail(String email);
    List<Driver> findByStatus(DriverStatus status);
}
