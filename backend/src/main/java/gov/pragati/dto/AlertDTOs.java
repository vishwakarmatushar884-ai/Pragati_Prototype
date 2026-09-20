package gov.pragati.dto;

import gov.pragati.entity.AlertSeverity;
import gov.pragati.entity.AlertStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

public class AlertDTOs {

    public static class AlertDTO {
        private Long id;
        private Long projectId;
        private String projectName;
        private String projectCode;
        private String ministry;
        private String alertType;
        private AlertSeverity severity;
        private String message;
        private String assignedTo;
        private AlertStatus status;
        private Integer escalationLevel;
        private LocalDateTime acknowledgedAt;
        private String acknowledgedBy;
        private LocalDateTime resolvedAt;
        private String resolvedBy;
        private LocalDateTime lastEscalatedAt;
        private String resolutionNotes;
        private LocalDateTime createdAt;
        private List<EscalationHistoryDTO> escalationHistory;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getMinistry() { return ministry; }
        public void setMinistry(String ministry) { this.ministry = ministry; }
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }
        public AlertSeverity getSeverity() { return severity; }
        public void setSeverity(AlertSeverity severity) { this.severity = severity; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
        public AlertStatus getStatus() { return status; }
        public void setStatus(AlertStatus status) { this.status = status; }
        public Integer getEscalationLevel() { return escalationLevel; }
        public void setEscalationLevel(Integer escalationLevel) { this.escalationLevel = escalationLevel; }
        public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
        public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
        public String getAcknowledgedBy() { return acknowledgedBy; }
        public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
        public LocalDateTime getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
        public String getResolvedBy() { return resolvedBy; }
        public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
        public LocalDateTime getLastEscalatedAt() { return lastEscalatedAt; }
        public void setLastEscalatedAt(LocalDateTime lastEscalatedAt) { this.lastEscalatedAt = lastEscalatedAt; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public List<EscalationHistoryDTO> getEscalationHistory() { return escalationHistory; }
        public void setEscalationHistory(List<EscalationHistoryDTO> escalationHistory) { this.escalationHistory = escalationHistory; }
    }

    public static class EscalationHistoryDTO {
        private Long id;
        private Integer fromLevel;
        private Integer toLevel;
        private String escalationReason;
        private String escalatedToRole;
        private String escalatedToUser;
        private boolean acknowledged;
        private LocalDateTime escalatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Integer getFromLevel() { return fromLevel; }
        public void setFromLevel(Integer fromLevel) { this.fromLevel = fromLevel; }
        public Integer getToLevel() { return toLevel; }
        public void setToLevel(Integer toLevel) { this.toLevel = toLevel; }
        public String getEscalationReason() { return escalationReason; }
        public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }
        public String getEscalatedToRole() { return escalatedToRole; }
        public void setEscalatedToRole(String escalatedToRole) { this.escalatedToRole = escalatedToRole; }
        public String getEscalatedToUser() { return escalatedToUser; }
        public void setEscalatedToUser(String escalatedToUser) { this.escalatedToUser = escalatedToUser; }
        public boolean isAcknowledged() { return acknowledged; }
        public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }
        public LocalDateTime getEscalatedAt() { return escalatedAt; }
        public void setEscalatedAt(LocalDateTime escalatedAt) { this.escalatedAt = escalatedAt; }
    }

    public static class ResolveAlertRequest {
        @NotBlank(message = "Resolution notes are required")
        private String resolutionNotes;

        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class EscalateAlertRequest {
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
