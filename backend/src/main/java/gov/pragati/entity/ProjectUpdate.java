package gov.pragati.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_updates")
public class ProjectUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private Double previousPhysicalProgress;
    private Double newPhysicalProgress;

    private Double previousActualCost;
    private Double newActualCost;

    private Double calculatedSpi;
    private Double calculatedCpi;
    private Integer calculatedHealthScore;
    private String calculatedRiskLevel;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(length = 255)
    private String sitePhotoUrl;

    @Column(nullable = false, length = 100)
    private String updatedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public ProjectUpdate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Double getPreviousPhysicalProgress() { return previousPhysicalProgress; }
    public void setPreviousPhysicalProgress(Double previousPhysicalProgress) { this.previousPhysicalProgress = previousPhysicalProgress; }

    public Double getNewPhysicalProgress() { return newPhysicalProgress; }
    public void setNewPhysicalProgress(Double newPhysicalProgress) { this.newPhysicalProgress = newPhysicalProgress; }

    public Double getPreviousActualCost() { return previousActualCost; }
    public void setPreviousActualCost(Double previousActualCost) { this.previousActualCost = previousActualCost; }

    public Double getNewActualCost() { return newActualCost; }
    public void setNewActualCost(Double newActualCost) { this.newActualCost = newActualCost; }

    public Double getCalculatedSpi() { return calculatedSpi; }
    public void setCalculatedSpi(Double calculatedSpi) { this.calculatedSpi = calculatedSpi; }

    public Double getCalculatedCpi() { return calculatedCpi; }
    public void setCalculatedCpi(Double calculatedCpi) { this.calculatedCpi = calculatedCpi; }

    public Integer getCalculatedHealthScore() { return calculatedHealthScore; }
    public void setCalculatedHealthScore(Integer calculatedHealthScore) { this.calculatedHealthScore = calculatedHealthScore; }

    public String getCalculatedRiskLevel() { return calculatedRiskLevel; }
    public void setCalculatedRiskLevel(String calculatedRiskLevel) { this.calculatedRiskLevel = calculatedRiskLevel; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getSitePhotoUrl() { return sitePhotoUrl; }
    public void setSitePhotoUrl(String sitePhotoUrl) { this.sitePhotoUrl = sitePhotoUrl; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
