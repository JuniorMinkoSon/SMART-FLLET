package com.smartfleet.smartfleet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Intervention de maintenance sur un véhicule.
 *
 * Couvre aussi bien l'entretien planifié que la réparation consécutive à un
 * contrôle critique. Les deux partagent le même cycle — planifiée, en cours,
 * terminée — et le même besoin de traçabilité du coût.
 *
 * Le coût est saisi à la clôture, pas à l'ouverture : au moment de planifier on
 * ne le connaît pas, et exiger une estimation ferait entrer des chiffres
 * inventés dans les indicateurs de flotte.
 */
@Entity
@Table(name = "maintenances", indexes = {
    @Index(name = "idx_maintenances_vehicle", columnList = "vehicle_id"),
    @Index(name = "idx_maintenances_status", columnList = "status"),
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /**
     * Contrôle à l'origine de l'intervention, le cas échéant.
     *
     * Conservé pour relier la réparation au défaut constaté : sans ce lien, on
     * sait qu'un engin a été réparé mais plus pourquoi.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id")
    private Inspection inspection;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false, length = 30)
    @Builder.Default
    private MaintenanceType type = MaintenanceType.CORRECTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.PLANIFIEE;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** Date prévue. Sert au planning d'atelier. */
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    /** Date de clôture effective. */
    @Column(name = "completed_date")
    private LocalDate completedDate;

    /** Coût réel, renseigné à la clôture. */
    @Column(name = "cost")
    private Integer cost;

    /** Atelier ou prestataire ayant réalisé l'intervention. */
    @Column(length = 255)
    private String provider;

    /** Kilométrage au moment de l'intervention, pour le suivi des échéances. */
    @Column(name = "km_reading")
    private Integer kmReading;

    /** Observations de l'atelier : pièces changées, points à surveiller. */
    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

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

    /** Vrai tant que l'intervention immobilise le véhicule. */
    public boolean isOngoing() {
        return status == MaintenanceStatus.PLANIFIEE || status == MaintenanceStatus.EN_COURS;
    }
}
