package gov.pragati.repository;

import gov.pragati.entity.Alert;
import gov.pragati.entity.AlertSeverity;
import gov.pragati.entity.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByProjectId(Long projectId);
    List<Alert> findByStatusNot(AlertStatus status);
    List<Alert> findByProjectIdAndStatusNot(Long projectId, AlertStatus status);
    List<Alert> findBySeverity(AlertSeverity severity);
    List<Alert> findByEscalationLevelGreaterThan(Integer level);
    long countByStatusNot(AlertStatus status);
    long countBySeverityAndStatusNot(AlertSeverity severity, AlertStatus status);

    @Query("SELECT a FROM Alert a WHERE a.status IN ('NEW', 'ACKNOWLEDGED', 'ESCALATED') ORDER BY a.createdAt DESC")
    List<Alert> findActiveAlerts();
}
