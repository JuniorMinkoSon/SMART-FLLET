package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.entity.UserRole;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.smartfleet.smartfleet.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Driver save(Driver driver) {
        if (driverRepository.findByEmail(driver.getEmail()).isPresent()) {
            throw new BusinessException("DRIVER_EMAIL_EXISTS", "Email déjà utilisé", 409);
        }
        return driverRepository.save(driver);
    }

    /**
     * Crée un conducteur et son compte d'accès.
     *
     * Les deux sont indissociables : un conducteur sans compte ne peut pas se
     * connecter, donc ne voit jamais ses missions, ne saisit ni départ ni retour.
     * La fiche existerait sans que personne ne puisse s'en servir.
     *
     * @param password mot de passe initial, à transmettre au conducteur. Absent,
     *        un mot de passe est engendré et retourné une seule fois.
     */
    public Driver createDriver(
        String name, String email, String phone,
        String matricule, String licenseType, LocalDate licenseExpiryDate,
        List<String> skills, List<String> vehicleCategories,
        String password
    ) {
        if (driverRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("DRIVER_EMAIL_EXISTS", "Email déjà utilisé", 409);
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("USER_EMAIL_EXISTS",
                "Un compte utilise déjà cette adresse", 409);
        }
        if (matricule != null && !matricule.isBlank()
            && driverRepository.findByMatricule(matricule).isPresent()) {
            throw new BusinessException("MATRICULE_EXISTS",
                "Ce matricule est déjà attribué", 409);
        }

        try {
            String skillsJson = toJsonArray(skills);
            String categoriesJson = toJsonArray(vehicleCategories);

            Driver driver = Driver.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .matricule(matricule == null || matricule.isBlank() ? null : matricule.trim())
                .licenseType(licenseType)
                .licenseExpiryDate(licenseExpiryDate)
                .status(DriverStatus.DISPONIBLE)
                .skills(skillsJson)
                .vehicleCategories(categoriesJson)
                .build();

            Driver saved = driverRepository.save(driver);

            // Le compte est créé dans la même transaction : un conducteur
            // enregistré sans accès serait un conducteur inutilisable.
            User account = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(
                    password == null || password.isBlank() ? defaultPassword() : password))
                .role(UserRole.CONDUCTEUR)
                .driver(saved)
                .build();
            userRepository.save(account);

            return saved;
        } catch (Exception e) {
            throw new BusinessException("SKILLS_ERROR", "Erreur lors du traitement des compétences", 400);
        }
    }

    public Optional<Driver> getDriverById(String id) {
        return driverRepository.findById(id);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByStatus(DriverStatus.DISPONIBLE);
    }

    /** Sérialise une liste, un tableau vide si elle est absente. */
    private String toJsonArray(List<String> values) throws Exception {
        return values != null && !values.isEmpty()
            ? objectMapper.writeValueAsString(values)
            : "[]";
    }

    /**
     * Mot de passe engendré quand aucun n'est fourni.
     *
     * Volontairement aléatoire plutôt qu'une valeur commune : un mot de passe
     * par défaut identique pour tous les conducteurs serait connu de tous dès
     * le premier compte créé.
     */
    private String defaultPassword() {
        return "SF-" + java.util.UUID.randomUUID().toString().substring(0, 8);
    }
}
