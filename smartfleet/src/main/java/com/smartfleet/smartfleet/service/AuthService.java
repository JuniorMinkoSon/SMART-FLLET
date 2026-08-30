package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.dto.AuthResponse;
import com.smartfleet.smartfleet.entity.User;
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

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Utilisateur non trouvé", 401));

        if (!user.getEnabled()) {
            throw new BusinessException("USER_DISABLED", "Compte désactivé", 403);
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("INVALID_PASSWORD", "Mot de passe incorrect", 401);
        }

        String token = UUID.randomUUID().toString();
        tokenStore.register(token, user);

        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole(),
            token
        );
    }

    public AuthResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Utilisateur non trouvé", 404));

        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole(),
            null
        );
    }
}
