package gov.pragati.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_code", unique = true, nullable = false, length = 50)
    private String projectCode;

    @Column(name = "project_name", nullable = false, length = 255)
    private String projectName;

    @Column(nullable = false, length = 150)
    private String ministry;

    @Column(length = 150)
    private String department;

    @Column(length = 150)
    private String scheme;

    @Column(nullable = false, length = 100)
    private String sector;

    @Column(columnDefinition = "TEXT")
    private String projectDescription;

    @Column(length = 150)
    private String projectManager;

    @Column(length = 150)
    private String implementingAgency;

    @Column(length = 150)
    private String contractor;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(length = 100)
    private String district;

    @Column(length = 150)
    private String location;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate plannedEndDate;

    private LocalDate revisedEndDate;
    private LocalDate actualCompletionDate;

    // Financial & EVM Attributes (in Crores INR)
    @Column(nullable = false)
    private Double projectBudget = 0.0;

    private Double approvedCost = 0.0;
    private Double plannedCost = 0.0;     // PV (Planned Value)
    private Double actualCost = 0.0;      // AC (Actual Cost)
    private Double earnedValue = 0.0;     // EV (Earned Value)

    // Progress
    private Double physicalProgress = 0.0; // Actual physical progress %
    private Double plannedProgress = 0.0;  // Planned physical progress %
    private Double financialProgress = 0.0;// Financial expenditure %

    // EVM Calculated Metrics
    private Double spi = 1.0;              // SPI = EV / PV
    private Double cpi = 1.0;              // CPI = EV / AC
    private Double scheduleVariance = 0.0; // SV = EV - PV
    private Double costVariance = 0.0;     // CV = EV - AC

    @Column(length = 30)
    private String currentStatus = "IN_PROGRESS"; // NOT_STARTED, IN_PROGRESS, DELAYED, ON_HOLD, COMPLETED

    @Column(length = 30)
    private String priority = "MEDIUM";           // LOW, MEDIUM, HIGH, CRITICAL

    @Column(length = 30)
    private String riskLevel = "LOW";             // LOW, MEDIUM, HIGH, CRITICAL

    private Integer healthScore = 100;            // 0 - 100

    // AI Predictions
    private Double aiRiskProbability = 0.0;
    private Double aiPredictedDelayDays = 0.0;

    @Column(columnDefinition = "TEXT")
    private String aiExplanationSummary;

    private Long managerId;
    private Long fieldOfficerId;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public Project() {}

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
}
