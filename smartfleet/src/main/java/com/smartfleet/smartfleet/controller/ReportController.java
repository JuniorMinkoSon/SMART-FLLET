package com.smartfleet.smartfleet.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<List<Object>> getReports() {
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/export/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<byte[]> exportCsv() {
        return ResponseEntity.ok(new byte[0]);
    }

    @PostMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<byte[]> exportPdf() {
        return ResponseEntity.ok(new byte[0]);
    }
}
