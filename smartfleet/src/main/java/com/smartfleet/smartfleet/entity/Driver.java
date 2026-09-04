package com.smartfleet.smartfleet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "drivers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    @NotBlank
    private String name;

    /**
     * Matricule du conducteur dans l'entreprise.
     *
     * Donnée métier propre, et non une dérivation de l'identifiant technique :
     * il figure sur les documents de mission et les feuilles de route, doit
     * pouvoir être recherché tel quel, et suit le salarié indépendamment de la
     * façon dont la base génère ses clés.
     *
     * Facultatif pour ne pas bloquer les enregistrements existants, mais unique :
     * deux conducteurs ne partagent jamais un matricule.
     */
    @Column(name = "matricule", unique = true)
    private String matricule;

    /**
     * Échéance de validité du permis.
     *
     * Conditionne l'affectation : un conducteur dont le permis a expiré ne peut
     * pas prendre de mission, et l'échéance doit être connue assez tôt pour
     * organiser le renouvellement. Sans cette date, l'expiration ne se découvre
     * qu'au contrôle routier.
     *
     * Facultative : les fiches existantes ne la portent pas encore, et un
     * conducteur sans échéance renseignée reste exploitable — c'est un défaut de
     * saisie à signaler, pas un blocage.
     */
    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate;

    @Column(unique = true, nullable = false)
    @NotBlank
    @Email
    private String email;

    @Column(nullable = false)
    @NotBlank
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DriverStatus status = DriverStatus.DISPONIBLE;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(columnDefinition = "JSON")
    private String skills;

    @Column(nullable = false)
    @NotBlank
    private String licenseType;

    @Column(columnDefinition = "JSON")
    private String vehicleCategories;

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
