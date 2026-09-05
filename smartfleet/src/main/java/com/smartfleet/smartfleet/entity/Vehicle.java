package com.smartfleet.smartfleet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
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

    /**
     * Désignation d'usage, distincte du code d'inventaire.
     *
     * Sur le terrain un engin s'appelle « Pelle Komatsu 210 », pas « VH-0042 » :
     * le code sert au suivi, le nom sert à se comprendre.
     */
    @Column(name = "name")
    private String name;

    /**
     * État général de l'engin, indépendant de sa disponibilité du moment.
     *
     * La colonne reste nullable : une contrainte NOT NULL empêcherait d'ajouter
     * le champ à une flotte déjà enregistrée. La valeur par défaut est garantie
     * par le builder et à la persistance, et une valeur absente est présentée
     * comme « Bon » par le DTO.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_condition")
    @Builder.Default
    private VehicleCondition condition = VehicleCondition.BON;

    /** Site d'affectation. Sert au filtrage et au regroupement de la flotte. */
    @Column(name = "site")
    private String site;

    /**
     * Provenance de l'engin.
     *
     * Un engin loué ne se pilote pas comme un engin possédé : son coût est un
     * loyer, son entretien incombe au prestataire, et il quitte la flotte à
     * l'échéance. Les confondre fausse le coût de possession du parc propre.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "ownership", length = 20)
    @Builder.Default
    private VehicleOwnership ownership = VehicleOwnership.INTERNE;

    /** Prestataire propriétaire, pour un engin externe. */
    @Column(name = "owner_company", length = 255)
    private String ownerCompany;

    /**
     * Fin de mise à disposition d'un engin externe.
     *
     * Passée cette date, l'engin ne devrait plus être affecté : c'est ce qui
     * permet de le signaler avant qu'une mission ne soit planifiée dessus.
     */
    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    /**
     * Conducteur affecté au véhicule.
     *
     * À ne pas confondre avec le conducteur d'une mission, porté par
     * {@link Mission} : celui-ci change à chaque course, l'affectation ici est
     * durable. Un véhicule sans conducteur affecté reste parfaitement valide,
     * la relation est donc facultative.
     *
     * Chargement paresseux : la liste de flotte n'a pas besoin du conducteur
     * complet, et un chargement systématique multiplierait les requêtes.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_driver_id")
    private Driver assignedDriver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.DISPONIBLE;

    @Column(nullable = false)
    @Builder.Default
    private Integer initialKm = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentKm = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer engineHours = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer fuelLevel = 100;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (condition == null) {
            condition = VehicleCondition.BON;
        }
        if (ownership == null) {
            ownership = VehicleOwnership.INTERNE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
