package com.smartfleet.smartfleet.config;

import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.entity.UserRole;
import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.entity.VehicleStatus;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.UserRepository;
import com.smartfleet.smartfleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        driverRepository.save(Driver.builder()
            .name("Moussa Koné")
            .email("conducteur@smartfleet.com")
            .phone("+2250701020304")
            .status(DriverStatus.DISPONIBLE)
            .skills("[\"Camion\", \"Pelle\"]")
            .licenseType("C")
            .vehicleCategories("[\"Camion\", \"Pelle\"]")
            .build());

        driverRepository.save(Driver.builder()
            .name("Jean Kouassi")
            .email("jean@smartfleet.com")
            .phone("+2250705060708")
            .status(DriverStatus.DISPONIBLE)
            .skills("[\"Camion\"]")
            .licenseType("B")
            .vehicleCategories("[\"Camion\"]")
            .build());

        userRepository.save(User.builder()
            .email("admin@smartfleet.com")
            .password(passwordEncoder.encode("admin123"))
            .name("Administrateur")
            .role(UserRole.ADMIN)
            .enabled(true)
            .build());

        userRepository.save(User.builder()
            .email("gestion@smartfleet.com")
            .password(passwordEncoder.encode("gestion123"))
            .name("Gestionnaire de flotte")
            .role(UserRole.GESTIONNAIRE)
            .enabled(true)
            .build());

        userRepository.save(User.builder()
            .email("conducteur@smartfleet.com")
            .password(passwordEncoder.encode("conduct123"))
            .name("Moussa Koné")
            .role(UserRole.CONDUCTEUR)
            .enabled(true)
            .build());

        vehicleRepository.save(Vehicle.builder()
            .code("ENG-001")
            .type("Camion")
            .licensePlate("CI-4521-AB")
            .status(VehicleStatus.DISPONIBLE)
            .initialKm(52000)
            .currentKm(52340)
            .engineHours(2100)
            .fuelLevel(80)
            .build());

        vehicleRepository.save(Vehicle.builder()
            .code("ENG-002")
            .type("Pelle")
            .licensePlate("CI-8830-CD")
            .status(VehicleStatus.DISPONIBLE)
            .initialKm(12000)
            .currentKm(12480)
            .engineHours(1450)
            .fuelLevel(65)
            .build());
    }
}
