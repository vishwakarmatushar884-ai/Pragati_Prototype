package gov.pragati.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_records")
public class FinancialRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 20)
    private String fiscalYear;

    @Column(nullable = false, length = 20)
    private String recordMonth; // e.g. "2024-06"

    private Double plannedExpenditure = 0.0;
    private Double actualExpenditure = 0.0;
    private Double committedExpenditure = 0.0;
    private Double cumulativeExpenditure = 0.0;
    private Double costVariance = 0.0;
    private Double cpiAtRecord = 1.0;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(length = 100)
    private String recordedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FinancialRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(String fiscalYear) { this.fiscalYear = fiscalYear; }

    public String getRecordMonth() { return recordMonth; }
    public void setRecordMonth(String recordMonth) { this.recordMonth = recordMonth; }

    public Double getPlannedExpenditure() { return plannedExpenditure; }
    public void setPlannedExpenditure(Double plannedExpenditure) { this.plannedExpenditure = plannedExpenditure; }

    public Double getActualExpenditure() { return actualExpenditure; }
    public void setActualExpenditure(Double actualExpenditure) { this.actualExpenditure = actualExpenditure; }

    public Double getCommittedExpenditure() { return committedExpenditure; }
    public void setCommittedExpenditure(Double committedExpenditure) { this.committedExpenditure = committedExpenditure; }

    public Double getCumulativeExpenditure() { return cumulativeExpenditure; }
    public void setCumulativeExpenditure(Double cumulativeExpenditure) { this.cumulativeExpenditure = cumulativeExpenditure; }

    public Double getCostVariance() { return costVariance; }
    public void setCostVariance(Double costVariance) { this.costVariance = costVariance; }

    public Double getCpiAtRecord() { return cpiAtRecord; }
    public void setCpiAtRecord(Double cpiAtRecord) { this.cpiAtRecord = cpiAtRecord; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
