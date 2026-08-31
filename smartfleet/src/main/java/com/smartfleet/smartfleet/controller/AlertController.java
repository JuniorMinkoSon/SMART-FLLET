package com.smartfleet.smartfleet.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<Object>> getAllAlerts() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CONDUCTEUR')")
    public ResponseEntity<List<Object>> getMyAlerts() {
        return ResponseEntity.ok(List.of());
    }
}
