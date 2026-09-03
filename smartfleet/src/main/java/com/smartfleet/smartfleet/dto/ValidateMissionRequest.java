package com.smartfleet.smartfleet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateMissionRequest {
    /** true = retour conforme (cloture), false = engin envoye en maintenance. */
    private Boolean isConform;
}
