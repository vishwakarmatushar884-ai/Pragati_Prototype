package gov.pragati.dto;

import gov.pragati.entity.MilestoneStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MilestoneDTOs {

    public static class MilestoneDTO {
        private Long id;
        private Long projectId;
        private String projectName;
        private String name;
        private String description;
        private LocalDate plannedStartDate;
        private LocalDate plannedEndDate;
        private LocalDate actualStartDate;
        private LocalDate actualEndDate;
        private Double weightagePercentage;
        private Double plannedProgress;
        private Double actualProgress;
        private MilestoneStatus status;
        private String responsibleOfficer;
        private boolean overdue;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getPlannedStartDate() { return plannedStartDate; }
        public void setPlannedStartDate(LocalDate plannedStartDate) { this.plannedStartDate = plannedStartDate; }
        public LocalDate getPlannedEndDate() { return plannedEndDate; }
        public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
        public LocalDate getActualStartDate() { return actualStartDate; }
        public void setActualStartDate(LocalDate actualStartDate) { this.actualStartDate = actualStartDate; }
        public LocalDate getActualEndDate() { return actualEndDate; }
        public void setActualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; }
        public Double getWeightagePercentage() { return weightagePercentage; }
        public void setWeightagePercentage(Double weightagePercentage) { this.weightagePercentage = weightagePercentage; }
        public Double getPlannedProgress() { return plannedProgress; }
        public void setPlannedProgress(Double plannedProgress) { this.plannedProgress = plannedProgress; }
        public Double getActualProgress() { return actualProgress; }
        public void setActualProgress(Double actualProgress) { this.actualProgress = actualProgress; }
        public MilestoneStatus getStatus() { return status; }
        public void setStatus(MilestoneStatus status) { this.status = status; }
        public String getResponsibleOfficer() { return responsibleOfficer; }
        public void setResponsibleOfficer(String responsibleOfficer) { this.responsibleOfficer = responsibleOfficer; }
        public boolean isOverdue() { return overdue; }
        public void setOverdue(boolean overdue) { this.overdue = overdue; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class CreateMilestoneRequest {
        @NotBlank(message = "Milestone name is required")
        private String name;

        private String description;

        @NotNull(message = "Planned start date is required")
        private LocalDate plannedStartDate;

        @NotNull(message = "Planned end date is required")
        private LocalDate plannedEndDate;

        private Double weightagePercentage = 10.0;
        private String responsibleOfficer;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getPlannedStartDate() { return plannedStartDate; }
        public void setPlannedStartDate(LocalDate plannedStartDate) { this.plannedStartDate = plannedStartDate; }
        public LocalDate getPlannedEndDate() { return plannedEndDate; }
        public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
        public Double getWeightagePercentage() { return weightagePercentage; }
        public void setWeightagePercentage(Double weightagePercentage) { this.weightagePercentage = weightagePercentage; }
        public String getResponsibleOfficer() { return responsibleOfficer; }
        public void setResponsibleOfficer(String responsibleOfficer) { this.responsibleOfficer = responsibleOfficer; }
    }

    public static class UpdateMilestoneRequest {
        private String name;
        private String description;
        private LocalDate actualStartDate;
        private LocalDate actualEndDate;
        private Double actualProgress;
        private MilestoneStatus status;
        private String responsibleOfficer;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getActualStartDate() { return actualStartDate; }
        public void setActualStartDate(LocalDate actualStartDate) { this.actualStartDate = actualStartDate; }
        public LocalDate getActualEndDate() { return actualEndDate; }
        public void setActualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; }
        public Double getActualProgress() { return actualProgress; }
        public void setActualProgress(Double actualProgress) { this.actualProgress = actualProgress; }
        public MilestoneStatus getStatus() { return status; }
        public void setStatus(MilestoneStatus status) { this.status = status; }
        public String getResponsibleOfficer() { return responsibleOfficer; }
        public void setResponsibleOfficer(String responsibleOfficer) { this.responsibleOfficer = responsibleOfficer; }
    }
}
