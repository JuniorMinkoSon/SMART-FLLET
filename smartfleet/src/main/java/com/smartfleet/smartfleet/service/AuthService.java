package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.dto.AuthResponse;
import com.smartfleet.smartfleet.entity.AuditEventType;
import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.entity.UserRole;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.UserRepository;
import com.smartfleet.smartfleet.security.TokenStore;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
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
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("USER_EMAIL_EXISTS", "Cet email est deja utilise", 409);
        }

        User user = userRepository.save(User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .name(name)
            .role(UserRole.CONDUCTEUR)
            .enabled(true)
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
}
