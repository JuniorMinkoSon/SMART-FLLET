package com.smartfleet.smartfleet.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @Column(nullable = false)
    @Positive
    private Double quantity;

    @Column(nullable = false)
    @Positive
    private Integer cost;

    private String station;

    private String receiptUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
