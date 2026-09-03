package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Vue API d'un utilisateur. N'expose JAMAIS le hash du mot de passe
 * (l'entite User etait serialisee telle quelle auparavant).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String email;
    private String name;
    private UserRole role;
    private Boolean enabled;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getName(),
            u.getRole(), u.getEnabled(), u.getCreatedAt());
    }
}
