package com.smartfleet.smartfleet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String code;

    @Column(nullable = false)
    @NotBlank
    private String type;

    @Column(name = "license_plate", unique = true, nullable = false)
    @NotBlank
    private String licensePlate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status = VehicleStatus.DISPONIBLE;

    @Column(nullable = false)
    private Integer initialKm = 0;

    @Column(nullable = false)
    private Integer currentKm = 0;

    @Column(nullable = false)
    private Integer engineHours = 0;

    @Column(nullable = false)
    private Integer fuelLevel = 100;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
