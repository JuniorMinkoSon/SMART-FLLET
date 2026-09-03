package com.smartfleet.smartfleet.exception;

import lombok.Getter;

import java.util.List;

/**
 * Conflit d'affectation (anti-overbooking). Porte la liste des missions en
 * conflit et des engins alternatifs disponibles pour que le frontend puisse
 * proposer une correction à l'utilisateur.
 */
@Getter
public class ConflictException extends RuntimeException {
    private final String code;
    private final List<ConflictDetail> conflicts;
    private final List<AlternativeVehicle> alternatives;

    public ConflictException(String code, String message,
                             List<ConflictDetail> conflicts,
                             List<AlternativeVehicle> alternatives) {
        super(message);
        this.code = code;
        this.conflicts = conflicts;
        this.alternatives = alternatives;
    }

    public record ConflictDetail(String missionId, String missionCode, String site,
                                 String startDate, String endDate, String status) {}

    public record AlternativeVehicle(String id, String code, String type, String status) {}
}
