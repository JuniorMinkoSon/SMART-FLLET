package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.AuthResponse;
import com.smartfleet.smartfleet.dto.LoginRequest;
import com.smartfleet.smartfleet.dto.RegisterRequest;
import com.smartfleet.smartfleet.security.SecurityUtil;
import com.smartfleet.smartfleet.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
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
        return new ResponseEntity<>(
            authService.login(request.getEmail(), request.getPassword()), HttpStatus.OK);
    }

    /**
     * Auto-inscription. Cree toujours un CONDUCTEUR : le role demande par le
     * client est ignore, sinon n'importe qui pourrait se declarer ADMIN.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(
            authService.register(request.getEmail(), request.getPassword(), request.getName()),
            HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getUserById(securityUtil.getCurrentUserId()));
    }

    /** Invalide le token cote serveur (le TokenStore le revoque). */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            authService.logout(header.substring(7));
        }
        return ResponseEntity.noContent().build();
    }
}
