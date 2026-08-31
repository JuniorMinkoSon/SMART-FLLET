package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.entity.UserRole;
import com.smartfleet.smartfleet.exception.BusinessException;
import com.smartfleet.smartfleet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String email, String password, String name, String role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("USER_EMAIL_EXISTS", "Email déjà utilisé", 409);
        }

        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .name(name)
            .role(UserRole.valueOf(role))
            .enabled(true)
            .build();

        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
