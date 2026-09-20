package gov.pragati.dto;

import gov.pragati.entity.AuditAction;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CommonDTOs {

    public static class NotificationDTO {
        private Long id;
        private String recipientUser;
        private String title;
        private String message;
        private String type;
        private Long relatedProjectId;
        private Long relatedEntityId;
        private String severity;
        private boolean isRead;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRecipientUser() { return recipientUser; }
        public void setRecipientUser(String recipientUser) { this.recipientUser = recipientUser; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Long getRelatedProjectId() { return relatedProjectId; }
        public void setRelatedProjectId(Long relatedProjectId) { this.relatedProjectId = relatedProjectId; }
        public Long getRelatedEntityId() { return relatedEntityId; }
        public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class AuditLogDTO {
        private Long id;
        private String userEmail;
        private String userRole;
        private AuditAction action;
        private String entityType;
        private Long entityId;
        private String entityName;
        private String oldValue;
        private String newValue;
        private String description;
        private String ipAddress;
        private LocalDateTime timestamp;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getUserRole() { return userRole; }
        public void setUserRole(String userRole) { this.userRole = userRole; }
        public AuditAction getAction() { return action; }
        public void setAction(AuditAction action) { this.action = action; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public Long getEntityId() { return entityId; }
        public void setEntityId(Long entityId) { this.entityId = entityId; }
        public String getEntityName() { return entityName; }
        public void setEntityName(String entityName) { this.entityName = entityName; }
        public String getOldValue() { return oldValue; }
        public void setOldValue(String oldValue) { this.oldValue = oldValue; }
        public String getNewValue() { return newValue; }
        public void setNewValue(String newValue) { this.newValue = newValue; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public static class DocumentDTO {
        private Long id;
        private Long projectId;
        private String projectName;
        private String title;
        private String documentType;
        private String fileUrl;
        private Long fileSize;
        private String uploadedBy;
        private LocalDateTime uploadedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
        public String getUploadedBy() { return uploadedBy; }
        public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
        public LocalDateTime getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    }

    public static class SystemSettingsDTO {
        private Map<String, String> thresholds;
        private Map<String, Integer> weights;
        private Map<String, String> general;

        public Map<String, String> getThresholds() { return thresholds; }
        public void setThresholds(Map<String, String> thresholds) { this.thresholds = thresholds; }
        public Map<String, Integer> getWeights() { return weights; }
        public void setWeights(Map<String, Integer> weights) { this.weights = weights; }
        public Map<String, String> getGeneral() { return general; }
        public void setGeneral(Map<String, String> general) { this.general = general; }
    }

    public static class ReportSummaryDTO {
        private String reportType;
        private LocalDateTime generatedAt;
        private String generatedBy;
        private Map<String, String> filtersApplied;
        private DashboardDTOs.PortfolioSummaryDTO summary;
        private List<ProjectDTOs.ProjectDTO> projects;

        public String getReportType() { return reportType; }
        public void setReportType(String reportType) { this.reportType = reportType; }
        public LocalDateTime getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
        public String getGeneratedBy() { return generatedBy; }
        public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
        public Map<String, String> getFiltersApplied() { return filtersApplied; }
        public void setFiltersApplied(Map<String, String> filtersApplied) { this.filtersApplied = filtersApplied; }
        public DashboardDTOs.PortfolioSummaryDTO getSummary() { return summary; }
        public void setSummary(DashboardDTOs.PortfolioSummaryDTO summary) { this.summary = summary; }
        public List<ProjectDTOs.ProjectDTO> getProjects() { return projects; }
        public void setProjects(List<ProjectDTOs.ProjectDTO> projects) { this.projects = projects; }
    }
}
