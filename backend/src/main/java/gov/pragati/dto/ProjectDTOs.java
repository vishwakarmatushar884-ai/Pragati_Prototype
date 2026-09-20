package gov.pragati.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectDTOs {

    public static class ProjectDTO {
        private Long id;
        private String projectCode;
        private String projectName;
        private String ministry;
        private String department;
        private String scheme;
        private String sector;
        private String projectDescription;
        private String projectManager;
        private String implementingAgency;
        private String contractor;
        private String state;
        private String district;
        private String location;
        private Double latitude;
        private Double longitude;
        private LocalDate startDate;
        private LocalDate plannedEndDate;
        private LocalDate revisedEndDate;
        private LocalDate actualCompletionDate;
        private Double projectBudget;
        private Double approvedCost;
        private Double plannedCost;
        private Double actualCost;
        private Double earnedValue;
        private Double physicalProgress;
        private Double plannedProgress;
        private Double financialProgress;
        private Double spi;
        private Double cpi;
        private Double scheduleVariance;
        private Double costVariance;
        private String currentStatus;
        private String priority;
        private String riskLevel;
        private Integer healthScore;
        private Double aiRiskProbability;
        private Double aiPredictedDelayDays;
        private String aiExplanationSummary;
        private Long managerId;
        private Long fieldOfficerId;
        private LocalDateTime createdAt;
        private LocalDateTime lastUpdated;
        private long openIssuesCount;
        private long criticalIssuesCount;
        private long overdueMilestonesCount;
        private long activeAlertsCount;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getMinistry() { return ministry; }
        public void setMinistry(String ministry) { this.ministry = ministry; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getScheme() { return scheme; }
        public void setScheme(String scheme) { this.scheme = scheme; }
        public String getSector() { return sector; }
        public void setSector(String sector) { this.sector = sector; }
        public String getProjectDescription() { return projectDescription; }
        public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }
        public String getProjectManager() { return projectManager; }
        public void setProjectManager(String projectManager) { this.projectManager = projectManager; }
        public String getImplementingAgency() { return implementingAgency; }
        public void setImplementingAgency(String implementingAgency) { this.implementingAgency = implementingAgency; }
        public String getContractor() { return contractor; }
        public void setContractor(String contractor) { this.contractor = contractor; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getPlannedEndDate() { return plannedEndDate; }
        public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
        public LocalDate getRevisedEndDate() { return revisedEndDate; }
        public void setRevisedEndDate(LocalDate revisedEndDate) { this.revisedEndDate = revisedEndDate; }
        public LocalDate getActualCompletionDate() { return actualCompletionDate; }
        public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }
        public Double getProjectBudget() { return projectBudget; }
        public void setProjectBudget(Double projectBudget) { this.projectBudget = projectBudget; }
        public Double getApprovedCost() { return approvedCost; }
        public void setApprovedCost(Double approvedCost) { this.approvedCost = approvedCost; }
        public Double getPlannedCost() { return plannedCost; }
        public void setPlannedCost(Double plannedCost) { this.plannedCost = plannedCost; }
        public Double getActualCost() { return actualCost; }
        public void setActualCost(Double actualCost) { this.actualCost = actualCost; }
        public Double getEarnedValue() { return earnedValue; }
        public void setEarnedValue(Double earnedValue) { this.earnedValue = earnedValue; }
        public Double getPhysicalProgress() { return physicalProgress; }
        public void setPhysicalProgress(Double physicalProgress) { this.physicalProgress = physicalProgress; }
        public Double getPlannedProgress() { return plannedProgress; }
        public void setPlannedProgress(Double plannedProgress) { this.plannedProgress = plannedProgress; }
        public Double getFinancialProgress() { return financialProgress; }
        public void setFinancialProgress(Double financialProgress) { this.financialProgress = financialProgress; }
        public Double getSpi() { return spi; }
        public void setSpi(Double spi) { this.spi = spi; }
        public Double getCpi() { return cpi; }
        public void setCpi(Double cpi) { this.cpi = cpi; }
        public Double getScheduleVariance() { return scheduleVariance; }
        public void setScheduleVariance(Double scheduleVariance) { this.scheduleVariance = scheduleVariance; }
        public Double getCostVariance() { return costVariance; }
        public void setCostVariance(Double costVariance) { this.costVariance = costVariance; }
        public String getCurrentStatus() { return currentStatus; }
        public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public Integer getHealthScore() { return healthScore; }
        public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }
        public Double getAiRiskProbability() { return aiRiskProbability; }
        public void setAiRiskProbability(Double aiRiskProbability) { this.aiRiskProbability = aiRiskProbability; }
        public Double getAiPredictedDelayDays() { return aiPredictedDelayDays; }
        public void setAiPredictedDelayDays(Double aiPredictedDelayDays) { this.aiPredictedDelayDays = aiPredictedDelayDays; }
        public String getAiExplanationSummary() { return aiExplanationSummary; }
        public void setAiExplanationSummary(String aiExplanationSummary) { this.aiExplanationSummary = aiExplanationSummary; }
        public Long getManagerId() { return managerId; }
        public void setManagerId(Long managerId) { this.managerId = managerId; }
        public Long getFieldOfficerId() { return fieldOfficerId; }
        public void setFieldOfficerId(Long fieldOfficerId) { this.fieldOfficerId = fieldOfficerId; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
        public long getOpenIssuesCount() { return openIssuesCount; }
        public void setOpenIssuesCount(long openIssuesCount) { this.openIssuesCount = openIssuesCount; }
        public long getCriticalIssuesCount() { return criticalIssuesCount; }
        public void setCriticalIssuesCount(long criticalIssuesCount) { this.criticalIssuesCount = criticalIssuesCount; }
        public long getOverdueMilestonesCount() { return overdueMilestonesCount; }
        public void setOverdueMilestonesCount(long overdueMilestonesCount) { this.overdueMilestonesCount = overdueMilestonesCount; }
        public long getActiveAlertsCount() { return activeAlertsCount; }
        public void setActiveAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; }
    }

    public static class CreateProjectRequest {
        @NotBlank(message = "Project code is required")
        private String projectCode;

        @NotBlank(message = "Project name is required")
        private String projectName;

        @NotBlank(message = "Ministry is required")
        private String ministry;

        private String department;
        private String scheme;

        @NotBlank(message = "Sector is required")
        private String sector;

        private String projectDescription;
        private String projectManager;
        private String implementingAgency;
        private String contractor;

        @NotBlank(message = "State is required")
        private String state;

        private String district;
        private String location;
        private Double latitude;
        private Double longitude;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "Planned end date is required")
        private LocalDate plannedEndDate;

        @NotNull(message = "Project budget is required")
        @DecimalMin(value = "0.0", message = "Project budget cannot be negative")
        private Double projectBudget;

        private Double approvedCost;
        private String priority = "MEDIUM";

        // Getters and Setters
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getMinistry() { return ministry; }
        public void setMinistry(String ministry) { this.ministry = ministry; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getScheme() { return scheme; }
        public void setScheme(String scheme) { this.scheme = scheme; }
        public String getSector() { return sector; }
        public void setSector(String sector) { this.sector = sector; }
        public String getProjectDescription() { return projectDescription; }
        public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }
        public String getProjectManager() { return projectManager; }
        public void setProjectManager(String projectManager) { this.projectManager = projectManager; }
        public String getImplementingAgency() { return implementingAgency; }
        public void setImplementingAgency(String implementingAgency) { this.implementingAgency = implementingAgency; }
        public String getContractor() { return contractor; }
        public void setContractor(String contractor) { this.contractor = contractor; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getPlannedEndDate() { return plannedEndDate; }
        public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
        public Double getProjectBudget() { return projectBudget; }
        public void setProjectBudget(Double projectBudget) { this.projectBudget = projectBudget; }
        public Double getApprovedCost() { return approvedCost; }
        public void setApprovedCost(Double approvedCost) { this.approvedCost = approvedCost; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class UpdateProjectRequest {
        private String projectName;
        private String ministry;
        private String department;
        private String scheme;
        private String sector;
        private String projectDescription;
        private String projectManager;
        private String implementingAgency;
        private String contractor;
        private String state;
        private String district;
        private String location;
        private Double latitude;
        private Double longitude;
        private LocalDate plannedEndDate;
        private LocalDate revisedEndDate;
        private Double approvedCost;
        private String currentStatus;
        private String priority;

        // Getters and Setters
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getMinistry() { return ministry; }
        public void setMinistry(String ministry) { this.ministry = ministry; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getScheme() { return scheme; }
        public void setScheme(String scheme) { this.scheme = scheme; }
        public String getSector() { return sector; }
        public void setSector(String sector) { this.sector = sector; }
        public String getProjectDescription() { return projectDescription; }
        public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }
        public String getProjectManager() { return projectManager; }
        public void setProjectManager(String projectManager) { this.projectManager = projectManager; }
        public String getImplementingAgency() { return implementingAgency; }
        public void setImplementingAgency(String implementingAgency) { this.implementingAgency = implementingAgency; }
        public String getContractor() { return contractor; }
        public void setContractor(String contractor) { this.contractor = contractor; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getDistrict() { return district; }
        public void setDistrict(String district) { this.district = district; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public LocalDate getPlannedEndDate() { return plannedEndDate; }
        public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; }
        public LocalDate getRevisedEndDate() { return revisedEndDate; }
        public void setRevisedEndDate(LocalDate revisedEndDate) { this.revisedEndDate = revisedEndDate; }
        public Double getApprovedCost() { return approvedCost; }
        public void setApprovedCost(Double approvedCost) { this.approvedCost = approvedCost; }
        public String getCurrentStatus() { return currentStatus; }
        public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class ProgressUpdateRequest {
        @NotNull(message = "Physical progress is required")
        private Double physicalProgress;

        private Double plannedProgress;
        private Double actualCost;
        private String remarks;
        private String sitePhotoUrl;

        public Double getPhysicalProgress() { return physicalProgress; }
        public void setPhysicalProgress(Double physicalProgress) { this.physicalProgress = physicalProgress; }
        public Double getPlannedProgress() { return plannedProgress; }
        public void setPlannedProgress(Double plannedProgress) { this.plannedProgress = plannedProgress; }
        public Double getActualCost() { return actualCost; }
        public void setActualCost(Double actualCost) { this.actualCost = actualCost; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        public String getSitePhotoUrl() { return sitePhotoUrl; }
        public void setSitePhotoUrl(String sitePhotoUrl) { this.sitePhotoUrl = sitePhotoUrl; }
    }
}
