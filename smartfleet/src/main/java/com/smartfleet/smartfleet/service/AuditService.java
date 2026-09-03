package com.smartfleet.smartfleet.service;

import com.smartfleet.smartfleet.entity.AuditEvent;
import com.smartfleet.smartfleet.entity.AuditEventType;
import com.smartfleet.smartfleet.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Journal d'audit. Chaque action metier significative est tracee avec son
 * auteur, afin d'alimenter l'ecran Audit de l'ADMIN et la timeline des missions.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public AuditEvent log(String actorId, AuditEventType type,
                          String entityType, String entityId, String details) {
        AuditEvent event = AuditEvent.builder()
            .actorId(actorId == null ? "SYSTEM" : actorId)
            .eventType(type)
            .entityType(entityType)
            .entityId(entityId)
            .missionId("Mission".equals(entityType) ? entityId : null)
            .details(details)
            .build();
        return auditEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> findAll() {
        return auditEventRepository.findAll().stream()
            .sorted(Comparator.comparing(AuditEvent::getCreatedAt).reversed())
            .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> findByMission(String missionId) {
        return auditEventRepository.findByMissionId(missionId).stream()
            .sorted(Comparator.comparing(AuditEvent::getCreatedAt))
            .toList();
    }
}
