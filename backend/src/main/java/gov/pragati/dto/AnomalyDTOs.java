package gov.pragati.dto;

import gov.pragati.entity.AnomalySeverity;
import gov.pragati.entity.AnomalyStatus;
import java.time.LocalDateTime;

public class AnomalyDTOs {

    public static class AnomalyDTO {
        private Long id;
        private Long projectId;
        private String projectName;
        private String projectCode;
        private String ministry;
        private String anomalyType;
        private String description;
        private AnomalySeverity severity;
        private AnomalyStatus status;
        private LocalDateTime detectedAt;
        private LocalDateTime resolvedAt;
        private String resolvedBy;
        private String resolutionNotes;

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
        public String getAnomalyType() { return anomalyType; }
        public void setAnomalyType(String anomalyType) { this.anomalyType = anomalyType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public AnomalySeverity getSeverity() { return severity; }
        public void setSeverity(AnomalySeverity severity) { this.severity = severity; }
        public AnomalyStatus getStatus() { return status; }
        public void setStatus(AnomalyStatus status) { this.status = status; }
        public LocalDateTime getDetectedAt() { return detectedAt; }
        public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
        public LocalDateTime getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
        public String getResolvedBy() { return resolvedBy; }
        public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class ResolveAnomalyRequest {
        private String resolutionNotes;

        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }
}
