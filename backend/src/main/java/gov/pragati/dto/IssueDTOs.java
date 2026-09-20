package gov.pragati.dto;

import gov.pragati.entity.IssueCategory;
import gov.pragati.entity.IssuePriority;
import gov.pragati.entity.IssueStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class IssueDTOs {

    public static class IssueDTO {
        private Long id;
        private Long projectId;
        private String projectName;
        private String projectCode;
        private String ministry;
        private String title;
        private String description;
        private IssueCategory category;
        private IssuePriority priority;
        private IssueStatus status;
        private String assignedTo;
        private String reportedBy;
        private LocalDate dueDate;
        private LocalDate resolvedDate;
        private String actionRequired;
        private String resolution;
        private List<IssueCommentDTO> comments;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

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
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public IssueCategory getCategory() { return category; }
        public void setCategory(IssueCategory category) { this.category = category; }
        public IssuePriority getPriority() { return priority; }
        public void setPriority(IssuePriority priority) { this.priority = priority; }
        public IssueStatus getStatus() { return status; }
        public void setStatus(IssueStatus status) { this.status = status; }
        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
        public String getReportedBy() { return reportedBy; }
        public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public LocalDate getResolvedDate() { return resolvedDate; }
        public void setResolvedDate(LocalDate resolvedDate) { this.resolvedDate = resolvedDate; }
        public String getActionRequired() { return actionRequired; }
        public void setActionRequired(String actionRequired) { this.actionRequired = actionRequired; }
        public String getResolution() { return resolution; }
        public void setResolution(String resolution) { this.resolution = resolution; }
        public List<IssueCommentDTO> getComments() { return comments; }
        public void setComments(List<IssueCommentDTO> comments) { this.comments = comments; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class CreateIssueRequest {
        @NotNull(message = "Project ID is required")
        private Long projectId;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        private IssueCategory category = IssueCategory.OTHER;
        private IssuePriority priority = IssuePriority.MEDIUM;
        private String assignedTo;
        private LocalDate dueDate;
        private String actionRequired;

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public IssueCategory getCategory() { return category; }
        public void setCategory(IssueCategory category) { this.category = category; }
        public IssuePriority getPriority() { return priority; }
        public void setPriority(IssuePriority priority) { this.priority = priority; }
        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public String getActionRequired() { return actionRequired; }
        public void setActionRequired(String actionRequired) { this.actionRequired = actionRequired; }
    }

    public static class UpdateIssueRequest {
        private String title;
        private String description;
        private IssueCategory category;
        private IssuePriority priority;
        private IssueStatus status;
        private String assignedTo;
        private LocalDate dueDate;
        private String actionRequired;
        private String resolution;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public IssueCategory getCategory() { return category; }
        public void setCategory(IssueCategory category) { this.category = category; }
        public IssuePriority getPriority() { return priority; }
        public void setPriority(IssuePriority priority) { this.priority = priority; }
        public IssueStatus getStatus() { return status; }
        public void setStatus(IssueStatus status) { this.status = status; }
        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public String getActionRequired() { return actionRequired; }
        public void setActionRequired(String actionRequired) { this.actionRequired = actionRequired; }
        public String getResolution() { return resolution; }
        public void setResolution(String resolution) { this.resolution = resolution; }
    }

    public static class ResolveIssueRequest {
        @NotBlank(message = "Resolution is required")
        private String resolution;

        public String getResolution() { return resolution; }
        public void setResolution(String resolution) { this.resolution = resolution; }
    }

    public static class IssueCommentDTO {
        private Long id;
        private String authorName;
        private String authorRole;
        private String content;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        public String getAuthorRole() { return authorRole; }
        public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class AddCommentRequest {
        @NotBlank(message = "Comment content is required")
        private String content;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
