package com.smartfleet.smartfleet.config;

import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.entity.UserRole;
import com.smartfleet.smartfleet.entity.Vehicle;
import com.smartfleet.smartfleet.entity.VehicleCondition;
import com.smartfleet.smartfleet.entity.VehicleOwnership;
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

        // Comptes de pilotage.
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

        // Conducteurs.
        //
        // Chacun avec sa fiche, son compte et ses habilitations. Les
        // habilitations diffèrent d'un conducteur à l'autre : c'est ce qui rend
        // le choix d'un opérateur signifiant plutôt qu'indifférent, et ce qui
        // permet de constater qu'un engin ne peut pas être confié à n'importe qui.
        seedDriver("Moussa Koné", "conducteur@smartfleet.com", "conduct123",
            "+225 07 01 02 03", "MAT-0001", "C", "[\"Camion\", \"Pelle\"]");

        seedDriver("Jean Kouassi", "jean@smartfleet.com", "jean123",
            "+225 07 05 06 07", "MAT-0002", "B", "[\"Camion\"]");

        seedDriver("Awa Traoré", "awa@smartfleet.com", "awa123",
            "+225 05 11 22 33", "MAT-0003", "CE",
            "[\"Pelle\", \"Tractopelle\", \"Chargeuse\"]");

        seedDriver("Bamba Sekou", "bamba@smartfleet.com", "bamba123",
            "+225 01 44 55 66", "MAT-0004", "CE",
            "[\"Niveleuse\", \"Compacteur\", \"Chargeuse\"]");

        seedDriver("Fatou Diallo", "fatou@smartfleet.com", "fatou123",
            "+225 07 77 88 99", "MAT-0005", "C",
            "[\"Chariot élévateur\", \"Camion\"]");

        // Flotte de démonstration.
        //
        // Huit engins, un par visuel livré avec l'application, et des états
        // variés : une flotte entièrement disponible ne montre rien, une flotte
        // entièrement occupée empêche de créer la moindre mission. Il faut donc
        // de quoi affecter tout en ayant des cas à traiter.
        seedVehicle("ENG-001", "Camion", "Camion benne CAT 797F", "CI-4521-AB",
            VehicleStatus.DISPONIBLE, VehicleCondition.BON, 52340, 2100, 80,
            "Abidjan", VehicleOwnership.INTERNE, null);

        seedVehicle("ENG-002", "Pelle", "Pelle hydraulique Sinomach", "CI-8830-CD",
            VehicleStatus.DISPONIBLE, VehicleCondition.BON, 12480, 1450, 65,
            "Abidjan", VehicleOwnership.INTERNE, null);

        seedVehicle("ENG-003", "Tractopelle", "Tractopelle Komatsu", "CI-2214-EF",
            VehicleStatus.DISPONIBLE, VehicleCondition.BON, 31200, 1870, 72,
            "Bouaké", VehicleOwnership.INTERNE, null);

        seedVehicle("ENG-004", "Chargeuse", "Chargeuse sur chenilles CAT 973K", "CI-6607-GH",
            VehicleStatus.DISPONIBLE, VehicleCondition.MOYEN, 44100, 2450, 55,
            "Bouaké", VehicleOwnership.INTERNE, null);

        seedVehicle("ENG-005", "Chargeuse", "Chargeuse sur pneus CAT", "CI-1198-IJ",
            VehicleStatus.DISPONIBLE, VehicleCondition.BON, 18760, 990, 88,
            "San Pedro", VehicleOwnership.INTERNE, null);

        seedVehicle("ENG-006", "Niveleuse", "Niveleuse John Deere", "CI-7743-KL",
            VehicleStatus.DISPONIBLE, VehicleCondition.BON, 26400, 1320, 60,
            "San Pedro", VehicleOwnership.INTERNE, null);

        // Deux engins loués : le parc propre et le parc mis à disposition ne se
        // pilotent pas de la même façon, l'écart doit être visible dès la
        // première ouverture.
        seedVehicle("ENG-007", "Compacteur", "Compacteur Bomag", "CI-3352-MN",
            VehicleStatus.DISPONIBLE, VehicleCondition.BON, 9800, 640, 75,
            "Abidjan", VehicleOwnership.EXTERNE, "Loca-Engins CI");

        // Un engin bas en carburant : de quoi voir une alerte dès l'ouverture.
        seedVehicle("ENG-008", "Chariot élévateur", "Chariot élévateur JAC", "CI-9021-OP",
            VehicleStatus.DISPONIBLE, VehicleCondition.MOYEN, 5400, 410, 18,
            "Abidjan", VehicleOwnership.EXTERNE, "Loca-Engins CI");
    }

    /**
     * Crée un conducteur et son compte d'accès.
     *
     * Les deux vont ensemble : une fiche sans compte donne un conducteur qui ne
     * peut pas se connecter, donc ne voit jamais ses missions.
     */
    private void seedDriver(String name, String email, String password, String phone,
                            String matricule, String license, String categories) {
        // Le compte d'abord : c'est la fiche qui porte la relation
        // (Driver.user), et non l'inverse.
        User account = userRepository.save(User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .name(name)
            .role(UserRole.CONDUCTEUR)
            .enabled(true)
            .build());

        driverRepository.save(Driver.builder()
            .name(name)
            .email(email)
            .phone(phone)
            .matricule(matricule)
            .licenseType(license)
            .status(DriverStatus.DISPONIBLE)
            .skills(categories)
            .vehicleCategories(categories)
            .user(account)
            .build());
    }

    private void seedVehicle(String code, String type, String name, String plate,
                             VehicleStatus status, VehicleCondition condition,
                             int km, int hours, int fuel,
                             String site, VehicleOwnership ownership, String owner) {
        vehicleRepository.save(Vehicle.builder()
            .code(code)
            .type(type)
            .name(name)
            .licensePlate(plate)
            .status(status)
            .condition(condition)
            .initialKm(km)
            .currentKm(km)
            .engineHours(hours)
            .fuelLevel(fuel)
            .site(site)
            .ownership(ownership)
            .ownerCompany(owner)
            .build());
    }
}
