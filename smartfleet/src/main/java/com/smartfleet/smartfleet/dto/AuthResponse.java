package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;
    private String email;
    private String name;
    private UserRole role;
    private String token;
}
