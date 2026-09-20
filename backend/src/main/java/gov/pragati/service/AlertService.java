package gov.pragati.service;

import gov.pragati.dto.AlertDTOs;
import gov.pragati.entity.*;
import gov.pragati.exception.ResourceNotFoundException;
import gov.pragati.repository.AlertRepository;
import gov.pragati.repository.EscalationHistoryRepository;
import gov.pragati.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AlertService(AlertRepository alertRepository,
                        EscalationHistoryRepository escalationHistoryRepository,
                        ProjectRepository projectRepository,
                        NotificationService notificationService,
                        AuditService auditService) {
        this.alertRepository = alertRepository;
        this.escalationHistoryRepository = escalationHistoryRepository;
        this.projectRepository = projectRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public List<AlertDTOs.AlertDTO> getAllAlerts(String status, String severity, Long projectId) {
        List<Alert> list;
        if (projectId != null) {
            list = alertRepository.findByProjectId(projectId);
        } else if ("active".equalsIgnoreCase(status)) {
            list = alertRepository.findActiveAlerts();
        } else {
            list = alertRepository.findAll();
        }

        if (severity != null && !severity.isBlank()) {
            list = list.stream()
                    .filter(a -> a.getSeverity().name().equalsIgnoreCase(severity))
                    .collect(Collectors.toList());
        }

        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AlertDTOs.AlertDTO getAlertById(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));
        return toDTO(alert);
    }

    public void checkAndGenerateAlerts(Project project, List<Anomaly> anomalies) {
        String assignedOfficer = project.getProjectManager() != null ? project.getProjectManager() : "Project In-charge";

        // 1. SPI alert
        if (project.getSpi() != null && project.getSpi() < 0.75) {
            createAlertIfNotExists(project, "SPI_CRITICAL_BREACH", AlertSeverity.CRITICAL,
                    String.format("Critical schedule breach: SPI collapsed to %.2f on %s", project.getSpi(), project.getProjectName()),
                    assignedOfficer);
        } else if (project.getSpi() != null && project.getSpi() < 0.85) {
            createAlertIfNotExists(project, "SPI_WARNING", AlertSeverity.HIGH,
                    String.format("Schedule slippage detected: SPI is %.2f on %s", project.getSpi(), project.getProjectName()),
                    assignedOfficer);
        }

        // 2. CPI alert
        if (project.getCpi() != null && project.getCpi() < 0.75) {
            createAlertIfNotExists(project, "CPI_CRITICAL_BREACH", AlertSeverity.CRITICAL,
                    String.format("Critical cost overrun: CPI fell to %.2f on %s", project.getCpi(), project.getProjectName()),
                    assignedOfficer);
        }

        // 3. Risk Level alert
        if ("CRITICAL".equalsIgnoreCase(project.getRiskLevel())) {
            createAlertIfNotExists(project, "PROJECT_CRITICAL_RISK", AlertSeverity.CRITICAL,
                    String.format("Project %s is under CRITICAL risk status (Health Score: %d/100)", project.getProjectCode(), project.getHealthScore()),
                    assignedOfficer);
        } else if ("HIGH".equalsIgnoreCase(project.getRiskLevel())) {
            createAlertIfNotExists(project, "PROJECT_HIGH_RISK", AlertSeverity.HIGH,
                    String.format("Project %s has escalated to HIGH risk classification", project.getProjectCode()),
                    assignedOfficer);
        }

        // 4. Critical Anomaly alerts
        if (anomalies != null) {
            for (Anomaly a : anomalies) {
                if (a.getSeverity() == AnomalySeverity.CRITICAL || a.getSeverity() == AnomalySeverity.HIGH) {
                    createAlertIfNotExists(project, "ANOMALY_" + a.getAnomalyType(),
                            a.getSeverity() == AnomalySeverity.CRITICAL ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
                            a.getDescription(),
                            assignedOfficer);
                }
            }
        }
    }

    private void createAlertIfNotExists(Project project, String alertType, AlertSeverity severity, String message, String assignedTo) {
        List<Alert> existing = alertRepository.findByProjectIdAndStatusNot(project.getId(), AlertStatus.RESOLVED);
        boolean exists = existing.stream().anyMatch(a -> a.getAlertType().equals(alertType));
        if (!exists) {
            Alert alert = new Alert(project, alertType, severity, message, assignedTo);
            Alert saved = alertRepository.save(alert);

            notificationService.sendNotification(
                    assignedTo,
                    "New Alert: " + alertType,
                    message,
                    "ALERT",
                    project.getId(),
                    severity.name()
            );

            auditService.logAction(AuditAction.CREATE_ALERT, "Alert", saved.getId(), alertType,
                    null, severity.name(), "Generated automated alert: " + message);
        }
    }

    @Transactional
    public AlertDTOs.AlertDTO acknowledgeAlert(Long id, String userName) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));

        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(userName);
        Alert saved = alertRepository.save(alert);

        auditService.logAction(AuditAction.ACKNOWLEDGE_ALERT, "Alert", alert.getId(), alert.getAlertType(),
                "NEW", "ACKNOWLEDGED", "Alert acknowledged by " + userName);

        return toDTO(saved);
    }

    @Transactional
    public AlertDTOs.AlertDTO resolveAlert(Long id, String userName, String resolutionNotes) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(userName);
        alert.setResolutionNotes(resolutionNotes);
        Alert saved = alertRepository.save(alert);

        auditService.logAction(AuditAction.RESOLVE_ISSUE, "Alert", alert.getId(), alert.getAlertType(),
                "ACKNOWLEDGED", "RESOLVED", "Alert resolved: " + resolutionNotes);

        return toDTO(saved);
    }

    @Transactional
    public AlertDTOs.AlertDTO escalateAlert(Long id, String reason, String userName) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));

        int fromLevel = alert.getEscalationLevel() != null ? alert.getEscalationLevel() : 0;
        int toLevel = Math.min(2, fromLevel + 1);

        alert.setEscalationLevel(toLevel);
        alert.setStatus(AlertStatus.ESCALATED);
        alert.setLastEscalatedAt(LocalDateTime.now());

        String targetRole = toLevel == 1 ? "MINISTRY_ADMIN" : "SUPER_ADMIN";
        String targetAuthority = toLevel == 1 ? "Ministry Joint Secretary / Admin" : "National Monitoring Apex Committee";

        EscalationHistory hist = new EscalationHistory(alert, fromLevel, toLevel, reason != null ? reason : "Manual / Automated Escalation Protocol", targetRole, targetAuthority);
        escalationHistoryRepository.save(hist);

        Alert saved = alertRepository.save(alert);

        notificationService.sendNotification(
                targetRole,
                String.format("ALERT ESCALATED to Level %d: %s", toLevel, alert.getProject().getProjectName()),
                String.format("Alert '%s' has escalated to Level %d. Reason: %s", alert.getAlertType(), toLevel, reason),
                "ESCALATION",
                alert.getProject().getId(),
                "CRITICAL"
        );

        auditService.logAction(AuditAction.ESCALATE_ALERT, "Alert", alert.getId(), alert.getAlertType(),
                "Level " + fromLevel, "Level " + toLevel, "Escalated to " + targetAuthority);

        return toDTO(saved);
    }

    public AlertDTOs.AlertDTO toDTO(Alert a) {
        AlertDTOs.AlertDTO dto = new AlertDTOs.AlertDTO();
        dto.setId(a.getId());
        if (a.getProject() != null) {
            dto.setProjectId(a.getProject().getId());
            dto.setProjectName(a.getProject().getProjectName());
            dto.setProjectCode(a.getProject().getProjectCode());
            dto.setMinistry(a.getProject().getMinistry());
        }
        dto.setAlertType(a.getAlertType());
        dto.setSeverity(a.getSeverity());
        dto.setMessage(a.getMessage());
        dto.setAssignedTo(a.getAssignedTo());
        dto.setStatus(a.getStatus());
        dto.setEscalationLevel(a.getEscalationLevel());
        dto.setAcknowledgedAt(a.getAcknowledgedAt());
        dto.setAcknowledgedBy(a.getAcknowledgedBy());
        dto.setResolvedAt(a.getResolvedAt());
        dto.setResolvedBy(a.getResolvedBy());
        dto.setLastEscalatedAt(a.getLastEscalatedAt());
        dto.setResolutionNotes(a.getResolutionNotes());
        dto.setCreatedAt(a.getCreatedAt());

        List<EscalationHistory> history = escalationHistoryRepository.findByAlertIdOrderByEscalatedAtDesc(a.getId());
        dto.setEscalationHistory(history.stream().map(h -> {
            AlertDTOs.EscalationHistoryDTO hDto = new AlertDTOs.EscalationHistoryDTO();
            hDto.setId(h.getId());
            hDto.setFromLevel(h.getFromLevel());
            hDto.setToLevel(h.getToLevel());
            hDto.setEscalationReason(h.getEscalationReason());
            hDto.setEscalatedToRole(h.getEscalatedToRole());
            hDto.setEscalatedToUser(h.getEscalatedToUser());
            hDto.setAcknowledged(h.isAcknowledged());
            hDto.setEscalatedAt(h.getEscalatedAt());
            return hDto;
        }).collect(Collectors.toList()));

        return dto;
    }
}
