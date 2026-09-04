package com.smartfleet.smartfleet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Contrôle d'un véhicule.
 *
 * Un contrôle constate l'état d'un engin à un instant donné : avant un départ,
 * au retour d'une mission, ou lors d'une vérification périodique. Il est
 * conservé parce qu'il engage celui qui l'a fait — la question posée après un
 * incident est toujours « qui a vérifié quoi, et quand ».
 *
 * Le rattachement à une mission est facultatif : un contrôle quotidien au dépôt
 * n'en concerne aucune, et l'imposer empêcherait de le saisir.
 */
@Entity
@Table(name = "inspections", indexes = {
    @Index(name = "idx_inspections_vehicle", columnList = "vehicle_id"),
    @Index(name = "idx_inspections_mission", columnList = "mission_id"),
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    /** Mission concernée, s'il s'agit d'un contrôle de départ ou de retour. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id")
    private Mission mission;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", nullable = false, length = 30)
    @Builder.Default
    private InspectionType type = InspectionType.PERIODIQUE;

    // Les quatre points de la liste de contrôle.
    //
    // Des colonnes distinctes plutôt qu'un document JSON : ce sont des critères
    // stables qu'on veut pouvoir interroger — « combien de véhicules ont des
    // freins signalés ce mois-ci » doit rester une requête simple.

    @Column(name = "tyres_ok", nullable = false)
    @Builder.Default
    private Boolean tyresOk = false;

    @Column(name = "brakes_ok", nullable = false)
    @Builder.Default
    private Boolean brakesOk = false;

    @Column(name = "lights_ok", nullable = false)
    @Builder.Default
    private Boolean lightsOk = false;

    @Column(name = "bodywork_ok", nullable = false)
    @Builder.Default
    private Boolean bodyworkOk = false;

    /**
     * Verdict du contrôle.
     *
     * Déduit des points vérifiés à la création, mais stocké : le contrôleur peut
     * juger critique un défaut qui, pris isolément, ne le paraîtrait pas, et son
     * jugement doit primer sur le calcul.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InspectionResult result = InspectionResult.OK;

    /** Description de l'anomalie constatée. */
    @Column(columnDefinition = "TEXT")
    private String anomaly;

    /** Relevé du compteur au moment du contrôle. */
    @Column(name = "km_reading")
    private Integer kmReading;

    /** Auteur du contrôle : c'est lui qui engage sa responsabilité. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inspector_id")
    private User inspector;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (result == null) {
            result = InspectionResult.OK;
        }
    }

    /** Vrai si les quatre points sont conformes. */
    public boolean allPointsOk() {
        return Boolean.TRUE.equals(tyresOk)
            && Boolean.TRUE.equals(brakesOk)
            && Boolean.TRUE.equals(lightsOk)
            && Boolean.TRUE.equals(bodyworkOk);
    }
}
