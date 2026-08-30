package com.smartfleet.smartfleet.repository;

import com.smartfleet.smartfleet.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditEventRepository extends JpaRepository<AuditEvent, String> {
    List<AuditEvent> findByMissionId(String missionId);
    List<AuditEvent> findByActorId(String actorId);
}
