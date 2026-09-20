package gov.pragati.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_predictions")
public class RiskPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 30)
    private String predictedRiskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    private Double riskProbability;
    private Double delayProbability;
    private Double predictedDelayDays;

    @Column(columnDefinition = "TEXT")
    private String topRiskFactorsJson;

    @Column(columnDefinition = "TEXT")
    private String shapContributionsJson;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    public RiskPrediction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getPredictedRiskLevel() { return predictedRiskLevel; }
    public void setPredictedRiskLevel(String predictedRiskLevel) { this.predictedRiskLevel = predictedRiskLevel; }

    public Double getRiskProbability() { return riskProbability; }
    public void setRiskProbability(Double riskProbability) { this.riskProbability = riskProbability; }

    public Double getDelayProbability() { return delayProbability; }
    public void setDelayProbability(Double delayProbability) { this.delayProbability = delayProbability; }

    public Double getPredictedDelayDays() { return predictedDelayDays; }
    public void setPredictedDelayDays(Double predictedDelayDays) { this.predictedDelayDays = predictedDelayDays; }

    public String getTopRiskFactorsJson() { return topRiskFactorsJson; }
    public void setTopRiskFactorsJson(String topRiskFactorsJson) { this.topRiskFactorsJson = topRiskFactorsJson; }

    public String getShapContributionsJson() { return shapContributionsJson; }
    public void setShapContributionsJson(String shapContributionsJson) { this.shapContributionsJson = shapContributionsJson; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
