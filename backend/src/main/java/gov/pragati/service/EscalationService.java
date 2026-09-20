package gov.pragati.service;

import gov.pragati.entity.*;
import gov.pragati.repository.AlertRepository;
import gov.pragati.repository.EscalationHistoryRepository;
import gov.pragati.repository.SystemSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscalationService {

    private static final Logger log = LoggerFactory.getLogger(EscalationService.class);

    private final AlertRepository alertRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final SystemSettingRepository settingRepository;

    @Value("${app.escalation.level1-minutes:5}")
    private long defaultL1Minutes;

    @Value("${app.escalation.level2-minutes:10}")
    private long defaultL2Minutes;

    public EscalationService(AlertRepository alertRepository,
                             EscalationHistoryRepository escalationHistoryRepository,
                             NotificationService notificationService,
                             AuditService auditService,
                             SystemSettingRepository settingRepository) {
        this.alertRepository = alertRepository;
        this.escalationHistoryRepository = escalationHistoryRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.settingRepository = settingRepository;
    }

    @Transactional
    public void evaluateAutomaticEscalations() {
        long l1Minutes = getSettingLong("escalation_level1_minutes", defaultL1Minutes);
        long l2Minutes = getSettingLong("escalation_level2_minutes", defaultL2Minutes);

        List<Alert> activeAlerts = alertRepository.findByStatusNot(AlertStatus.RESOLVED);
        LocalDateTime now = LocalDateTime.now();

        for (Alert alert : activeAlerts) {
            long minutesSinceCreation = Duration.between(alert.getCreatedAt(), now).toMinutes();
            int currentLevel = alert.getEscalationLevel() != null ? alert.getEscalationLevel() : 0;

            // Check Level 0 -> Level 1 (Unacknowledged or critical unresolved)
            if (currentLevel == 0 && minutesSinceCreation >= l1Minutes && (alert.getStatus() == AlertStatus.NEW || alert.getSeverity() == AlertSeverity.CRITICAL)) {
                escalateTo(alert, 1, "MINISTRY_ADMIN", "Ministry Administrator",
                        String.format("Auto-Escalation: Alert unacknowledged after %d minutes threshold.", l1Minutes));
            }
            // Check Level 1 -> Level 2 (Unresolved past Level 2 threshold)
            else if (currentLevel == 1 && minutesSinceCreation >= l2Minutes && alert.getStatus() != AlertStatus.RESOLVED) {
                escalateTo(alert, 2, "SUPER_ADMIN", "Apex Project Monitoring Committee",
                        String.format("Auto-Escalation: Alert unresolved after %d minutes threshold.", l2Minutes));
            }
        }
    }

    private void escalateTo(Alert alert, int targetLevel, String targetRole, String targetAuthority, String reason) {
        int prevLevel = alert.getEscalationLevel() != null ? alert.getEscalationLevel() : 0;
        alert.setEscalationLevel(targetLevel);
        alert.setStatus(AlertStatus.ESCALATED);
        alert.setLastEscalatedAt(LocalDateTime.now());
        alertRepository.save(alert);

        EscalationHistory history = new EscalationHistory(alert, prevLevel, targetLevel, reason, targetRole, targetAuthority);
        escalationHistoryRepository.save(history);

        notificationService.sendNotification(
                targetRole,
                String.format("ESCALATION LEVEL %d: %s", targetLevel, alert.getProject().getProjectName()),
                String.format("Alert %s on project %s escalated to %s. %s", alert.getAlertType(), alert.getProject().getProjectCode(), targetAuthority, reason),
                "ESCALATION",
                alert.getProject().getId(),
                "CRITICAL"
        );

        auditService.logAction(AuditAction.ESCALATE_ALERT, "Alert", alert.getId(), alert.getAlertType(),
                "Level " + prevLevel, "Level " + targetLevel, "Auto-escalated to " + targetAuthority);

        log.info("Alert ID {} on Project {} escalated to Level {}", alert.getId(), alert.getProject().getProjectCode(), targetLevel);
    }

    private long getSettingLong(String key, long defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        return Long.parseLong(s.getSettingValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
