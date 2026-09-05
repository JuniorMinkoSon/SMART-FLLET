package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.dto.AuthResponse;
import com.smartfleet.smartfleet.entity.AuditEventType;
import com.smartfleet.smartfleet.entity.Driver;
import com.smartfleet.smartfleet.entity.DriverStatus;
import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.entity.UserRole;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.DriverRepository;
import com.smartfleet.smartfleet.repository.UserRepository;
import com.smartfleet.smartfleet.security.TokenStore;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenStore tokenStore;
    private final AuditService auditService;

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                // Message volontairement identique au mot de passe invalide :
                // ne pas reveler quels emails existent (enumeration de comptes).
                auditService.log("ANONYMOUS", AuditEventType.LOGIN_FAILED, "User", null,
                    "Echec de connexion pour " + email);
                return new BusinessException("INVALID_CREDENTIALS", "Identifiants incorrects", 401);
            });

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new BusinessException("USER_DISABLED", "Compte desactive", 403);
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            auditService.log(user.getId(), AuditEventType.LOGIN_FAILED, "User", user.getId(),
                "Mot de passe incorrect");
            throw new BusinessException("INVALID_CREDENTIALS", "Identifiants incorrects", 401);
        }

        String token = UUID.randomUUID().toString();
        tokenStore.register(token, user);
        auditService.log(user.getId(), AuditEventType.LOGIN_SUCCESS, "User", user.getId(),
            "Connexion reussie");

        return new AuthResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), token);
    }

    /** Auto-inscription : toujours CONDUCTEUR (pas d'escalade de privileges). */
    public AuthResponse register(String email, String password, String name) {
        return register(email, password, name, null, null, null);
    }

    /**
     * Inscription d'un conducteur.
     *
     * Crée le compte et sa fiche conducteur. Le compte seul ne suffit pas : sans
     * fiche, la personne n'apparaît dans aucune liste, ne peut être affectée à
     * aucune mission, et son espace reste vide. Elle aurait un accès sans avoir
     * de travail.
     *
     * @param vehicleCategories engins que la personne est habilitée à conduire.
     *        Sans habilitation, elle ne sera proposée sur aucune affectation —
     *        c'est pourquoi le formulaire les demande.
     */
    public AuthResponse register(
        String email, String password, String name,
        String phone, String licenseType, List<String> vehicleCategories
    ) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("USER_EMAIL_EXISTS", "Cet email est deja utilise", 409);
        }

        // Le compte précède la fiche : c'est la fiche qui porte la relation
        // (Driver.user), la poser sur le compte ne créerait aucun lien — et le
        // conducteur resterait introuvable depuis sa session.
        User user = userRepository.save(User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .name(name)
            .role(UserRole.CONDUCTEUR)
            .enabled(true)
            .build());

        driverRepository.save(Driver.builder()
            .name(name)
            .email(email)
            .phone(phone == null || phone.isBlank() ? "-" : phone)
            .licenseType(licenseType)
            .status(DriverStatus.DISPONIBLE)
            .skills(toJsonArray(vehicleCategories))
            .vehicleCategories(toJsonArray(vehicleCategories))
            .user(user)
            .build());

        String token = UUID.randomUUID().toString();
        tokenStore.register(token, user);
        auditService.log(user.getId(), AuditEventType.USER_CREATED, "User", user.getId(),
            "Auto-inscription de " + email);

        return new AuthResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), token);
    }

    public void logout(String token) {
        tokenStore.revoke(token);
    }

    @Transactional(readOnly = true)
    public AuthResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Utilisateur non trouve", 404));
        return new AuthResponse(user.getId(), user.getEmail(), user.getName(), user.getRole(), null);
    }

    /** Sérialise une liste ; un tableau vide si elle est absente. */
    private String toJsonArray(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "[]";
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(values);
        } catch (Exception e) {
            return "[]";
        }
    }
}
