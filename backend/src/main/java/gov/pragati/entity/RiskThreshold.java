package gov.pragati.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "risk_thresholds")
public class RiskThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    private Double minSpi;
    private Double maxSpi;

    private Double minCpi;
    private Double maxCpi;

    private Integer minHealthScore;
    private Integer maxHealthScore;

    @Column(length = 200)
    private String description;

    public RiskThreshold() {}

    public RiskThreshold(String riskLevel, Double minSpi, Double maxSpi, Double minCpi, Double maxCpi, Integer minHealthScore, Integer maxHealthScore, String description) {
        this.riskLevel = riskLevel;
        this.minSpi = minSpi;
        this.maxSpi = maxSpi;
        this.minCpi = minCpi;
        this.maxCpi = maxCpi;
        this.minHealthScore = minHealthScore;
        this.maxHealthScore = maxHealthScore;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getMinSpi() { return minSpi; }
    public void setMinSpi(Double minSpi) { this.minSpi = minSpi; }

    public Double getMaxSpi() { return maxSpi; }
    public void setMaxSpi(Double maxSpi) { this.maxSpi = maxSpi; }

    public Double getMinCpi() { return minCpi; }
    public void setMinCpi(Double minCpi) { this.minCpi = minCpi; }

    public Double getMaxCpi() { return maxCpi; }
    public void setMaxCpi(Double maxCpi) { this.maxCpi = maxCpi; }

    public Integer getMinHealthScore() { return minHealthScore; }
    public void setMinHealthScore(Integer minHealthScore) { this.minHealthScore = minHealthScore; }

    public Integer getMaxHealthScore() { return maxHealthScore; }
    public void setMaxHealthScore(Integer maxHealthScore) { this.maxHealthScore = maxHealthScore; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
