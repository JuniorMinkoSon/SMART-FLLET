package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {
    private final AuditEventRepository auditEventRepository;

    public void logEvent(String userId, String action, String entityType, String entityId) {
    }
}
