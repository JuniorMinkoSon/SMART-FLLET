package com.smartfleet.smartfleet.dto;

import com.smartfleet.smartfleet.entity.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private DriverStatus status;
    private Set<String> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
