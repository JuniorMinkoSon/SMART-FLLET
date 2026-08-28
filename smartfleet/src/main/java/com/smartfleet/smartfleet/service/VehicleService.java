package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.entity.VehicleStatus;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleService {
    private final VehicleRepository vehicleRepository;

    public Vehicle createVehicle(String code, String type, String licensePlate, Integer initialKm, Integer fuelLevel) {
        if (vehicleRepository.findByCode(code).isPresent()) {
            throw new BusinessException("VEHICLE_CODE_EXISTS", "Code engin déjà utilisé", 409);
        }

        if (vehicleRepository.findByLicensePlate(licensePlate).isPresent()) {
            throw new BusinessException("VEHICLE_PLATE_EXISTS", "Plaque d'immatriculation déjà utilisée", 409);
        }

        Vehicle vehicle = Vehicle.builder()
            .code(code)
            .type(type)
            .licensePlate(licensePlate)
            .status(VehicleStatus.DISPONIBLE)
            .initialKm(initialKm)
            .currentKm(initialKm)
            .engineHours(0)
            .fuelLevel(fuelLevel)
            .build();

        return vehicleRepository.save(vehicle);
    }

    public Vehicle getVehicleById(String id) {
        return vehicleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("VEHICLE_NOT_FOUND", "Engin non trouvé", 404));
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findByStatus(VehicleStatus.DISPONIBLE);
    }
}
