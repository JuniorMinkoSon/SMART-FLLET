package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.AuthResponse;
import com.smartfleet.smartfleet.dto.LoginRequest;
import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.security.SecurityUtil;
import com.smartfleet.smartfleet.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final SecurityUtil securityUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request.getEmail(), request.getPassword());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        String userId = securityUtil.getCurrentUserId();
        AuthResponse response = authService.getUserById(userId);
        return ResponseEntity.ok(response);
    }
}
