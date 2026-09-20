package gov.pragati.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class FinancialDTOs {

    public static class FinancialRecordDTO {
        private Long id;
        private Long projectId;
        private String projectName;
        private String fiscalYear;
        private String recordMonth;
        private Double plannedExpenditure;
        private Double actualExpenditure;
        private Double committedExpenditure;
        private Double cumulativeExpenditure;
        private Double costVariance;
        private Double cpiAtRecord;
        private String remarks;
        private String recordedBy;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
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

    public static class CreateFinancialRequest {
        @NotBlank(message = "Fiscal year is required")
        private String fiscalYear;

        @NotBlank(message = "Record month is required")
        private String recordMonth;

        @NotNull(message = "Planned expenditure is required")
        private Double plannedExpenditure;

        @NotNull(message = "Actual expenditure is required")
        private Double actualExpenditure;

        private Double committedExpenditure = 0.0;
        private String remarks;

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
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
